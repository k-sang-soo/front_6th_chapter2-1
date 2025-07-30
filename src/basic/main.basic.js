import { PRODUCT_INFO, QUANTITY_THRESHOLDS, MESSAGES, DISCOUNT_LABELS } from './constants.js';

import {
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  calculateCartTotalQuantity,
  getCartItemDetails,
  isCartEmpty,
} from './services/CartService.js';

import { calculateTotalDiscount } from './services/DiscountService.js';

import { calculateTotalPoints, generatePointsDisplayHTML } from './services/PointService.js';

import { initializeTimers } from './services/TimerService.js';

import {
  createHeader,
  createProductSelector,
  createHelpModalButton,
  createHelpModalOverlay,
  createCartItemElement,
  createOrderSummary,
  updateCartItemDisplay,
} from './components/UIComponents.js';

import { findProductById, formatPrice, extractNumberFromElement } from './utils/domUtils.js';

// UICommon functions are now inlined for better readability

/**
 * 애플리케이션 전체 상태를 관리하는 중앙 상태 객체
 * 전역 변수를 캡슐화하여 상태 관리를 체계적으로 처리합니다.
 */
const AppState = {
  // 데이터 상태
  products: [],
  lastSelectedProductId: null,

  // UI 엘리먼트 참조
  ui: {
    stockInfoElement: null,
    productSelector: null,
    addToCartButton: null,
    cartDisplayArea: null,
    orderSummaryElement: null,
  },

  /**
   * 상품 목록을 초기화합니다.
   * @param {Array} productInfo - 상품 정보 배열
   */
  initializeProducts(productInfo) {
    this.products = productInfo.map((product) => ({
      id: product.id,
      name: product.name,
      val: product.price,
      originalVal: product.price,
      q: product.initialStock,
      onSale: false,
      suggestSale: false,
    }));
  },

  /**
   * 상품 정보를 업데이트합니다.
   * @param {string} productId - 상품 ID
   * @param {Object} updates - 업데이트할 정보
   * @returns {boolean} 업데이트 성공 여부
   */
  updateProduct(productId, updates) {
    const productIndex = this.products.findIndex((p) => p.id === productId);
    if (productIndex === -1) {
      return false;
    }

    this.products[productIndex] = {
      ...this.products[productIndex],
      ...updates,
    };
    return true;
  },

  /**
   * 특정 상품을 조회합니다.
   * @param {string} productId - 상품 ID
   * @returns {Object|null} 상품 정보 또는 null
   */
  getProduct(productId) {
    return this.products.find((p) => p.id === productId) || null;
  },

  /**
   * UI 엘리먼트 참조를 설정합니다.
   * @param {string} elementName - 엘리먼트 이름
   * @param {HTMLElement} element - DOM 엘리먼트
   */
  setUIElement(elementName, element) {
    if (Object.prototype.hasOwnProperty.call(this.ui, elementName)) {
      this.ui[elementName] = element;
    } else {
      // Development warning for invalid UI element registration
      // console.warn(`Unknown UI element: ${elementName}`);
    }
  },

  /**
   * 마지막 선택 상품 ID를 설정합니다.
   * @param {string} productId - 상품 ID
   */
  setLastSelectedProduct(productId) {
    this.lastSelectedProductId = productId;
  },

  /**
   * 마지막 선택 상품 ID를 반환합니다.
   * @returns {string|null} 마지막 선택 상품 ID
   */
  getLastSelectedProduct() {
    return this.lastSelectedProductId;
  },
};
/**
 * 메인 애플리케이션 초기화 함수
 * DOM 구조를 생성하고 이벤트 리스너를 설정합니다.
 */
