/**
 * UI 컴포넌트 생성 함수들
 * DOM 요소를 생성하는 순수 함수들의 모음
 */

import { DISCOUNT_LABELS } from '../constants.js';
import { generateDiscountLabel, generatePriceHTML } from '../utils/domUtils.js';

/**
 * 헤더 컴포넌트 생성
 * 애플리케이션 제목과 장바구니 아이템 수를 표시하는 헤더 영역을 생성합니다.
 * @returns {string} 헤더 HTML 문자열
 */
export const createHeader = () => {
  return `
    <div class="mb-8">
      <h1 class="text-xs font-medium tracking-extra-wide uppercase mb-2">🛒 Hanghae Online Store</h1>
      <div class="text-5xl tracking-tight leading-none">Shopping Cart</div>
      <p id="item-count" class="text-sm text-gray-500 font-normal mt-3">🛍️ 0 items in cart</p>
    </div>
  `;
};

/**
 * 상품 선택 드롭다운과 장바구니 추가 버튼 컴포넌트 생성
 * 상품 선택 드롭다운, 추가 버튼, 재고 상태 표시 영역을 포함하는 컨테이너를 생성합니다.
 * @returns {string} 상품 선택 영역 HTML 문자열
 */
export const createProductSelector = () => {
  return `
    <div class="mb-6 pb-6 border-b border-gray-200">
      <select id="product-select" 
              class="w-full p-3 border border-gray-300 rounded-lg text-base mb-3"
              aria-label="구매할 상품을 선택하세요">
      </select>
      
      <button id="add-to-cart" 
              class="w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all"
              aria-label="선택한 상품을 장바구니에 추가"
              type="button">
        Add to Cart
      </button>
      
      <div id="stock-status" 
           class="text-xs text-red-500 mt-3 whitespace-pre-line"
           aria-live="polite"
           aria-atomic="true">
      </div>
    </div>
  `;
};

/**
 * 도움말 모달 토글 버튼 생성
 * @returns {string} 도움말 토글 버튼 HTML 문자열
 */
export const createHelpModalButton = () => {
  return `
    <button id="help-modal-toggle" 
            class="fixed top-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 z-10"
            aria-label="도움말 열기"
            aria-expanded="false"
            aria-controls="help-modal-panel">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    </button>
  `;
};

/**
 * 도움말 모달 오버레이 생성
 * @returns {string} 도움말 모달 오버레이 HTML 문자열
 */
export const createHelpModalOverlay = () => {
  return `
    <div id="help-modal-overlay" 
         class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden"
         role="dialog"
         aria-modal="true"
         aria-labelledby="help-modal-title">
      <aside id="help-modal-panel" 
             class="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 overflow-y-auto p-6 transform translate-x-full transition-transform duration-300 ease-in-out"
             role="complementary"
             aria-label="도움말">
        <button id="help-modal-close" 
                class="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full" 
                aria-label="도움말 닫기">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        
        <h2 id="help-modal-title" class="text-xl font-bold mb-6 pr-12">쇼핑 가이드</h2>
        
        <!-- 할인 정책 섹션 -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3 text-gray-800">💰 할인 정책</h3>
          <div class="space-y-3">
            <div class="bg-gray-50 p-3 rounded border">
              <h4 class="font-medium text-sm mb-1 text-gray-700">개별 상품 할인</h4>
              <p class="text-xs text-gray-600">같은 상품을 10개 이상 구매시 상품별 할인율을 적용받을 수 있습니다.</p>
            </div>
            <div class="bg-gray-50 p-3 rounded border">
              <h4 class="font-medium text-sm mb-1 text-gray-700">총 수량 할인</h4>
              <p class="text-xs text-gray-600">전체 상품 수량이 30개 이상이면 25% 대량구매 할인을 받을 수 있습니다.</p>
            </div>
            <div class="bg-gray-50 p-3 rounded border">
              <h4 class="font-medium text-sm mb-1 text-gray-700">특별 할인</h4>
              <p class="text-xs text-gray-600">화요일 할인, 번개세일, 추천할인 등 특별 이벤트를 통해 추가 할인을 받을 수 있습니다.</p>
            </div>
          </div>
        </div>
        
        <!-- 포인트 적립 섹션 -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3 text-gray-800">🎁 포인트 적립</h3>
          <div class="space-y-3">
            <div class="bg-gray-50 p-3 rounded border">
              <h4 class="font-medium text-sm mb-1 text-gray-700">기본 적립</h4>
              <p class="text-xs text-gray-600">결제 금액의 0.01%를 기본 포인트로 적립해드립니다.</p>
            </div>
            <div class="bg-gray-50 p-3 rounded border">
              <h4 class="font-medium text-sm mb-1 text-gray-700">추가 적립</h4>
              <p class="text-xs text-gray-600">화요일 2배 적립, 콤보 세트 보너스, 대량구매 보너스 등으로 추가 포인트를 받을 수 있습니다.</p>
            </div>
          </div>
        </div>
        
        <!-- 유용한 팁 섹션 -->
        <div class="border-t border-gray-200 pt-4 mt-4">
          <p class="text-xs font-bold mb-1">💡 쇼핑 팁</p>
          <p class="text-2xs text-gray-600 leading-relaxed">
            할인과 포인트를 최대한 활용하려면 화요일에 30개 이상 구매하고, 번개세일과 추천할인 타이밍을 노려보세요!
          </p>
        </div>
      </aside>
    </div>
  `;
};

