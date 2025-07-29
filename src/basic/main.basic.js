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
  createHelpModal,
  createCartItemElement,
  createOrderSummary,
  updateCartItemDisplay,
} from './components/UIComponents.js';

import { findProductById, formatPrice, extractNumberFromElement } from './utils/domUtils.js';

/**
 * 상품 목록 데이터
 * @type {Array<Object>}
 */
let productList;

/**
 * 재고 정보 표시 DOM 엘리먼트
 * @type {HTMLElement}
 */
let stockInfoElement;

/**
 * 마지막으로 선택된 상품 ID
 * @type {string|null}
 */
let lastSelectedProduct;

/**
 * 상품 선택 드롭다운 엘리먼트
 * @type {HTMLSelectElement}
 */
let productSelector;

/**
 * 장바구니 추가 버튼 엘리먼트
 * @type {HTMLButtonElement}
 */
let addToCartButton;

/**
 * 장바구니 표시 영역 DOM 엘리먼트
 * @type {HTMLElement}
 */
let cartDisplayArea;
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

  // 전역 상태 초기화
  lastSelectedProduct = null;
  // 상품 목록 초기화
  productList = PRODUCT_INFO.map((product) => ({
    id: product.id,
    name: product.name,
    val: product.price,
    originalVal: product.price,
    q: product.initialStock,
    onSale: false,
    suggestSale: false,
  }));
  // DOM 엘리먼트 생성
  headerElement = createHeader();
  // 상품 선택 컴포넌트 생성
  const productSelectorComponent = createProductSelector();
  productSelector = productSelectorComponent.productSelector;
  addToCartButton = productSelectorComponent.addToCartButton;
  stockInfoElement = productSelectorComponent.stockInfoElement;
  selectorContainer = productSelectorComponent.container;

  gridContainer = document.createElement('div');
  leftColumn = document.createElement('div');
  leftColumn['className'] = 'bg-white border border-gray-200 p-8 overflow-y-auto';
  gridContainer.className =
    'grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden';
  leftColumn.appendChild(selectorContainer);
  cartDisplayArea = document.createElement('div');
  leftColumn.appendChild(cartDisplayArea);
  cartDisplayArea.id = 'cart-items';
  rightColumn = createOrderSummary();
  orderSummaryElement = rightColumn.querySelector('#cart-total');

  // 도움말 모달 컴포넌트 생성
  const helpModalComponent = createHelpModal();
  manualToggle = helpModalComponent.toggleButton;
  manualOverlay = helpModalComponent.overlay;
  manualColumn = helpModalComponent.panel;
  gridContainer.appendChild(leftColumn);
  gridContainer.appendChild(rightColumn);
  manualOverlay.appendChild(manualColumn);
  rootElement.appendChild(headerElement);
  rootElement.appendChild(gridContainer);
  rootElement.appendChild(manualToggle);
  rootElement.appendChild(manualOverlay);
  // 초기 재고 총계 계산
  // eslint-disable-next-line no-unused-vars
  const initialTotalStock = productList.reduce((total, product) => total + product.q, 0);
  updateProductSelectOptions();
  calculateCartTotals();

  // 타이머 서비스로 할인 이벤트 초기화
  initializeTimers(
    productList,
    () => lastSelectedProduct,
    () => {
      updateProductSelectOptions();
      updateCartItemPrices();
    },
    () => isCartEmpty(cartDisplayArea.children),
  );
}

/**
 * 주문 요약 영역 DOM 엘리먼트
 * @type {HTMLElement}
 */
let orderSummaryElement;

/**
 * 전체 상품의 총 재고를 계산합니다.
 * @returns {number} 전체 재고 수량
 */
function calculateTotalStock() {
  return productList.reduce((total, product) => total + product.q, 0);
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
  productSelector.innerHTML = '';

  const totalStock = calculateTotalStock();

  // 각 상품별 옵션 생성
  productList
    .map((product) => createProductOption(product))
    .forEach((optionElement) => productSelector.appendChild(optionElement));

  updateSelectVisualFeedback(totalStock);
}
/**
 * 장바구니 내 아이템의 소계와 총 수량을 계산합니다.
 * @returns {Object} 계산 결과 객체
 */
function calculateSubtotalAndQuantity() {
  const cartItems = cartDisplayArea.children;
  const totalItemCount = calculateCartTotalQuantity(cartItems);
  const cartItemDetails = getCartItemDetails(cartItems, productList);
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
  const itemCountText = MESSAGES.ITEMS_IN_CART.replace('{count}', totalItemCount);
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
        (item) => `
        <div class="flex justify-between text-xs tracking-wide text-gray-400">
          <span>${item.name} x ${item.quantity}</span>
          <span>${formatPrice(item.total)}</span>
        </div>
      `,
      )
      .join('');

    summaryDetails.innerHTML += itemDetailsHTML;

    summaryDetails.innerHTML += `
      <div class="border-t border-white/10 my-3"></div>
      <div class="flex justify-between text-sm tracking-wide">
        <span>Subtotal</span>
        <span>${formatPrice(subtotal)}</span>
      </div>
    `;

    // 할인 내역 표시
    const discountHTML = discountResult.discountMessages
      .map((discount) => {
        const colorClass = discount.type === 'tuesday' ? 'text-purple-400' : 'text-green-400';
        return `
          <div class="flex justify-between text-sm tracking-wide ${colorClass}">
            <span class="text-xs">${discount.message}</span>
            <span class="text-xs">-${discount.percentage}%</span>
          </div>
        `;
      })
      .join('');

    summaryDetails.innerHTML += discountHTML;

    summaryDetails.innerHTML += `
      <div class="flex justify-between text-sm tracking-wide text-gray-400">
        <span>Shipping</span>
        <span>Free</span>
      </div>
    `;
  }
}