function main() {
  const rootElement = document.getElementById('app');
  let headerElement;
  let gridContainer;
  let leftColumn;
  let selectorContainer;
  let rightColumn;
  let manualToggle;
  let manualOverlay;
  let manualColumn;

  // 애플리케이션 상태 초기화
  AppState.initializeProducts(PRODUCT_INFO);
  // DOM 엘리먼트 생성
  headerElement = document.createElement('div');
  headerElement.innerHTML = createHeader();
  // 상품 선택 컴포넌트 생성 및 UI 엘리먼트 등록
  selectorContainer = document.createElement('div');
  selectorContainer.innerHTML = createProductSelector();
  AppState.setUIElement('productSelector', selectorContainer.querySelector('#product-select'));
  AppState.setUIElement('addToCartButton', selectorContainer.querySelector('#add-to-cart'));
  AppState.setUIElement('stockInfoElement', selectorContainer.querySelector('#stock-status'));

  gridContainer = document.createElement('div');
  leftColumn = document.createElement('div');
  leftColumn.className = 'w-1/2 p-4';
  gridContainer.className = 'container mx-auto p-4 flex gap-6';
  leftColumn.appendChild(selectorContainer);
  const cartDisplayArea = document.createElement('section');
  leftColumn.appendChild(cartDisplayArea);
  cartDisplayArea.id = 'cart-items';
  cartDisplayArea.setAttribute('aria-label', 'Shopping cart items');
  cartDisplayArea.setAttribute('aria-live', 'polite');
  AppState.setUIElement('cartDisplayArea', cartDisplayArea);

  rightColumn = document.createElement('div');
  rightColumn.innerHTML = createOrderSummary();
  AppState.setUIElement('orderSummaryElement', rightColumn.querySelector('#cart-total'));

  // 도움말 모달 컴포넌트 생성
  manualToggle = document.createElement('div');
  manualToggle.innerHTML = createHelpModalButton();

  manualOverlay = document.createElement('div');
  manualOverlay.innerHTML = createHelpModalOverlay();
  manualColumn = manualOverlay.querySelector('#help-modal-panel');
  gridContainer.appendChild(leftColumn);
  gridContainer.appendChild(rightColumn);
  manualOverlay.appendChild(manualColumn);
  rootElement.appendChild(headerElement);
  rootElement.appendChild(gridContainer);
  rootElement.appendChild(manualToggle);
  rootElement.appendChild(manualOverlay);
  // 초기 재고 총계 계산 (디버깅용)
  // const initialTotalStock = AppState.products.reduce((total, product) => total + product.q, 0);
  // Initial stock logging for debugging
  // console.info('Initial total stock:', initialTotalStock);
  updateProductSelectOptions();
  calculateCartTotals();

  // 타이머 서비스로 할인 이벤트 초기화
  initializeTimers(
    AppState.products,
    () => AppState.getLastSelectedProduct(),
    () => {
      updateProductSelectOptions();
      updateCartItemPrices();
    },
    () => isCartEmpty(AppState.ui.cartDisplayArea.children),
  );

  // 도움말 모달 이벤트 리스너 설정
  const helpToggleButton = document.getElementById('help-modal-toggle');
  const helpOverlay = document.getElementById('help-modal-overlay');
  const helpPanel = document.getElementById('help-modal-panel');
  const helpCloseButton = document.getElementById('help-modal-close');

  helpToggleButton.onclick = () => {
    helpOverlay.classList.toggle('hidden');
    helpPanel.classList.toggle('translate-x-full');
  };

  helpOverlay.onclick = (e) => {
    if (e.target === helpOverlay) {
      helpOverlay.classList.add('hidden');
      helpPanel.classList.add('translate-x-full');
    }
  };

  helpCloseButton.onclick = () => {
    helpOverlay.classList.add('hidden');
    helpPanel.classList.add('translate-x-full');
  };
}

// AppState 객체로 이동되었습니다.

/**
 * 전체 상품의 총 재고를 계산합니다.
 * @returns {number} 전체 재고 수량
 */
function calculateTotalStock() {
  return AppState.products.reduce((total, product) => total + product.q, 0);
}

/**
 * 상품의 할인 정보 텍스트를 생성합니다.
 * @param {Object} product - 상품 정보
 * @returns {string} 할인 정보 텍스트
 */
function generateDiscountText(product) {
  const discountLabels = [
    product.onSale && DISCOUNT_LABELS.LIGHTNING_SALE,
    product.suggestSale && DISCOUNT_LABELS.SUGGESTION_SALE,
  ].filter(Boolean);

  return discountLabels.length > 0 ? ` ${discountLabels.join(' ')}` : '';
}

/**
 * 상품 할인 상태에 따른 옵션 설정을 반환합니다.
 * @param {Object} product - 상품 정보
 * @returns {Object} 옵션 설정 객체
 */
