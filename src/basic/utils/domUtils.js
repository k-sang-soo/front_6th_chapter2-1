/**
 * DOM 관련 유틸리티 함수들
 * @fileoverview DOM 조작, 요소 찾기, 포맷팅 등 공통으로 사용되는 DOM 유틸리티들
 */

/**
 * 상품 ID로 상품을 찾습니다.
 * @param {Array} products - 상품 목록
 * @param {string} productId - 찾을 상품 ID
 * @returns {Object|null} 찾은 상품 객체 또는 null
 */
export const findProductById = (products, productId) => {
  for (let i = 0; i < products.length; i++) {
    if (products[i].id === productId) {
      return products[i];
    }
  }
  return null;
};

/**
 * 가격을 한국 통화 형식으로 포맷팅합니다.
 * @param {number} price - 포맷팅할 가격
 * @returns {string} 포맷팅된 가격 문자열 (예: "₩1,000")
 */
export const formatPrice = (price) => {
  return `₩${price.toLocaleString()}`;
};

/**
 * 가격 차이를 표시하는 HTML을 생성합니다 (할인가 표시용).
 * @param {number} originalPrice - 원래 가격
 * @param {number} discountedPrice - 할인된 가격
 * @param {string} colorClass - 할인가에 적용할 CSS 클래스
 * @returns {string} 할인가 표시 HTML
 */
export const formatDiscountedPrice = (
  originalPrice,
  discountedPrice,
  colorClass = 'text-red-500',
) => {
  return (
    `<span class="line-through text-gray-400">${formatPrice(originalPrice)}</span> ` +
    `<span class="${colorClass}">${formatPrice(discountedPrice)}</span>`
  );
};

/**
 * 상품의 할인 상태에 따른 라벨을 생성합니다.
 * @param {Object} product - 상품 정보
 * @param {boolean} product.onSale - 번개세일 여부
 * @param {boolean} product.suggestSale - 추천세일 여부
 * @returns {string} 할인 라벨 (⚡, 💝, 🌟 등)
 */
export const generateDiscountLabel = (product) => {
  if (product.onSale && product.suggestSale) {
    return '🌟'; // 슈퍼세일
  } else if (product.onSale) {
    return '⚡'; // 번개세일
  } else if (product.suggestSale) {
    return '💝'; // 추천세일
  }
  return '';
};

/**
 * 할인 상태에 따른 CSS 클래스를 반환합니다.
 * @param {Object} product - 상품 정보
 * @param {boolean} product.onSale - 번개세일 여부
 * @param {boolean} product.suggestSale - 추천세일 여부
 * @returns {string} 적용할 CSS 클래스
 */
export const getDiscountColorClass = (product) => {
  if (product.onSale && product.suggestSale) {
    return 'text-purple-600'; // 슈퍼세일
  } else if (product.onSale) {
    return 'text-red-500'; // 번개세일
  } else if (product.suggestSale) {
    return 'text-blue-500'; // 추천세일
  }
  return '';
};

/**
 * 상품의 가격 표시 HTML을 생성합니다.
 * @param {Object} product - 상품 정보
 * @param {number} product.val - 현재 가격
 * @param {number} product.originalVal - 원래 가격
 * @param {boolean} product.onSale - 번개세일 여부
 * @param {boolean} product.suggestSale - 추천세일 여부
 * @returns {string} 가격 표시 HTML
 */
export const generatePriceHTML = (product) => {
  if (product.onSale || product.suggestSale) {
    const colorClass = getDiscountColorClass(product);
    return formatDiscountedPrice(product.originalVal, product.val, colorClass);
  }
  return formatPrice(product.val);
};

/**
 * 자주 사용하는 DOM 요소들을 캐시하여 반환합니다.
 * @returns {Object} 캐시된 DOM 요소들
 */
export const getDOMElements = (() => {
  let cache = {};

  return () => {
    // 이미 캐시된 요소가 있고 여전히 DOM에 존재하면 캐시 반환
    if (cache.app && document.contains(cache.app)) {
      return cache;
    }

    // 캐시 갱신
    cache = {
      app: document.getElementById('app'),
      productSelect: document.getElementById('product-select'),
      addToCartButton: document.getElementById('add-to-cart'),
      cartItems: document.getElementById('cart-items'),
      cartTotal: document.getElementById('cart-total'),
      stockStatus: document.getElementById('stock-status'),
      itemCount: document.getElementById('item-count'),
      loyaltyPoints: document.getElementById('loyalty-points'),
      discountInfo: document.getElementById('discount-info'),
      tuesdaySpecial: document.getElementById('tuesday-special'),
      summaryDetails: document.getElementById('summary-details'),
    };

    return cache;
  };
})();

/**
 * DOM에서 요소를 안전하게 찾습니다.
 * @param {string} selector - CSS 선택자 또는 ID
 * @param {HTMLElement} [parent=document] - 검색할 부모 요소
 * @returns {HTMLElement|null} 찾은 요소 또는 null
 */
export const safeQuerySelector = (selector, parent = document) => {
  try {
    return parent.querySelector(selector);
  } catch {
    // Development warning for invalid selector
    // console.warn(`Invalid selector: ${selector}`);
    return null;
  }
};

/**
 * 요소의 텍스트에서 숫자를 추출합니다.
 * @param {HTMLElement} element - 숫자를 추출할 요소
 * @param {number} [defaultValue=0] - 기본값
 * @returns {number} 추출된 숫자
 */
export const extractNumberFromElement = (element, defaultValue = 0) => {
  if (!element || !element.textContent) {
    return defaultValue;
  }

  const match = element.textContent.match(/\d+/);
  return match ? parseInt(match[0]) : defaultValue;
};

/**
 * 요소가 DOM에 존재하는지 확인합니다.
 * @param {HTMLElement} element - 확인할 요소
 * @returns {boolean} 존재 여부
 */
export const isElementInDOM = (element) => {
  return element && document.contains(element);
};