/**
 * 총 결제 금액 표시를 업데이트합니다.
 * @param {number} totalAmount - 총 결제 금액
 */
function updateTotalAmountDisplay(totalAmount) {
  const totalDiv = orderSummaryElement.querySelector('.text-2xl');
  if (totalDiv) {
    totalDiv.textContent = formatPrice(Math.round(totalAmount));
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
 * 장바구니 계산 및 UI 업데이트를 처리하는 메인 함수
 * 가격, 할인, 포인트 계산 및 화면 업데이트를 담당합니다.
 */
function calculateCartTotals() {
  // 소계와 수량 계산
  const calculationResult = calculateSubtotalAndQuantity();

  // 각 UI 섹션 업데이트
  updateBulkPurchaseVisualFeedback(calculationResult.cartItems);
  updateTuesdayDiscountDisplay(calculationResult.discountResult);
  updateItemCountDisplay(calculationResult.totalItemCount);
  updateOrderSummaryDisplay(
    calculationResult.cartItemDetails,
    calculationResult.subtotal,
    calculationResult.discountResult,
  );
  updateTotalAmountDisplay(calculationResult.totalAmount);
  updateLoyaltyPointsDisplay(
    calculationResult.totalAmount,
    calculationResult.cartItemDetails,
    calculationResult.totalItemCount,
    calculationResult.cartItems,
  );
  updateDiscountInfoDisplay(calculationResult.discountResult, calculationResult.totalAmount);

  // 재고 상태 업데이트
  updateStockInfoDisplay();
}
// doRenderBonusPoints 함수는 포인트 서비스로 대체되었습니다.
/**
 * 재고 정보를 업데이트하는 함수
 * 재고 부족 및 품절 상품에 대한 정보를 표시합니다.
 */
function updateStockInfoDisplay() {
  let infoMessage = '';

  // 재고 부족 상품 메시지 생성
  const stockWarningMessages = productList
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
  const cartItems = cartDisplayArea.children;

  // 각 장바구니 아이템의 가격 업데이트
  Array.from(cartItems)
    .map((cartItem) => ({
      cartItem,
      itemId: cartItem.id,
      product: findProductById(productList, cartItem.id),
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
  const selectedItemId = productSelector.value;

  if (!selectedItemId) {
    return;
  }

  const result = addItemToCart(cartDisplayArea.children, selectedItemId, productList);

  if (!result.success) {
    alert(result.message);
    return;
  }

  // 상품 정보 업데이트
  const productIndex = productList.findIndex((p) => p.id === selectedItemId);
  if (productIndex !== -1) {
    productList[productIndex] = result.updatedProduct;
  }

  if (result.isNewItem) {
    // 새로운 장바구니 아이템 생성
    createNewCartItem(result.updatedProduct);
  } else {
    // 기존 아이템 수량 업데이트
    const existingCartItem = document.getElementById(selectedItemId);
    const quantityElement = existingCartItem.querySelector('.quantity-number');
    quantityElement.textContent = result.newQuantity;
  }

  calculateCartTotals();
  lastSelectedProduct = selectedItemId;
}

/**
 * 장바구니 추가 버튼 이벤트 리스너
 */
addToCartButton.addEventListener('click', handleAddToCart);

/**
 * 새로운 장바구니 아이템 DOM 요소를 생성합니다.
 * @param {Object} product - 상품 정보
 */
function createNewCartItem(product) {
  const newCartItem = createCartItemElement(product, 1);
  cartDisplayArea.appendChild(newCartItem);
}

/**
 * 장바구니 아이템 수량을 변경합니다.
 * @param {string} productId - 상품 ID
 * @param {HTMLElement} cartItemElement - 장바구니 아이템 엘리먼트
 * @param {number} quantityChange - 수량 변경량
 */
function handleCartItemQuantityChange(productId, cartItemElement, quantityChange) {
  const result = updateItemQuantity(
    cartDisplayArea.children,
    productId,
    quantityChange,
    productList,
  );

  if (!result.success) {
    alert(result.message);
    return;
  }

  // 상품 정보 업데이트
  const productIndex = productList.findIndex((p) => p.id === productId);
  if (productIndex !== -1) {
    productList[productIndex] = result.updatedProduct;
  }

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
  const result = removeItemFromCart(cartDisplayArea.children, productId, productList);

  if (result.success) {
    // 상품 정보 업데이트
    const productIndex = productList.findIndex((p) => p.id === productId);
    if (productIndex !== -1) {
      productList[productIndex] = result.updatedProduct;
    }
    cartItemElement.remove();
  }
}

/**
 * 장바구니 이벤트 리스너 (수량 변경 및 아이템 제거)
 * 수량 변경 버튼과 제거 버튼 클릭 이벤트를 처리합니다.
 */
cartDisplayArea.addEventListener('click', function (event) {
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
