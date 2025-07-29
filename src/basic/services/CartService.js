/**
 * 장바구니 관련 비즈니스 로직을 담당하는 서비스
 * @fileoverview 장바구니 상태 관리, CRUD 작업, 재고 검증 등을 처리합니다.
 */

import { MESSAGES } from '../constants.js';
import { findProductById } from '../utils/domUtils.js';

/**
 * 장바구니에 상품을 추가하거나 기존 상품의 수량을 증가시킵니다.
 * @param {Array} cartItems - 현재 장바구니 아이템 목록 (DOM 컬렉션)
 * @param {string} productId - 추가할 상품 ID
 * @param {Array} products - 전체 상품 목록
 * @returns {Object} 추가 결과 { success: boolean, message?: string, updatedProduct?: Object }
 */
export const addItemToCart = (cartItems, productId, products) => {
  const product = findProductById(products, productId);

  if (!product) {
    return { success: false, message: '상품을 찾을 수 없습니다.' };
  }

  if (product.q <= 0) {
    return { success: false, message: MESSAGES.STOCK_SHORTAGE };
  }

  const existingCartItem = findCartItemById(cartItems, productId);

  if (existingCartItem) {
    const quantityElement = existingCartItem.querySelector('.quantity-number');
    const currentQuantity = parseInt(quantityElement.textContent);
    const newQuantity = currentQuantity + 1;

    if (newQuantity <= product.q + currentQuantity) {
      return {
        success: true,
        updatedProduct: { ...product, q: product.q - 1 },
        isNewItem: false,
        newQuantity,
      };
    } else {
      return { success: false, message: MESSAGES.STOCK_SHORTAGE };
    }
  }

  return {
    success: true,
    updatedProduct: { ...product, q: product.q - 1 },
    isNewItem: true,
  };
};

/**
 * 장바구니 상품의 수량을 업데이트합니다.
 * @param {Array} cartItems - 현재 장바구니 아이템 목록 (DOM 컬렉션)
 * @param {string} productId - 수량을 변경할 상품 ID
 * @param {number} quantityChange - 수량 변경값 (+1 또는 -1)
 * @param {Array} products - 전체 상품 목록
 * @returns {Object} 변경 결과 { success: boolean, action: string, updatedProduct?: Object }
 */
export const updateItemQuantity = (cartItems, productId, quantityChange, products) => {
  const product = findProductById(products, productId);
  const cartItem = findCartItemById(cartItems, productId);

  if (!product || !cartItem) {
    return { success: false, message: '상품 또는 장바구니 아이템을 찾을 수 없습니다.' };
  }

  const quantityElement = cartItem.querySelector('.quantity-number');
  const currentQuantity = parseInt(quantityElement.textContent);
  const newQuantity = currentQuantity + quantityChange;

  if (newQuantity <= 0) {
    return {
      success: true,
      action: 'remove',
      updatedProduct: { ...product, q: product.q + currentQuantity },
    };
  }

  if (newQuantity <= product.q + currentQuantity) {
    return {
      success: true,
      action: 'update',
      newQuantity,
      updatedProduct: { ...product, q: product.q - quantityChange },
    };
  }

  return { success: false, message: MESSAGES.STOCK_SHORTAGE };
};

/**
 * 장바구니에서 상품을 제거합니다.
 * @param {Array} cartItems - 현재 장바구니 아이템 목록 (DOM 컬렉션)
 * @param {string} productId - 제거할 상품 ID
 * @param {Array} products - 전체 상품 목록
 * @returns {Object} 제거 결과 { success: boolean, updatedProduct?: Object }
 */
export const removeItemFromCart = (cartItems, productId, products) => {
  const product = findProductById(products, productId);
  const cartItem = findCartItemById(cartItems, productId);

  if (!product || !cartItem) {
    return { success: false, message: '상품 또는 장바구니 아이템을 찾을 수 없습니다.' };
  }

  const quantityElement = cartItem.querySelector('.quantity-number');
  const quantityToRestore = parseInt(quantityElement.textContent);

  return {
    success: true,
    updatedProduct: { ...product, q: product.q + quantityToRestore },
  };
};

/**
 * 장바구니의 총 아이템 수량을 계산합니다.
 * @param {Array} cartItems - 장바구니 아이템 목록 (DOM 컬렉션)
 * @returns {number} 총 아이템 수량
 */
export const calculateCartTotalQuantity = (cartItems) => {
  let totalQuantity = 0;

  for (let i = 0; i < cartItems.length; i++) {
    const quantityElement = cartItems[i].querySelector('.quantity-number');
    const quantity = parseInt(quantityElement.textContent);
    totalQuantity += quantity;
  }

  return totalQuantity;
};

/**
 * 장바구니의 소계를 계산합니다 (할인 적용 전)
 * @param {Array} cartItems - 장바구니 아이템 목록 (DOM 컬렉션)
 * @param {Array} products - 전체 상품 목록
 * @returns {number} 소계 금액
 */
export const calculateCartSubtotal = (cartItems, products) => {
  let subtotal = 0;

  for (let i = 0; i < cartItems.length; i++) {
    const product = findProductById(products, cartItems[i].id);
    if (product) {
      const quantityElement = cartItems[i].querySelector('.quantity-number');
      const quantity = parseInt(quantityElement.textContent);
      subtotal += product.val * quantity;
    }
  }

  return subtotal;
};

/**
 * 장바구니 상품들의 상세 정보를 추출합니다.
 * @param {Array} cartItems - 장바구니 아이템 목록 (DOM 컬렉션)
 * @param {Array} products - 전체 상품 목록
 * @returns {Array} 장바구니 상품 상세 정보 배열
 */
export const getCartItemDetails = (cartItems, products) => {
  const itemDetails = [];

  for (let i = 0; i < cartItems.length; i++) {
    const product = findProductById(products, cartItems[i].id);
    if (product) {
      const quantityElement = cartItems[i].querySelector('.quantity-number');
      const quantity = parseInt(quantityElement.textContent);

      itemDetails.push({
        id: product.id,
        name: product.name,
        price: product.val,
        originalPrice: product.originalVal,
        quantity,
        total: product.val * quantity,
        onSale: product.onSale,
        suggestSale: product.suggestSale,
      });
    }
  }

  return itemDetails;
};

/**
 * 장바구니가 비어있는지 확인합니다.
 * @param {Array} cartItems - 장바구니 아이템 목록 (DOM 컬렉션)
 * @returns {boolean} 장바구니가 비어있으면 true
 */
export const isCartEmpty = (cartItems) => {
  return cartItems.length === 0;
};

/**
 * 상품 ID로 장바구니 아이템을 찾습니다.
 * @param {Array} cartItems - 장바구니 아이템 목록 (DOM 컬렉션)
 * @param {string} productId - 찾을 상품 ID
 * @returns {HTMLElement|null} 찾은 장바구니 아이템 DOM 요소 또는 null
 */
const findCartItemById = (cartItems, productId) => {
  for (let i = 0; i < cartItems.length; i++) {
    if (cartItems[i].id === productId) {
      return cartItems[i];
    }
  }
  return null;
};