function getProductOptionConfig(product) {
  const discountText = generateDiscountText(product);

  if (product.q === 0) {
    return {
      textContent: `${product.name} - ${product.val}원 (${MESSAGES.OUT_OF_STOCK})${discountText}`,
      disabled: true,
      className: 'text-gray-400',
    };
  }

  const discountConfigs = [
    {
      condition: product.onSale && product.suggestSale,
      textContent: `${DISCOUNT_LABELS.SUPER_SALE}${product.name} - ${product.originalVal}원 → ${product.val}원 (${DISCOUNT_LABELS.SUPER_DISCOUNT})`,
      className: 'text-purple-600 font-bold',
    },
    {
      condition: product.onSale,
      textContent: `⚡${product.name} - ${product.originalVal}원 → ${product.val}원 (${DISCOUNT_LABELS.LIGHTNING_DISCOUNT})`,
      className: 'text-red-500 font-bold',
    },
    {
      condition: product.suggestSale,
      textContent: `💝${product.name} - ${product.originalVal}원 → ${product.val}원 (${DISCOUNT_LABELS.SUGGESTION_DISCOUNT})`,
      className: 'text-blue-500 font-bold',
    },
  ];

  const matchedConfig = discountConfigs.find((config) => config.condition);

  return (
    matchedConfig || {
      textContent: `${product.name} - ${product.val}원${discountText}`,
      disabled: false,
      className: '',
    }
  );
}

/**
 * 상품 옵션 엘리먼트를 생성합니다.
 * @param {Object} product - 상품 정보
 * @returns {HTMLOptionElement} 생성된 옵션 엘리먼트
 */
function createProductOption(product) {
  const optionElement = document.createElement('option');
  const config = getProductOptionConfig(product);

  optionElement.value = product.id;
  optionElement.textContent = config.textContent;
  optionElement.disabled = config.disabled || false;
  optionElement.className = config.className;

  return optionElement;
}

/**
 * 재고 상황에 따라 상품 선택 드롭다운의 시각적 표시를 업데이트합니다.
 * @param {number} totalStock - 전체 재고 수량
 */
function updateSelectVisualFeedback(totalStock) {
  const productSelector = AppState.ui.productSelector;
  if (totalStock < QUANTITY_THRESHOLDS.STOCK_WARNING_THRESHOLD) {
    productSelector.style.borderColor = 'orange';
  } else {
    productSelector.style.borderColor = '';
  }
}

/**
 * 상품 선택 드롭다운 옵션을 업데이트합니다.
 * 재고 상태와 할인 정보를 반영하여 옵션을 생성합니다.
 */
function updateProductSelectOptions() {
  const productSelector = AppState.ui.productSelector;
  productSelector.innerHTML = '';

  const totalStock = calculateTotalStock();

  // 각 상품별 옵션 생성
  AppState.products
    .map((product) => createProductOption(product))
    .forEach((optionElement) => productSelector.appendChild(optionElement));

  updateSelectVisualFeedback(totalStock);
}
/**
 * 장바구니 내 아이템의 소계와 총 수량을 계산합니다.
 * @returns {Object} 계산 결과 객체
 */
function calculateSubtotalAndQuantity() {
  const cartItems = AppState.ui.cartDisplayArea.children;
  const totalItemCount = calculateCartTotalQuantity(cartItems);
  const cartItemDetails = getCartItemDetails(cartItems, AppState.products);
  const discountResult = calculateTotalDiscount(cartItemDetails, totalItemCount);

  return {
    cartItems,
    totalItemCount,
    cartItemDetails,
    discountResult,
    subtotal: discountResult.subtotal,
    totalAmount: discountResult.finalAmount,
  };
}

/**
 * 대량 구매 시 장바구니 아이템의 가격 표시를 강조합니다.
 * @param {HTMLCollection} cartItems - 장바구니 아이템 목록
 */
function updateBulkPurchaseVisualFeedback(cartItems) {
  Array.from(cartItems).forEach((cartItem) => {
    const quantityElement = cartItem.querySelector('.quantity-number');
    const quantity = parseInt(quantityElement.textContent);
    const priceElements = cartItem.querySelectorAll('.text-lg, .text-xs');

    priceElements.forEach((element) => {
      if (element.classList.contains('text-lg')) {
        element.style.fontWeight =
          quantity >= QUANTITY_THRESHOLDS.BULK_DISCOUNT_MIN ? 'bold' : 'normal';
      }
    });
  });
}

/**
 * 화요일 특별 할인 UI 표시를 업데이트합니다.
 * @param {Object} discountResult - 할인 계산 결과
 */
function updateTuesdayDiscountDisplay(discountResult) {
  const tuesdaySpecialElement = document.getElementById('tuesday-special');
  if (discountResult.tuesdayDiscount) {
    tuesdaySpecialElement.classList.remove('hidden');
  } else {
    tuesdaySpecialElement.classList.add('hidden');
  }
}

