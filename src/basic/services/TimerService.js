/**
 * 타이머 기반 이벤트 관리 서비스
 * @fileoverview 번개세일과 추천할인 타이머를 관리하고 상품 할인을 적용합니다.
 */

import {
  DISCOUNT_RATES,
  TIMERS,
  MESSAGES
} from '../constants.js';

/**
 * 번개세일을 시작합니다.
 * @param {Array} products - 전체 상품 목록
 * @param {Function} onSaleStart - 세일 시작 콜백 함수
 */
export const startLightningSale = (products, onSaleStart) => {
  const lightningDelay = Math.random() * TIMERS.MAX_INITIAL_DELAY;
  
  setTimeout(() => {
    setInterval(() => {
      const eligibleProducts = getEligibleProductsForLightningSale(products);
      
      if (eligibleProducts.length > 0) {
        const randomIndex = Math.floor(Math.random() * eligibleProducts.length);
        const selectedProduct = eligibleProducts[randomIndex];
        
        applyLightningSale(selectedProduct);
        
        const alertMessage = MESSAGES.LIGHTNING_SALE_ALERT
          .replace('{productName}', selectedProduct.name);
        
        alert(alertMessage);
        
        if (onSaleStart) {
          onSaleStart(selectedProduct);
        }
      }
    }, TIMERS.LIGHTNING_SALE_INTERVAL);
  }, lightningDelay);
};

/**
 * 추천할인을 시작합니다.
 * @param {Array} products - 전체 상품 목록
 * @param {Function} getLastSelectedProduct - 마지막 선택 상품 조회 함수
 * @param {Function} onSuggestionStart - 추천할인 시작 콜백 함수
 * @param {Function} isCartEmpty - 장바구니 비어있음 확인 함수
 */
export const startSuggestionSale = (products, getLastSelectedProduct, onSuggestionStart, isCartEmpty) => {
  setTimeout(() => {
    setInterval(() => {
      if (isCartEmpty()) {
        return;
      }
      
      const lastSelectedProduct = getLastSelectedProduct();
      if (!lastSelectedProduct) {
        return;
      }
      
      const suggestedProduct = findSuggestionProduct(products, lastSelectedProduct);
      
      if (suggestedProduct) {
        applySuggestionSale(suggestedProduct);
        
        const alertMessage = MESSAGES.SUGGESTION_SALE_ALERT
          .replace('{productName}', suggestedProduct.name);
        
        alert(alertMessage);
        
        if (onSuggestionStart) {
          onSuggestionStart(suggestedProduct);
        }
      }
    }, TIMERS.SUGGESTION_SALE_INTERVAL);
  }, Math.random() * TIMERS.MAX_SUGGESTION_DELAY);
};

/**
 * 번개세일 대상 상품을 필터링합니다.
 * @param {Array} products - 전체 상품 목록
 * @returns {Array} 번개세일 가능한 상품 목록
 */
export const getEligibleProductsForLightningSale = (products) => {
  return products.filter(product => 
    product.q > 0 && !product.onSale
  );
};

/**
 * 추천할인 대상 상품을 찾습니다.
 * @param {Array} products - 전체 상품 목록
 * @param {string} lastSelectedProductId - 마지막 선택된 상품 ID
 * @returns {Object|null} 추천할인 대상 상품 또는 null
 */
export const findSuggestionProduct = (products, lastSelectedProductId) => {
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    if (product.id !== lastSelectedProductId && 
        product.q > 0 && 
        !product.suggestSale) {
      return product;
    }
  }
  return null;
};

/**
 * 상품에 번개세일을 적용합니다.
 * @param {Object} product - 할인을 적용할 상품 객체
 * @returns {Object} 할인이 적용된 상품 객체
 */
export const applyLightningSale = (product) => {
  const discountedPrice = Math.round(
    product.originalVal * (1 - DISCOUNT_RATES.LIGHTNING_SALE)
  );
  
  return {
    ...product,
    val: discountedPrice,
    onSale: true
  };
};

/**
 * 상품에 추천할인을 적용합니다.
 * @param {Object} product - 할인을 적용할 상품 객체
 * @returns {Object} 할인이 적용된 상품 객체
 */
export const applySuggestionSale = (product) => {
  const discountedPrice = Math.round(
    product.val * (1 - DISCOUNT_RATES.SUGGESTION_SALE)
  );
  
  return {
    ...product,
    val: discountedPrice,
    suggestSale: true
  };
};

/**
 * 상품의 할인 상태를 확인합니다.
 * @param {Object} product - 확인할 상품 객체
 * @returns {Object} 할인 상태 정보
 */
export const getDiscountStatus = (product) => {
  return {
    isOnLightningSale: product.onSale,
    isOnSuggestionSale: product.suggestSale,
    isSuperSale: product.onSale && product.suggestSale,
    currentPrice: product.val,
    originalPrice: product.originalVal,
    discountAmount: product.originalVal - product.val
  };
};

/**
 * 모든 할인 타이머를 초기화합니다.
 * @param {Array} products - 전체 상품 목록
 * @param {Function} getLastSelectedProduct - 마지막 선택 상품 조회 함수
 * @param {Function} onSaleStart - 세일 시작 콜백 함수
 * @param {Function} isCartEmpty - 장바구니 비어있음 확인 함수
 */
export const initializeTimers = (products, getLastSelectedProduct, onSaleStart, isCartEmpty) => {
  // 번개세일 타이머 시작
  startLightningSale(products, onSaleStart);
  
  // 추천할인 타이머 시작
  startSuggestionSale(products, getLastSelectedProduct, onSaleStart, isCartEmpty);
};

/**
 * 타이머 지연 시간을 생성합니다.
 * @param {number} maxDelay - 최대 지연 시간 (밀리초)
 * @returns {number} 랜덤 지연 시간
 */
export const generateRandomDelay = (maxDelay) => {
  return Math.random() * maxDelay;
};