/**
 * 장바구니 아이템 HTML 생성
 * 상품 정보, 수량 조절 버튼, 제거 버튼을 포함한 장바구니 아이템 HTML을 생성합니다.
 * @param {Object} product - 상품 정보 객체
 * @param {string} product.id - 상품 고유 ID
 * @param {string} product.name - 상품명
 * @param {number} product.val - 현재 가격
 * @param {number} product.originalVal - 원래 가격
 * @param {boolean} product.onSale - 번개세일 상태
 * @param {boolean} product.suggestSale - 추천세일 상태
 * @param {number} quantity - 장바구니 내 수량
 * @returns {string} 장바구니 아이템 HTML 문자열
 */
export const createCartItemElement = (product, quantity) => {
  // 할인 상태에 따른 라벨 결정
  const discountLabel =
    product.onSale && product.suggestSale
      ? DISCOUNT_LABELS.SUPER_SALE
      : generateDiscountLabel(product);

  // 가격 표시 HTML 생성
  const priceHTML = generatePriceHTML(product);

  return `
  <div id="${product.id}" 
           class="grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0"
           role="group"
           aria-label="${product.name} in cart">
    <!-- 상품 이미지 영역 -->
    <div class="w-20 h-20 bg-gradient-black relative overflow-hidden">
      <div class="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
    </div>
    
    <!-- 상품 정보 및 수량 조절 영역 -->
    <div>
      <h3 class="font-semibold text-lg text-gray-800">
        ${discountLabel}${product.name}
      </h3>
      <p class="text-sm text-gray-600">개발자 도구</p>
      <p class="text-xs text-black mb-3">${priceHTML}</p>
      
      <!-- 수량 조절 버튼 그룹 -->
      <div class="flex items-center gap-4" role="group" aria-label="수량 조절">
        <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" 
                type="button"
                data-product-id="${product.id}" 
                data-change="-1"
                aria-label="${product.name} 수량 감소">-</button>
        <span class="quantity-number text-sm font-normal min-w-[20px] text-center tabular-nums" 
              aria-label="Quantity: ${quantity}">
          ${quantity}
        </span>
        <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" 
                type="button"
                data-product-id="${product.id}" 
                data-change="1"
                aria-label="${product.name} 수량 증가">+</button>
      </div>
    </div>
    
    <!-- 가격 및 제거 버튼 영역 -->
    <div class="text-right">
      <div class="text-lg mb-2 tracking-tight tabular-nums">${priceHTML}</div>
      <button class="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black" 
              type="button"
              data-product-id="${product.id}"
              aria-label="${product.name} 제거">REMOVE</button>
    </div>
  </div>
  `;
};

/**
 * 주문 요약 컴포넌트 생성
 * 우측 주문 요약 영역을 생성하며, 체크아웃 버튼과 포인트 안내를 포함합니다.
 * @returns {string} 주문 요약 HTML 문자열
 */
export const createOrderSummary = () => {
  return `
  <div class="h-full bg-black text-white p-8 flex flex-col">
    <h2 class="text-xs font-medium mb-5 tracking-extra-wide uppercase">Order Summary</h2>
    <div class="flex-1 flex flex-col">
      <div id="summary-details" class="space-y-3"></div>
      <div class="mt-auto">
        <div id="discount-info" class="mb-4"></div>
        <div id="cart-total" class="pt-5 border-t border-white/10">
          <div class="flex justify-between items-baseline">
            <span class="text-sm uppercase tracking-wider">Total</span>
            <div id="total-amount-display" class="text-2xl tracking-tight">₩0</div>
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
  </div>
  `;
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
    quantityElement.textContent = String(quantity);
  }

  // 상품 설명 부분의 가격도 업데이트
  const descriptionPriceElement = itemElement.querySelector('.text-xs.text-black');
  if (descriptionPriceElement) {
    descriptionPriceElement.innerHTML = priceHTML;
  }
};