/**
 * 장바구니 아이템 수량 표시를 업데이트합니다.
 * @param {number} totalItemCount - 총 아이템 수량
 */
function updateItemCountDisplay(totalItemCount) {
  const itemCountText = `🛍️ ${totalItemCount} items in cart`;
  const itemCountElement = document.getElementById('item-count');

  if (itemCountElement) {
    const countMatch = itemCountElement.textContent.match(/\d+/);
    const previousCount = parseInt(countMatch ? countMatch[0] : '0');
    itemCountElement.textContent = itemCountText;

    if (previousCount !== totalItemCount) {
      itemCountElement.setAttribute('data-changed', 'true');
    }
  }
}

/**
 * 주문 요약 영역을 업데이트합니다.
 * @param {Array} cartItemDetails - 장바구니 아이템 상세 정보
 * @param {number} subtotal - 소계
 * @param {Object} discountResult - 할인 계산 결과
 */
function updateOrderSummaryDisplay(cartItemDetails, subtotal, discountResult) {
  const summaryDetails = document.getElementById('summary-details');
  summaryDetails.innerHTML = '';

  if (subtotal > 0) {
    // 주문 요약 상세 항목 생성
    const itemDetailsHTML = cartItemDetails
      .map(
        (item) => `<div class="flex justify-between items-center text-sm text-gray-600">
        <span class="flex-1">${item.name} x ${item.quantity}</span>
        <span class="font-medium text-gray-800">${formatPrice(item.totalPrice)}</span>
      </div>`,
      )
      .join('');

    summaryDetails.innerHTML += itemDetailsHTML;
    summaryDetails.innerHTML += '<div class="border-t border-gray-200 my-2"></div>';
    summaryDetails.innerHTML += `<div class="flex justify-between items-center text-sm tracking-wide">
      <span>소계</span>
      <span>${formatPrice(subtotal)}</span>
    </div>`;

    // 할인 내역 표시
    const discountHTML = discountResult.discountMessages
      .map(
        (discount) => `<div class="flex justify-between items-center text-sm text-green-600">
        <span>${discount.label}</span>
        <span>-${formatPrice(discount.amount)}</span>
      </div>`,
      )
      .join('');

    summaryDetails.innerHTML += discountHTML;
    summaryDetails.innerHTML += `<div class="flex justify-between items-center text-sm tracking-wide text-gray-400">
      <span>배송</span>
      <span>무료</span>
    </div>`;
  }
}

/**
 * 총 결제 금액 표시를 업데이트합니다.
 * @param {number} totalAmount - 총 결제 금액
 */
function updateTotalAmountDisplay(totalAmount) {
  const totalAmountElement = document.getElementById('total-amount-display');
  if (totalAmountElement) {
    totalAmountElement.textContent = formatPrice(Math.round(totalAmount));
  }
}

/**
 * 적립금 포인트 표시를 업데이트합니다.
 * @param {number} totalAmount - 총 결제 금액
 * @param {Array} cartItemDetails - 장바구니 아이템 상세 정보
 * @param {number} totalItemCount - 총 아이템 수량
 * @param {HTMLCollection} cartItems - 장바구니 아이템 목록
 */
function updateLoyaltyPointsDisplay(totalAmount, cartItemDetails, totalItemCount, cartItems) {
  const pointsResult = calculateTotalPoints(totalAmount, cartItemDetails, totalItemCount);
  const loyaltyPointsDiv = document.getElementById('loyalty-points');

  if (loyaltyPointsDiv) {
    if (isCartEmpty(cartItems)) {
      loyaltyPointsDiv.style.display = 'none';
    } else if (pointsResult.totalPoints > 0) {
      loyaltyPointsDiv.innerHTML = generatePointsDisplayHTML(
        pointsResult.totalPoints,
        pointsResult.details,
      );
      loyaltyPointsDiv.style.display = 'block';
    } else {
      loyaltyPointsDiv.textContent = MESSAGES.LOYALTY_POINTS.replace('{points}', '0');
      loyaltyPointsDiv.style.display = 'block';
    }
  }
}

/**
 * 할인 정보 표시를 업데이트합니다.
 * @param {Object} discountResult - 할인 계산 결과
 * @param {number} totalAmount - 총 결제 금액
 */
