import {
  PRODUCT_IDS,
  PRODUCT_INFO,
  DISCOUNT_RATES,
  QUANTITY_THRESHOLDS,
  POINTS,
  TIMERS,
  MESSAGES,
  DISCOUNT_LABELS,
  POINTS_MESSAGES,
  DISCOUNT_DISPLAY_MESSAGES,
  DAYS,
} from './constants.js';

/**
 * 상품 목록 데이터
 * @type {Array<Object>}
 */
let productList;

/**
 * 보너스 포인트 총계
 * @type {number}
 */
let bonusPoints = 0;

/**
 * 재고 정보 표시 DOM 엘리먼트
 * @type {HTMLElement}
 */
let stockInfoElement;

/**
 * 장바구니 총 아이템 수량
 * @type {number}
 */
let totalItemCount;

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
 * 총 결제 금액
 * @type {number}
 */
let totalAmount = 0;

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
  let lightningDelay;

  // 전역 상태 초기화
  totalAmount = 0;
  totalItemCount = 0;
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
  headerElement = document.createElement('div');
  headerElement.className = 'mb-8';
  headerElement.innerHTML = `
    <h1 class="text-xs font-medium tracking-extra-wide uppercase mb-2">🛒 Hanghae Online Store</h1>
    <div class="text-5xl tracking-tight leading-none">Shopping Cart</div>
    <p id="item-count" class="text-sm text-gray-500 font-normal mt-3">🛍️ 0 items in cart</p>
  `;
  productSelector = document.createElement('select');
  productSelector.id = 'product-select';
  gridContainer = document.createElement('div');
  leftColumn = document.createElement('div');
  leftColumn['className'] = 'bg-white border border-gray-200 p-8 overflow-y-auto';
  selectorContainer = document.createElement('div');
  selectorContainer.className = 'mb-6 pb-6 border-b border-gray-200';
  productSelector.className = 'w-full p-3 border border-gray-300 rounded-lg text-base mb-3';
  gridContainer.className =
    'grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden';
  addToCartButton = document.createElement('button');
  stockInfoElement = document.createElement('div');
  addToCartButton.id = 'add-to-cart';
  stockInfoElement.id = 'stock-status';
  stockInfoElement.className = 'text-xs text-red-500 mt-3 whitespace-pre-line';
  addToCartButton.innerHTML = 'Add to Cart';
  addToCartButton.className =
    'w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all';
  selectorContainer.appendChild(productSelector);
  selectorContainer.appendChild(addToCartButton);
  selectorContainer.appendChild(stockInfoElement);
  leftColumn.appendChild(selectorContainer);
  cartDisplayArea = document.createElement('div');
  leftColumn.appendChild(cartDisplayArea);
  cartDisplayArea.id = 'cart-items';
  rightColumn = document.createElement('div');
  rightColumn.className = 'bg-black text-white p-8 flex flex-col';
  rightColumn.innerHTML = `
    <h2 class="text-xs font-medium mb-5 tracking-extra-wide uppercase">Order Summary</h2>
    <div class="flex-1 flex flex-col">
      <div id="summary-details" class="space-y-3"></div>
      <div class="mt-auto">
        <div id="discount-info" class="mb-4"></div>
        <div id="cart-total" class="pt-5 border-t border-white/10">
          <div class="flex justify-between items-baseline">
            <span class="text-sm uppercase tracking-wider">Total</span>
            <div class="text-2xl tracking-tight">₩0</div>
          </div>
          <div id="loyalty-points" class="text-xs text-blue-400 mt-2 text-right">적립 포인트: 0p</div>
        </div>
        <div id="tuesday-special" class="mt-4 p-3 bg-white/10 rounded-lg hidden">
          <div class="flex items-center gap-2">
            <span class="text-2xs">🎉</span>
            <span class="text-xs uppercase tracking-wide">Tuesday Special 10% Applied</span>
          </div>
        </div>
      </div>
    </div>
    <button class="w-full py-4 bg-white text-black text-sm font-normal uppercase tracking-super-wide cursor-pointer mt-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30">
      Proceed to Checkout
    </button>
    <p class="mt-4 text-2xs text-white/60 text-center leading-relaxed">
      Free shipping on all orders.<br>
      <span id="points-notice">Earn loyalty points with purchase.</span>
    </p>
  `;
  orderSummaryElement = rightColumn.querySelector('#cart-total');
  manualToggle = document.createElement('button');
  manualToggle.onclick = function () {
    manualOverlay.classList.toggle('hidden');
    manualColumn.classList.toggle('translate-x-full');
  };
  manualToggle.className =
    'fixed top-4 right-4 bg-black text-white p-3 rounded-full hover:bg-gray-900 transition-colors z-50';
  manualToggle.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  `;
  manualOverlay = document.createElement('div');
  manualOverlay.className = 'fixed inset-0 bg-black/50 z-40 hidden transition-opacity duration-300';
  manualOverlay.onclick = function (e) {
    if (e.target === manualOverlay) {
      manualOverlay.classList.add('hidden');
      manualColumn.classList.add('translate-x-full');
    }
  };
  manualColumn = document.createElement('div');
  manualColumn.className =
    'fixed right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 overflow-y-auto z-50 transform translate-x-full transition-transform duration-300';
  manualColumn.innerHTML = `
    <button class="absolute top-4 right-4 text-gray-500 hover:text-black" onclick="document.querySelector('.fixed.inset-0').classList.add('hidden'); this.parentElement.classList.add('translate-x-full')">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
    <h2 class="text-xl font-bold mb-4">📖 이용 안내</h2>
    <div class="mb-6">
      <h3 class="text-base font-bold mb-3">💰 할인 정책</h3>
      <div class="space-y-3">
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">개별 상품</p>
          <p class="text-gray-700 text-xs pl-2">
            • 키보드 10개↑: 10%<br>
            • 마우스 10개↑: 15%<br>
            • 모니터암 10개↑: 20%<br>
            • 스피커 10개↑: 25%
          </p>
        </div>
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">전체 수량</p>
          <p class="text-gray-700 text-xs pl-2">• 30개 이상: 25%</p>
        </div>
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">특별 할인</p>
          <p class="text-gray-700 text-xs pl-2">
            • 화요일: +10%<br>
            • ⚡번개세일: 20%<br>
            • 💝추천할인: 5%
          </p>
        </div>
      </div>
    </div>
    <div class="mb-6">
      <h3 class="text-base font-bold mb-3">🎁 포인트 적립</h3>
      <div class="space-y-3">
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">기본</p>
          <p class="text-gray-700 text-xs pl-2">• 구매액의 0.1%</p>
        </div>
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">추가</p>
          <p class="text-gray-700 text-xs pl-2">
            • 화요일: 2배<br>
            • 키보드+마우스: +50p<br>
            • 풀세트: +100p<br>
            • 10개↑: +20p / 20개↑: +50p / 30개↑: +100p
          </p>
        </div>
      </div>
    </div>
    <div class="border-t border-gray-200 pt-4 mt-4">
      <p class="text-xs font-bold mb-1">💡 TIP</p>
      <p class="text-2xs text-gray-600 leading-relaxed">
        • 화요일 대량구매 = MAX 혜택<br>
        • ⚡+💝 중복 가능<br>
        • 상품4 = 품절
      </p>
    </div>
  `;
  gridContainer.appendChild(leftColumn);
  gridContainer.appendChild(rightColumn);
  manualOverlay.appendChild(manualColumn);
  rootElement.appendChild(headerElement);
  rootElement.appendChild(gridContainer);
  rootElement.appendChild(manualToggle);
  rootElement.appendChild(manualOverlay);
  // 초기 재고 총계 계산
  let initialTotalStock = 0;
  for (let i = 0; i < productList.length; i++) {
    // eslint-disable-next-line no-unused-vars
    initialTotalStock += productList[i].q;
  }
  onUpdateSelectOptions();
  handleCalculateCartStuff();
  lightningDelay = Math.random() * TIMERS.MAX_INITIAL_DELAY;
  setTimeout(() => {
    setInterval(function () {
      const randomIndex = Math.floor(Math.random() * productList.length);
      const selectedProduct = productList[randomIndex];
      if (selectedProduct.q > 0 && !selectedProduct.onSale) {
        selectedProduct.val = Math.round(
          selectedProduct.originalVal * (1 - DISCOUNT_RATES.LIGHTNING_SALE),
        );
        selectedProduct.onSale = true;
        const alertMessage = MESSAGES.LIGHTNING_SALE_ALERT.replace(
          '{productName}',
          selectedProduct.name,
        );
        alert(alertMessage);
        onUpdateSelectOptions();
        doUpdatePricesInCart();
      }
    }, TIMERS.LIGHTNING_SALE_INTERVAL);
  }, lightningDelay);
  setTimeout(function () {
    setInterval(function () {
      if (cartDisplayArea.children.length === 0) {
        return;
      }
      if (lastSelectedProduct) {
        let suggestedProduct = null;
        for (let k = 0; k < productList.length; k++) {
          const product = productList[k];
          if (product.id !== lastSelectedProduct && product.q > 0 && !product.suggestSale) {
            suggestedProduct = product;
            break;
          }
        }
        if (suggestedProduct) {
          const alertMessage = MESSAGES.SUGGESTION_SALE_ALERT.replace(
            '{productName}',
            suggestedProduct.name,
          );
          alert(alertMessage);
          suggestedProduct.val = Math.round(
            suggestedProduct.val * (1 - DISCOUNT_RATES.SUGGESTION_SALE),
          );
          suggestedProduct.suggestSale = true;
          onUpdateSelectOptions();
          doUpdatePricesInCart();
        }
      }
    }, TIMERS.SUGGESTION_SALE_INTERVAL);
  }, Math.random() * TIMERS.MAX_SUGGESTION_DELAY);
}

/**
 * 주문 요약 영역 DOM 엘리먼트
 * @type {HTMLElement}
 */
let orderSummaryElement;

/**
 * 상품 선택 드롭다운 옵션을 업데이트합니다.
 * 재고 상태와 할인 정보를 반영하여 옵션을 생성합니다.
 */
function onUpdateSelectOptions() {
  let totalStock;
  let optionElement;
  let discountText;

  productSelector.innerHTML = '';
  totalStock = 0;

  // 전체 재고 계산
  for (let idx = 0; idx < productList.length; idx++) {
    const product = productList[idx];
    totalStock = totalStock + product.q;
  }
  // 각 상품별 옵션 생성
  for (let i = 0; i < productList.length; i++) {
    const item = productList[i];
    optionElement = document.createElement('option');
    optionElement.value = item.id;
    discountText = '';

    if (item.onSale) discountText += ` ${DISCOUNT_LABELS.LIGHTNING_SALE}`;
    if (item.suggestSale) discountText += ` ${DISCOUNT_LABELS.SUGGESTION_SALE}`;

    if (item.q === 0) {
      optionElement.textContent = `${item.name} - ${item.val}원 (${MESSAGES.OUT_OF_STOCK})${discountText}`;
      optionElement.disabled = true;
      optionElement.className = 'text-gray-400';
    } else {
      if (item.onSale && item.suggestSale) {
        optionElement.textContent = `${DISCOUNT_LABELS.SUPER_SALE}${item.name} - ${item.originalVal}원 → ${item.val}원 (${DISCOUNT_LABELS.SUPER_DISCOUNT})`;
        optionElement.className = 'text-purple-600 font-bold';
      } else if (item.onSale) {
        optionElement.textContent = `⚡${item.name} - ${item.originalVal}원 → ${item.val}원 (${DISCOUNT_LABELS.LIGHTNING_DISCOUNT})`;
        optionElement.className = 'text-red-500 font-bold';
      } else if (item.suggestSale) {
        optionElement.textContent = `💝${item.name} - ${item.originalVal}원 → ${item.val}원 (${DISCOUNT_LABELS.SUGGESTION_DISCOUNT})`;
        optionElement.className = 'text-blue-500 font-bold';
      } else {
        optionElement.textContent = `${item.name} - ${item.val}원${discountText}`;
      }
    }
    productSelector.appendChild(optionElement);
  }
  // 재고 부족 시 시각적 표시
  if (totalStock < QUANTITY_THRESHOLDS.STOCK_WARNING_THRESHOLD) {
    productSelector.style.borderColor = 'orange';
  } else {
    productSelector.style.borderColor = '';
  }
}
/**
 * 장바구니 계산 및 UI 업데이트를 처리하는 메인 함수
 * 가격, 할인, 포인트 계산 및 화면 업데이트를 담당합니다.
 */
function handleCalculateCartStuff() {
  const cartItems = cartDisplayArea.children;
  let subtotal;
  let itemDiscounts;
  let lowStockItems;
  let index;
  let originalTotal;
  let savedAmount;
  let summaryDetails;
  let totalDiv;
  let loyaltyPointsDiv;
  let points;
  let discountInfoDiv;
  let itemCountElement;
  let previousCount;
  let stockMessage;

  // 기본 값 초기화
  totalAmount = 0;
  totalItemCount = 0;
  originalTotal = totalAmount;
  subtotal = 0;
  itemDiscounts = [];
  lowStockItems = [];
  // 재고 부족 상품 수집
  for (index = 0; index < productList.length; index++) {
    const product = productList[index];
    if (product.q < QUANTITY_THRESHOLDS.LOW_STOCK_WARNING && product.q > 0) {
      lowStockItems.push(product.name);
    }
  }
  // 각 장바구니 아이템 처리
  for (let i = 0; i < cartItems.length; i++) {
    let currentProduct;

    // 해당 상품 찾기
    for (let j = 0; j < productList.length; j++) {
      if (productList[j].id === cartItems[i].id) {
        currentProduct = productList[j];
        break;
      }
    }

    const quantityElement = cartItems[i].querySelector('.quantity-number');
    const quantity = parseInt(quantityElement.textContent);
    const itemTotal = currentProduct.val * quantity;
    let discountRate = 0;

    totalItemCount += quantity;
    subtotal += itemTotal;
    // 대량 구매 시 가격 강조 표시
    const itemDiv = cartItems[i];
    const priceElements = itemDiv.querySelectorAll('.text-lg, .text-xs');
    priceElements.forEach(function (element) {
      if (element.classList.contains('text-lg')) {
        element.style.fontWeight =
          quantity >= QUANTITY_THRESHOLDS.BULK_DISCOUNT_MIN ? 'bold' : 'normal';
      }
    });
    // 개별 상품 대량 할인 적용
    if (quantity >= QUANTITY_THRESHOLDS.BULK_DISCOUNT_MIN) {
      switch (currentProduct.id) {
        case PRODUCT_IDS.KEYBOARD:
          discountRate = DISCOUNT_RATES.KEYBOARD_BULK;
          break;
        case PRODUCT_IDS.MOUSE:
          discountRate = DISCOUNT_RATES.MOUSE_BULK;
          break;
        case PRODUCT_IDS.MONITOR_ARM:
          discountRate = DISCOUNT_RATES.MONITOR_ARM_BULK;
          break;
        case PRODUCT_IDS.LAPTOP_POUCH:
          discountRate = DISCOUNT_RATES.LAPTOP_POUCH_BULK;
          break;
        case PRODUCT_IDS.SPEAKER:
          discountRate = DISCOUNT_RATES.SPEAKER_BULK;
          break;
      }

      if (discountRate > 0) {
        itemDiscounts.push({
          name: currentProduct.name,
          discount: discountRate * 100,
        });
      }
    }

    totalAmount += itemTotal * (1 - discountRate);
  }
  // 할인율 계산
  let totalDiscountRate = 0;
  originalTotal = subtotal;

  // 대량 구매 할인 (30개 이상) - 개별 할인 무시하고 원가에서 25% 할인
  if (totalItemCount >= QUANTITY_THRESHOLDS.TOTAL_BULK_MIN) {
    totalAmount = subtotal * (1 - DISCOUNT_RATES.BULK_PURCHASE);
    totalDiscountRate = DISCOUNT_RATES.BULK_PURCHASE;
  } else {
    // 개별 할인이 적용된 상태이므로 할인율 계산
    totalDiscountRate = (subtotal - totalAmount) / subtotal;
  }
  // 화요일 특별 할인 적용
  const today = new Date();
  const isTuesday = today.getDay() === DAYS.TUESDAY;
  const tuesdaySpecialElement = document.getElementById('tuesday-special');

  if (isTuesday && totalAmount > 0) {
    totalAmount = totalAmount * (1 - DISCOUNT_RATES.TUESDAY_SPECIAL);
    totalDiscountRate = 1 - totalAmount / originalTotal;
    tuesdaySpecialElement.classList.remove('hidden');
  } else {
    tuesdaySpecialElement.classList.add('hidden');
  }
  // 아이템 수 표시 업데이트
  const itemCountText = MESSAGES.ITEMS_IN_CART.replace('{count}', totalItemCount);
  document.getElementById('item-count').textContent = itemCountText;
  // 주문 요약 영역 업데이트
  summaryDetails = document.getElementById('summary-details');
  summaryDetails.innerHTML = '';
  if (subtotal > 0) {
    // 주문 요약 상세 항목 생성
    for (let i = 0; i < cartItems.length; i++) {
      let currentProduct;

      // 해당 상품 찾기
      for (let j = 0; j < productList.length; j++) {
        if (productList[j].id === cartItems[i].id) {
          currentProduct = productList[j];
          break;
        }
      }

      const quantityElement = cartItems[i].querySelector('.quantity-number');
      const quantity = parseInt(quantityElement.textContent);
      const itemTotal = currentProduct.val * quantity;
      summaryDetails.innerHTML += `
        <div class="flex justify-between text-xs tracking-wide text-gray-400">
          <span>${currentProduct.name} x ${quantity}</span>
          <span>₩${itemTotal.toLocaleString()}</span>
        </div>
      `;
    }
    summaryDetails.innerHTML += `
      <div class="border-t border-white/10 my-3"></div>
      <div class="flex justify-between text-sm tracking-wide">
        <span>Subtotal</span>
        <span>₩${subtotal.toLocaleString()}</span>
      </div>
    `;
    // 할인 정보 표시
    if (totalItemCount >= QUANTITY_THRESHOLDS.TOTAL_BULK_MIN) {
      summaryDetails.innerHTML += `
        <div class="flex justify-between text-sm tracking-wide text-green-400">
          <span class="text-xs">${DISCOUNT_DISPLAY_MESSAGES.BULK_PURCHASE}</span>
          <span class="text-xs">-${DISCOUNT_RATES.BULK_PURCHASE * 100}%</span>
        </div>
      `;
    } else if (itemDiscounts.length > 0) {
      itemDiscounts.forEach(function (item) {
        const discountMessage = DISCOUNT_DISPLAY_MESSAGES.INDIVIDUAL_DISCOUNT.replace(
          '{productName}',
          item.name,
        );
        summaryDetails.innerHTML += `
          <div class="flex justify-between text-sm tracking-wide text-green-400">
            <span class="text-xs">${discountMessage}</span>
            <span class="text-xs">-${item.discount}%</span>
          </div>
        `;
      });
    }
    // 화요일 할인 표시
    if (isTuesday && totalAmount > 0) {
      summaryDetails.innerHTML += `
        <div class="flex justify-between text-sm tracking-wide text-purple-400">
          <span class="text-xs">${DISCOUNT_DISPLAY_MESSAGES.TUESDAY_SPECIAL}</span>
          <span class="text-xs">-${DISCOUNT_RATES.TUESDAY_SPECIAL * 100}%</span>
        </div>
      `;
    }
    summaryDetails.innerHTML += `
      <div class="flex justify-between text-sm tracking-wide text-gray-400">
        <span>Shipping</span>
        <span>Free</span>
      </div>
    `;
  }
  // 총 금액 표시 업데이트
  totalDiv = orderSummaryElement.querySelector('.text-2xl');
  if (totalDiv) {
    totalDiv.textContent = '₩' + Math.round(totalAmount).toLocaleString();
  }
  // 기본 포인트 표시 업데이트 (상세 포인트는 doRenderBonusPoints에서 처리)
  loyaltyPointsDiv = document.getElementById('loyalty-points');
  if (loyaltyPointsDiv) {
    points = Math.floor(totalAmount / 1000);
    const pointsMessage = MESSAGES.LOYALTY_POINTS.replace('{points}', points);
    loyaltyPointsDiv.textContent = pointsMessage;
    loyaltyPointsDiv.style.display = 'block';
  }
  // 할인 정보 표시
  discountInfoDiv = document.getElementById('discount-info');
  discountInfoDiv.innerHTML = '';

  if (totalDiscountRate > 0 && totalAmount > 0) {
    savedAmount = originalTotal - totalAmount;
    discountInfoDiv.innerHTML = `
      <div class="bg-green-500/20 rounded-lg p-3">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
          <span class="text-sm font-medium text-green-400">${(totalDiscountRate * 100).toFixed(1)}%</span>
        </div>
        <div class="text-2xs text-gray-300">₩${Math.round(savedAmount).toLocaleString()} 할인되었습니다</div>
      </div>
    `;
  }
  // 아이템 수 변경 감지 및 표시
  itemCountElement = document.getElementById('item-count');
  if (itemCountElement) {
    const countMatch = itemCountElement.textContent.match(/\d+/);
    previousCount = parseInt(countMatch ? countMatch[0] : '0');
    const newItemCountText = MESSAGES.ITEMS_IN_CART.replace('{count}', totalItemCount);
    itemCountElement.textContent = newItemCountText;

    if (previousCount !== totalItemCount) {
      itemCountElement.setAttribute('data-changed', 'true');
    }
  }
  // 재고 상태 메시지 업데이트
  stockMessage = '';
  for (let stockIndex = 0; stockIndex < productList.length; stockIndex++) {
    const product = productList[stockIndex];
    if (product.q < QUANTITY_THRESHOLDS.LOW_STOCK_WARNING) {
      if (product.q > 0) {
        const warningMessage = MESSAGES.STOCK_WARNING.replace(
          '{productName}',
          product.name,
        ).replace('{remaining}', product.q);
        stockMessage += warningMessage + '\n';
      } else {
        const outOfStockMessage = MESSAGES.OUT_OF_STOCK_WARNING.replace(
          '{productName}',
          product.name,
        );
        stockMessage += outOfStockMessage + '\n';
      }
    }
  }
  stockInfoElement.textContent = stockMessage;
  handleStockInfoUpdate();
  doRenderBonusPoints();
}
/**
 * 보너스 포인트를 계산하고 화면에 렌더링하는 함수
 * 기본 포인트, 화요일 보너스, 세트 보너스, 대량 구매 보너스를 계산합니다.
 */
const doRenderBonusPoints = function () {
  let basePoints;
  let finalPoints;
  let pointsDetail;
  let hasKeyboard;
  let hasMouse;
  let hasMonitorArm;
  let cartNodes;

  if (cartDisplayArea.children.length === 0) {
    document.getElementById('loyalty-points').style.display = 'none';
    return;
  }

  basePoints = Math.floor(totalAmount / 1000);
  finalPoints = 0;
  pointsDetail = [];
  if (basePoints > 0) {
    finalPoints = basePoints;
    const baseMessage = POINTS_MESSAGES.BASE.replace('{points}', basePoints);
    pointsDetail.push(baseMessage);
  }
  // 화요일 더블 포인트
  if (new Date().getDay() === DAYS.TUESDAY && basePoints > 0) {
    finalPoints = basePoints * POINTS.TUESDAY_MULTIPLIER;
    pointsDetail.push(POINTS_MESSAGES.TUESDAY_DOUBLE);
  }
  // 세트 구성 확인
  hasKeyboard = false;
  hasMouse = false;
  hasMonitorArm = false;
  cartNodes = cartDisplayArea.children;

  for (const node of cartNodes) {
    let product = null;
    for (let productIndex = 0; productIndex < productList.length; productIndex++) {
      if (productList[productIndex].id === node.id) {
        product = productList[productIndex];
        break;
      }
    }

    if (!product) continue;

    switch (product.id) {
      case PRODUCT_IDS.KEYBOARD:
        hasKeyboard = true;
        break;
      case PRODUCT_IDS.MOUSE:
        hasMouse = true;
        break;
      case PRODUCT_IDS.MONITOR_ARM:
        hasMonitorArm = true;
        break;
    }
  }
  // 키보드+마우스 세트 보너스
  if (hasKeyboard && hasMouse) {
    finalPoints += POINTS.COMBO_KEYBOARD_MOUSE;
    pointsDetail.push(POINTS_MESSAGES.KEYBOARD_MOUSE_SET);
  }
  // 풀세트 보너스
  if (hasKeyboard && hasMouse && hasMonitorArm) {
    finalPoints += POINTS.FULL_SET_BONUS;
    pointsDetail.push(POINTS_MESSAGES.FULL_SET);
  }
  // 대량 구매 보너스
  if (totalItemCount >= QUANTITY_THRESHOLDS.TOTAL_BULK_MIN) {
    finalPoints += POINTS.BULK_30_BONUS;
    pointsDetail.push(POINTS_MESSAGES.BULK_30);
  } else if (totalItemCount >= 20) {
    finalPoints += POINTS.BULK_20_BONUS;
    pointsDetail.push(POINTS_MESSAGES.BULK_20);
  } else if (totalItemCount >= QUANTITY_THRESHOLDS.BULK_DISCOUNT_MIN) {
    finalPoints += POINTS.BULK_10_BONUS;
    pointsDetail.push(POINTS_MESSAGES.BULK_10);
  }
  // 포인트 표시 업데이트
  bonusPoints = finalPoints;
  const pointsElement = document.getElementById('loyalty-points');

  if (pointsElement) {
    if (bonusPoints > 0) {
      pointsElement.innerHTML =
        '<div>적립 포인트: <span class="font-bold">' +
        bonusPoints +
        'p</span></div>' +
        '<div class="text-2xs opacity-70 mt-1">' +
        pointsDetail.join(', ') +
        '</div>';
      pointsElement.style.display = 'block';
    } else {
      const zeroPointsMessage = MESSAGES.LOYALTY_POINTS.replace('{points}', '0');
      pointsElement.textContent = zeroPointsMessage;
      pointsElement.style.display = 'block';
    }
  }
};
/**
 * 전체 재고 수량을 계산하는 함수
 * @returns {number} 전체 상품의 재고 합계
 */
function onGetStockTotal() {
  let totalStock = 0;

  for (let i = 0; i < productList.length; i++) {
    const currentProduct = productList[i];
    totalStock += currentProduct.q;
  }

  return totalStock;
}
/**
 * 재고 정보를 업데이트하는 함수
 * 재고 부족 및 품절 상품에 대한 정보를 표시합니다.
 */
const handleStockInfoUpdate = function () {
  let infoMessage = '';
  const totalStock = onGetStockTotal();

  // 재고 부족 상품 메시지 생성
  productList.forEach(function (item) {
    if (item.q < QUANTITY_THRESHOLDS.LOW_STOCK_WARNING) {
      if (item.q > 0) {
        const warningMessage = MESSAGES.STOCK_WARNING.replace('{productName}', item.name).replace(
          '{remaining}',
          item.q,
        );
        infoMessage += warningMessage + '\n';
      } else {
        const outOfStockMessage = MESSAGES.OUT_OF_STOCK_WARNING.replace('{productName}', item.name);
        infoMessage += outOfStockMessage + '\n';
      }
    }
  });

  stockInfoElement.textContent = infoMessage;
};
/**
 * 장바구니 내 상품 가격을 업데이트하는 함수
 * 할인 상태 변경 시 장바구니 내 가격 표시를 업데이트합니다.
 */
function doUpdatePricesInCart() {
  const cartItems = cartDisplayArea.children;
  // 각 장바구니 아이템의 가격 업데이트
  for (let i = 0; i < cartItems.length; i++) {
    const itemId = cartItems[i].id;
    let product = null;

    // 해당 상품 찾기
    for (let productIndex = 0; productIndex < productList.length; productIndex++) {
      if (productList[productIndex].id === itemId) {
        product = productList[productIndex];
        break;
      }
    }
    if (product) {
      const priceElement = cartItems[i].querySelector('.text-lg');
      const nameElement = cartItems[i].querySelector('h3');

      // 할인 상태에 따른 가격 및 이름 표시
      if (product.onSale && product.suggestSale) {
        priceElement.innerHTML =
          `<span class="line-through text-gray-400">₩${product.originalVal.toLocaleString()}</span> ` +
          `<span class="text-purple-600">₩${product.val.toLocaleString()}</span>`;
        nameElement.textContent = `${DISCOUNT_LABELS.SUPER_SALE}${product.name}`;
      } else if (product.onSale) {
        priceElement.innerHTML =
          `<span class="line-through text-gray-400">₩${product.originalVal.toLocaleString()}</span> ` +
          `<span class="text-red-500">₩${product.val.toLocaleString()}</span>`;
        nameElement.textContent = `⚡${product.name}`;
      } else if (product.suggestSale) {
        priceElement.innerHTML =
          `<span class="line-through text-gray-400">₩${product.originalVal.toLocaleString()}</span> ` +
          `<span class="text-blue-500">₩${product.val.toLocaleString()}</span>`;
        nameElement.textContent = `💝${product.name}`;
      } else {
        priceElement.textContent = `₩${product.val.toLocaleString()}`;
        nameElement.textContent = product.name;
      }
    }
  }
  handleCalculateCartStuff();
}
// 메인 애플리케이션 시작
main();

/**
 * 장바구니 추가 버튼 이벤트 리스너
 * 선택된 상품을 장바구니에 추가하거나 수량을 증가시킵니다.
 */
addToCartButton.addEventListener('click', function () {
  const selectedItemId = productSelector.value;
  let itemExists = false;

  // 선택된 상품이 존재하는지 확인
  for (let index = 0; index < productList.length; index++) {
    if (productList[index].id === selectedItemId) {
      itemExists = true;
      break;
    }
  }
  if (!selectedItemId || !itemExists) {
    return;
  }
  // 추가할 상품 찾기
  let itemToAdd = null;
  for (let j = 0; j < productList.length; j++) {
    if (productList[j].id === selectedItemId) {
      itemToAdd = productList[j];
      break;
    }
  }
  if (itemToAdd && itemToAdd.q > 0) {
    const existingCartItem = document.getElementById(itemToAdd.id);

    if (existingCartItem) {
      // 이미 장바구니에 있는 상품의 수량 증가
      const quantityElement = existingCartItem.querySelector('.quantity-number');
      const currentQuantity = parseInt(quantityElement.textContent);
      const newQuantity = currentQuantity + 1;

      if (newQuantity <= itemToAdd.q + currentQuantity) {
        quantityElement.textContent = newQuantity;
        itemToAdd.q--;
      } else {
        alert(MESSAGES.STOCK_SHORTAGE);
      }
    } else {
      // 새로운 장바구니 아이템 생성
      const newCartItem = document.createElement('div');
      newCartItem.id = itemToAdd.id;
      newCartItem.className =
        'grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0';

      // 할인 상태에 따른 라벨 결정
      const discountLabel =
        itemToAdd.onSale && itemToAdd.suggestSale
          ? DISCOUNT_LABELS.SUPER_SALE
          : itemToAdd.onSale
            ? '⚡'
            : itemToAdd.suggestSale
              ? '💝'
              : '';

      // 가격 표시 HTML 생성
      const priceHTML =
        itemToAdd.onSale || itemToAdd.suggestSale
          ? `<span class="line-through text-gray-400">₩${itemToAdd.originalVal.toLocaleString()}</span> ` +
            `<span class="${itemToAdd.onSale && itemToAdd.suggestSale ? 'text-purple-600' : itemToAdd.onSale ? 'text-red-500' : 'text-blue-500'}">₩${itemToAdd.val.toLocaleString()}</span>`
          : `₩${itemToAdd.val.toLocaleString()}`;

      newCartItem.innerHTML = `
        <div class="w-20 h-20 bg-gradient-black relative overflow-hidden">
          <div class="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
        </div>
        <div>
          <h3 class="text-base font-normal mb-1 tracking-tight">${discountLabel}${itemToAdd.name}</h3>
          <p class="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
          <p class="text-xs text-black mb-3">${priceHTML}</p>
          <div class="flex items-center gap-4">
            <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${itemToAdd.id}" data-change="-1">−</button>
            <span class="quantity-number text-sm font-normal min-w-[20px] text-center tabular-nums">1</span>
            <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${itemToAdd.id}" data-change="1">+</button>
          </div>
        </div>
        <div class="text-right">
          <div class="text-lg mb-2 tracking-tight tabular-nums">${priceHTML}</div>
          <a class="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black" data-product-id="${itemToAdd.id}">Remove</a>
        </div>
      `;

      cartDisplayArea.appendChild(newCartItem);
      itemToAdd.q--;
    }

    handleCalculateCartStuff();
    lastSelectedProduct = selectedItemId;
  }
});

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
    let product = null;

    // 해당 상품 찾기
    for (let productIndex = 0; productIndex < productList.length; productIndex++) {
      if (productList[productIndex].id === productId) {
        product = productList[productIndex];
        break;
      }
    }
    if (targetElement.classList.contains('quantity-change')) {
      // 수량 변경 처리
      const quantityChange = parseInt(targetElement.dataset.change);
      const quantityElement = cartItemElement.querySelector('.quantity-number');
      const currentQuantity = parseInt(quantityElement.textContent);
      const newQuantity = currentQuantity + quantityChange;

      if (newQuantity > 0 && newQuantity <= product.q + currentQuantity) {
        quantityElement.textContent = newQuantity;
        product.q -= quantityChange;
      } else if (newQuantity <= 0) {
        // 수량이 0 이하가 되면 아이템 제거
        product.q += currentQuantity;
        cartItemElement.remove();
      } else {
        alert(MESSAGES.STOCK_SHORTAGE);
      }
    } else if (targetElement.classList.contains('remove-item')) {
      // 아이템 제거 처리
      const quantityElement = cartItemElement.querySelector('.quantity-number');
      const quantityToRemove = parseInt(quantityElement.textContent);
      product.q += quantityToRemove;
      cartItemElement.remove();
    }
    // 재고 상태 업데이트 및 화면 새로고침
    handleCalculateCartStuff();
    onUpdateSelectOptions();
  }
});
