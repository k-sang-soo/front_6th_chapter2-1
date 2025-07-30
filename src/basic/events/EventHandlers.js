/**
 * 이벤트 핸들러 모듈
 * 모든 사용자 상호작용 이벤트를 체계적으로 관리합니다.
 */

import { addItemToCart, updateItemQuantity, removeItemFromCart } from '../services/CartService.js';

import { createCartItemElement } from '../components/UIComponents.js';

import { AppState } from '../state/AppState.js';

/**
 * 장바구니 추가 처리 함수
 * 선택된 상품을 장바구니에 추가하거나 수량을 증가시킵니다.
 * @param {Function} calculateCartTotals - 장바구니 계산 함수
 */
export function handleAddToCart(calculateCartTotals) {
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
 * @param {Function} calculateCartTotals - 장바구니 계산 함수
 * @param {Function} updateProductSelectOptions - 상품 선택 옵션 업데이트 함수
 */
export function handleCartItemQuantityChange(
  productId,
  cartItemElement,
  quantityChange,
  calculateCartTotals,
  updateProductSelectOptions,
) {
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

  // 재고 상태 업데이트 및 화면 새로고침
  calculateCartTotals();
  updateProductSelectOptions();
}

/**
 * 장바구니에서 아이템을 제거합니다.
 * @param {string} productId - 상품 ID
 * @param {HTMLElement} cartItemElement - 장바구니 아이템 엘리먼트
 * @param {Function} calculateCartTotals - 장바구니 계산 함수
 * @param {Function} updateProductSelectOptions - 상품 선택 옵션 업데이트 함수
 */
export function handleCartItemRemoval(
  productId,
  cartItemElement,
  calculateCartTotals,
  updateProductSelectOptions,
) {
  const result = removeItemFromCart(
    AppState.ui.cartDisplayArea.children,
    productId,
    AppState.products,
  );

  if (result.success) {
    // 상품 정보 업데이트 (AppState 메서드 사용)
    AppState.updateProduct(productId, result.updatedProduct);
    cartItemElement.remove();

    // 재고 상태 업데이트 및 화면 새로고침
    calculateCartTotals();
    updateProductSelectOptions();
  }
}

/**
 * 장바구니 이벤트 리스너를 설정합니다.
 * 수량 변경 버튼과 제거 버튼 클릭 이벤트를 처리합니다.
 * @param {Function} calculateCartTotals - 장바구니 계산 함수
 * @param {Function} updateProductSelectOptions - 상품 선택 옵션 업데이트 함수
 */
export function setupCartEventListeners(calculateCartTotals, updateProductSelectOptions) {
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
        handleCartItemQuantityChange(
          productId,
          cartItemElement,
          quantityChange,
          calculateCartTotals,
          updateProductSelectOptions,
        );
      } else if (targetElement.classList.contains('remove-item')) {
        handleCartItemRemoval(
          productId,
          cartItemElement,
          calculateCartTotals,
          updateProductSelectOptions,
        );
      }
    }
  });
}

/**
 * 장바구니 추가 버튼 이벤트 리스너를 설정합니다.
 * @param {Function} calculateCartTotals - 장바구니 계산 함수
 */
export function setupAddToCartEventListener(calculateCartTotals) {
  AppState.ui.addToCartButton.addEventListener('click', () => handleAddToCart(calculateCartTotals));
}