function updateDiscountInfoDisplay(discountResult, totalAmount) {
  const discountInfoDiv = document.getElementById('discount-info');
  discountInfoDiv.innerHTML = '';

  if (discountResult.totalDiscountRate > 0 && totalAmount > 0) {
    discountInfoDiv.innerHTML = `
      <div class="bg-green-500/20 rounded-lg p-3">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
          <span class="text-sm font-medium text-green-400">${(discountResult.totalDiscountRate * 100).toFixed(1)}%</span>
        </div>
        <div class="text-2xs text-gray-300">${formatPrice(Math.round(discountResult.savedAmount))} 할인되었습니다</div>
      </div>
    `;
  }
}

/**
 * 장바구니 계산 결과를 얻어옵니다.
 * @returns {Object} 계산 결과 객체
 */
function getCartCalculationData() {
  return calculateSubtotalAndQuantity();
}

/**
 * 장바구니 UI를 업데이트합니다.
 * @param {Object} calculationResult - 계산 결과
 */
function updateCartUI(calculationResult) {
  updateBulkPurchaseVisualFeedback(calculationResult.cartItems);
  updateTuesdayDiscountDisplay(calculationResult.discountResult);
  updateItemCountDisplay(calculationResult.totalItemCount);
}

/**
 * 주문 요약 영역을 업데이트합니다.
 * @param {Object} calculationResult - 계산 결과
 */
function updateOrderSummarySection(calculationResult) {
  updateOrderSummaryDisplay(
    calculationResult.cartItemDetails,
    calculationResult.subtotal,
    calculationResult.discountResult,
  );
  updateTotalAmountDisplay(calculationResult.totalAmount);
}

/**
 * 포인트 및 할인 정보를 업데이트합니다.
 * @param {Object} calculationResult - 계산 결과
 */
function updateRewardsAndDiscounts(calculationResult) {
  updateLoyaltyPointsDisplay(
    calculationResult.totalAmount,
    calculationResult.cartItemDetails,
    calculationResult.totalItemCount,
    calculationResult.cartItems,
  );
  updateDiscountInfoDisplay(calculationResult.discountResult, calculationResult.totalAmount);
}

/**
 * 장바구니 계산 및 UI 업데이트를 처리하는 메인 함수
 * 가격, 할인, 포인트 계산 및 화면 업데이트를 담당합니다.
 */
function calculateCartTotals() {
  // 1. 계산 데이터 획득
  const calculationResult = getCartCalculationData();

  // 2. UI 업데이트 (단일 책임 원칙에 따라 분리)
  updateCartUI(calculationResult);
  updateOrderSummarySection(calculationResult);
  updateRewardsAndDiscounts(calculationResult);

  // 3. 재고 상태 업데이트
  updateStockInfoDisplay();
}
/**
 * 레거시 호환성을 위한 전역 변수 접근자들
 * 향후 제거 예정이며, AppState 직접 사용을 권장합니다.
 */
/**
 * 재고 정보를 업데이트하는 함수
 * 재고 부족 및 품절 상품에 대한 정보를 표시합니다.
 */
function updateStockInfoDisplay() {
  const stockInfoElement = AppState.ui.stockInfoElement;
  let infoMessage = '';

  // 재고 부족 상품 메시지 생성
  const stockWarningMessages = AppState.products
    .filter((item) => item.q < QUANTITY_THRESHOLDS.LOW_STOCK_WARNING)
    .map((item) => {
      if (item.q > 0) {
        return MESSAGES.STOCK_WARNING.replace('{productName}', item.name).replace(
          '{remaining}',
          item.q,
        );
      } else {
        return MESSAGES.OUT_OF_STOCK_WARNING.replace('{productName}', item.name);
      }
    });

  infoMessage = stockWarningMessages.join('\n') + (stockWarningMessages.length > 0 ? '\n' : '');

  stockInfoElement.textContent = infoMessage;
}
/**
 * 장바구니 내 상품 가격을 업데이트하는 함수
 * 할인 상태 변경 시 장바구니 내 가격 표시를 업데이트합니다.
 */
function updateCartItemPrices() {
  const cartItems = AppState.ui.cartDisplayArea.children;

  // 각 장바구니 아이템의 가격 업데이트
  Array.from(cartItems)
    .map((cartItem) => ({
      cartItem,
      itemId: cartItem.id,
      product: findProductById(AppState.products, cartItem.id),
    }))
    .filter(({ product }) => product)
    .forEach(({ cartItem, product }) => {
      const quantityElement = cartItem.querySelector('.quantity-number');
      const currentQuantity = extractNumberFromElement(quantityElement, 1);
      updateCartItemDisplay(cartItem, product, currentQuantity);
    });

  calculateCartTotals();
}
// 메인 애플리케이션 시작
main();

