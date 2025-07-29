/**
 * UI 컴포넌트 생성 함수들
 * DOM 요소를 생성하는 순수 함수들의 모음
 */

import { DISCOUNT_LABELS } from '../constants.js';
import { generateDiscountLabel, generatePriceHTML } from '../utils/domUtils.js';

/**
 * 헤더 컴포넌트 생성
 * 애플리케이션 제목과 장바구니 아이템 수를 표시하는 헤더 영역을 생성합니다.
 * @returns {HTMLElement} 헤더 DOM 요소
 */
export const createHeader = () => {
  const header = document.createElement('div');
  header.className = 'mb-8';
  header.innerHTML = `
    <h1 class="text-xs font-medium tracking-extra-wide uppercase mb-2">🛒 Hanghae Online Store</h1>
    <div class="text-5xl tracking-tight leading-none">Shopping Cart</div>
    <p id="item-count" class="text-sm text-gray-500 font-normal mt-3">🛍️ 0 items in cart</p>
  `;
  return header;
};

/**
 * 상품 선택 드롭다운과 장바구니 추가 버튼 컴포넌트 생성
 * 상품 선택 드롭다운, 추가 버튼, 재고 상태 표시 영역을 포함하는 컨테이너를 생성합니다.
 * @returns {Object} 생성된 컴포넌트들을 담은 객체
 * @returns {HTMLElement} returns.container - 전체 컨테이너 요소
 * @returns {HTMLSelectElement} returns.productSelector - 상품 선택 드롭다운
 * @returns {HTMLButtonElement} returns.addToCartButton - 장바구니 추가 버튼
 * @returns {HTMLElement} returns.stockInfoElement - 재고 정보 표시 요소
 */
export const createProductSelector = () => {
  const container = document.createElement('div');
  container.className = 'mb-6 pb-6 border-b border-gray-200';

  const productSelector = document.createElement('select');
  productSelector.id = 'product-select';
  productSelector.className = 'w-full p-3 border border-gray-300 rounded-lg text-base mb-3';

  const addToCartButton = document.createElement('button');
  addToCartButton.id = 'add-to-cart';
  addToCartButton.innerHTML = 'Add to Cart';
  addToCartButton.className =
    'w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all';

  const stockInfoElement = document.createElement('div');
  stockInfoElement.id = 'stock-status';
  stockInfoElement.className = 'text-xs text-red-500 mt-3 whitespace-pre-line';

  container.appendChild(productSelector);
  container.appendChild(addToCartButton);
  container.appendChild(stockInfoElement);

  return {
    container,
    productSelector,
    addToCartButton,
    stockInfoElement,
  };
};

/**
 * 도움말 모달 컴포넌트 생성
 * 도움말 버튼, 오버레이, 모달 패널을 포함하는 도움말 시스템을 생성합니다.
 * @returns {Object} 생성된 모달 컴포넌트들을 담은 객체
 * @returns {HTMLButtonElement} returns.toggleButton - 모달 토글 버튼
 * @returns {HTMLElement} returns.overlay - 모달 오버레이
 * @returns {HTMLElement} returns.panel - 모달 패널
 */
export const createHelpModal = () => {
  const toggleButton = document.createElement('button');
  toggleButton.className =
    'fixed top-4 right-4 bg-black text-white p-3 rounded-full hover:bg-gray-900 transition-colors z-50';
  toggleButton.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  `;

  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/50 z-40 hidden transition-opacity duration-300';

  const panel = document.createElement('div');
  panel.className =
    'fixed right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 overflow-y-auto z-50 transform translate-x-full transition-transform duration-300';
  panel.innerHTML = `
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

  // 이벤트 리스너 설정
  toggleButton.onclick = () => {
    overlay.classList.toggle('hidden');
    panel.classList.toggle('translate-x-full');
  };

  overlay.onclick = (e) => {
    if (e.target === overlay) {
      overlay.classList.add('hidden');
      panel.classList.add('translate-x-full');
    }
  };

  overlay.appendChild(panel);

  return {
    toggleButton,
    overlay,
    panel,
  };
};

