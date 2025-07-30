/**
 * UI 서비스 모듈
 * 장바구니 계산, 할인 적용, 화면 업데이트 등의 비즈니스 로직을 담당합니다.
 */

import {
  calculateCartTotalQuantity,
  getCartItemDetails,
  isCartEmpty,
} from '../services/CartService.js';

import { calculateTotalDiscount } from '../services/DiscountService.js';

import { calculateTotalPoints, generatePointsDisplayHTML } from '../services/PointService.js';

import { updateCartItemDisplay } from '../components/UIComponents.js';

import { findProductById, formatPrice, extractNumberFromElement } from '../utils/domUtils.js';

import { AppState } from '../state/AppState.js';

import { QUANTITY_THRESHOLDS, MESSAGES } from '../constants.js';

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
export function calculateCartTotals() {
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
 * 장바구니 내 상품 가격을 업데이트하는 함수
 * 할인 상태 변경 시 장바구니 내 가격 표시를 업데이트합니다.
 */
export function updateCartItemPrices() {
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