/**
 * 장바구니 추가 처리 함수
 * 선택된 상품을 장바구니에 추가하거나 수량을 증가시킵니다.
 */
function handleAddToCart() {
  const productSelector = AppState.ui.productSelector;
  const selectedItemId = productSelector.value;

  if (!selectedItemId) {
    return;
  }

  const result = addItemToCart(
    AppState.ui.cartDisplayArea.children,
    selectedItemId,
    AppState.products,
  );

  if (!result.success) {
    alert(result.message);
    return;
  }

  // 상품 정보 업데이트 (AppState 메서드 사용)
  AppState.updateProduct(selectedItemId, result.updatedProduct);

  if (result.isNewItem) {
    // 새로운 장바구니 아이템 생성
    createNewCartItem(result.updatedProduct);
  } else {
    // 기존 아이템 수량 업데이트
    updateExistingCartItemQuantity(selectedItemId, result.newQuantity);
  }

  calculateCartTotals();
  AppState.setLastSelectedProduct(selectedItemId);
}

/**
 * 기존 장바구니 아이템의 수량을 업데이트합니다.
 * @param {string} itemId - 상품 ID
 * @param {number} newQuantity - 새로운 수량
 */
function updateExistingCartItemQuantity(itemId, newQuantity) {
  const existingCartItem = document.getElementById(itemId);
  const quantityElement = existingCartItem.querySelector('.quantity-number');
  quantityElement.textContent = newQuantity;
}

/**
 * 장바구니 추가 버튼 이벤트 리스너
 */
AppState.ui.addToCartButton.addEventListener('click', handleAddToCart);

/**
 * 새로운 장바구니 아이템 DOM 요소를 생성합니다.
 * @param {Object} product - 상품 정보
 */
function createNewCartItem(product) {
  const cartItemContainer = document.createElement('div');
  cartItemContainer.innerHTML = createCartItemElement(product, 1);
  AppState.ui.cartDisplayArea.appendChild(cartItemContainer.firstElementChild);
}

/**
 * 장바구니 아이템 수량을 변경합니다.
 * @param {string} productId - 상품 ID
 * @param {HTMLElement} cartItemElement - 장바구니 아이템 엘리먼트
 * @param {number} quantityChange - 수량 변경량
 */
function handleCartItemQuantityChange(productId, cartItemElement, quantityChange) {
  const result = updateItemQuantity(
    AppState.ui.cartDisplayArea.children,
    productId,
    quantityChange,
    AppState.products,
  );

  if (!result.success) {
    alert(result.message);
    return;
  }

  // 상품 정보 업데이트 (AppState 메서드 사용)
  AppState.updateProduct(productId, result.updatedProduct);

  if (result.action === 'remove') {
    cartItemElement.remove();
  } else if (result.action === 'update') {
    const quantityElement = cartItemElement.querySelector('.quantity-number');
    quantityElement.textContent = result.newQuantity;
  }
}

/**
 * 장바구니에서 아이템을 제거합니다.
 * @param {string} productId - 상품 ID
 * @param {HTMLElement} cartItemElement - 장바구니 아이템 엘리먼트
 */
function handleCartItemRemoval(productId, cartItemElement) {
  const result = removeItemFromCart(
    AppState.ui.cartDisplayArea.children,
    productId,
    AppState.products,
  );

  if (result.success) {
    // 상품 정보 업데이트 (AppState 메서드 사용)
    AppState.updateProduct(productId, result.updatedProduct);
    cartItemElement.remove();
  }
}

/**
 * 장바구니 이벤트 리스너 (수량 변경 및 아이템 제거)
 * 수량 변경 버튼과 제거 버튼 클릭 이벤트를 처리합니다.
 */
AppState.ui.cartDisplayArea.addEventListener('click', function (event) {
  const targetElement = event.target;

  if (
    targetElement.classList.contains('quantity-change') ||
    targetElement.classList.contains('remove-item')
  ) {
    const productId = targetElement.dataset.productId;
    const cartItemElement = document.getElementById(productId);

    if (targetElement.classList.contains('quantity-change')) {
      const quantityChange = parseInt(targetElement.dataset.change);
      handleCartItemQuantityChange(productId, cartItemElement, quantityChange);
    } else if (targetElement.classList.contains('remove-item')) {
      handleCartItemRemoval(productId, cartItemElement);
    }

    // 재고 상태 업데이트 및 화면 새로고침
    calculateCartTotals();
    updateProductSelectOptions();
  }
});