/**
 * 장바구니 아이템 요소 생성
 * 상품 정보, 수량 조절 버튼, 제거 버튼을 포함한 장바구니 아이템 DOM을 생성합니다.
 * @param {Object} product - 상품 정보 객체
 * @param {string} product.id - 상품 고유 ID
 * @param {string} product.name - 상품명
 * @param {number} product.val - 현재 가격
 * @param {number} product.originalVal - 원래 가격
 * @param {boolean} product.onSale - 번개세일 상태
 * @param {boolean} product.suggestSale - 추천세일 상태
 * @param {number} quantity - 장바구니 내 수량
 * @returns {HTMLElement} 장바구니 아이템 DOM 요소
 */
export const createCartItemElement = (product, quantity) => {
  const cartItem = document.createElement('div');
  cartItem.id = product.id;
  cartItem.className =
    'grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0';

  // 할인 상태에 따른 라벨 결정
  const discountLabel =
    product.onSale && product.suggestSale
      ? DISCOUNT_LABELS.SUPER_SALE
      : generateDiscountLabel(product);

  // 가격 표시 HTML 생성
  const priceHTML = generatePriceHTML(product);

  cartItem.innerHTML = `
    <div class="w-20 h-20 bg-gradient-black relative overflow-hidden">
      <div class="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
    </div>
    <div>
      <h3 class="text-base font-normal mb-1 tracking-tight">${discountLabel}${product.name}</h3>
      <p class="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
      <p class="text-xs text-black mb-3">${priceHTML}</p>
      <div class="flex items-center gap-4">
        <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${product.id}" data-change="-1">−</button>
        <span class="quantity-number text-sm font-normal min-w-[20px] text-center tabular-nums">${quantity}</span>
        <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${product.id}" data-change="1">+</button>
      </div>
    </div>
    <div class="text-right">
      <div class="text-lg mb-2 tracking-tight tabular-nums">${priceHTML}</div>
      <a class="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black" data-product-id="${product.id}">Remove</a>
    </div>
  `;

  return cartItem;
};

/**
 * 주문 요약 컴포넌트 생성
 * 우측 주문 요약 영역을 생성하며, 체크아웃 버튼과 포인트 안내를 포함합니다.
 * @returns {HTMLElement} 주문 요약 DOM 요소
 */
export const createOrderSummary = () => {
  const orderSummary = document.createElement('div');
  orderSummary.className = 'bg-black text-white p-8 flex flex-col';

  orderSummary.innerHTML = `
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

  return orderSummary;
};

/**
 * 장바구니 아이템 표시 업데이트 유틸리티
 * 기존 장바구니 아이템의 가격과 이름을 할인 상태에 따라 업데이트합니다.
 * @param {HTMLElement} itemElement - 업데이트할 장바구니 아이템 DOM 요소
 * @param {Object} product - 상품 정보 객체
 * @param {string} product.name - 상품명
 * @param {number} product.val - 현재 가격
 * @param {number} product.originalVal - 원래 가격
 * @param {boolean} product.onSale - 번개세일 상태
 * @param {boolean} product.suggestSale - 추천세일 상태
 * @param {number} quantity - 현재 수량
 */
export const updateCartItemDisplay = (itemElement, product, quantity) => {
  const priceElements = itemElement.querySelectorAll('.text-lg');
  const nameElement = itemElement.querySelector('h3');
  const quantityElement = itemElement.querySelector('.quantity-number');

  // 할인 상태에 따른 라벨 결정
  const discountLabel =
    product.onSale && product.suggestSale
      ? DISCOUNT_LABELS.SUPER_SALE
      : generateDiscountLabel(product);

  // 가격 표시 HTML 생성
  const priceHTML = generatePriceHTML(product);

  // 가격 요소들 업데이트
  priceElements.forEach((priceElement) => {
    priceElement.innerHTML = priceHTML;
  });

  // 상품명 업데이트
  if (nameElement) {
    nameElement.textContent = `${discountLabel}${product.name}`;
  }

  // 수량 업데이트
  if (quantityElement && quantity !== undefined) {
    quantityElement.textContent = quantity;
  }

  // 상품 설명 부분의 가격도 업데이트
  const descriptionPriceElement = itemElement.querySelector('.text-xs.text-black');
  if (descriptionPriceElement) {
    descriptionPriceElement.innerHTML = priceHTML;
  }
};
