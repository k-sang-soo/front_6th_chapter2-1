/**
 * 할인 관련 비즈니스 로직을 담당하는 서비스
 * @fileoverview 개별 상품 할인, 대량 구매 할인, 화요일 할인, 특별 할인 등을 계산합니다.
 */

import {
  PRODUCT_IDS,
  DISCOUNT_RATES,
  QUANTITY_THRESHOLDS,
  DAYS,
  DISCOUNT_DISPLAY_MESSAGES,
} from '../constants.js';

/**
 * 개별 상품의 대량 구매 할인율을 계산합니다.
 * @param {string} productId - 상품 ID
 * @param {number} quantity - 구매 수량
 * @returns {number} 할인율 (0~1 사이의 값)
 */
export const calculateItemDiscount = (productId, quantity) => {
  if (quantity < QUANTITY_THRESHOLDS.BULK_DISCOUNT_MIN) {
    return 0;
  }

  switch (productId) {
    case PRODUCT_IDS.KEYBOARD:
      return DISCOUNT_RATES.KEYBOARD_BULK;
    case PRODUCT_IDS.MOUSE:
      return DISCOUNT_RATES.MOUSE_BULK;
    case PRODUCT_IDS.MONITOR_ARM:
      return DISCOUNT_RATES.MONITOR_ARM_BULK;
    case PRODUCT_IDS.LAPTOP_POUCH:
      return DISCOUNT_RATES.LAPTOP_POUCH_BULK;
    case PRODUCT_IDS.SPEAKER:
      return DISCOUNT_RATES.SPEAKER_BULK;
    default:
      return 0;
  }
};

/**
 * 대량 구매 할인을 계산합니다 (30개 이상).
 * @param {number} totalQuantity - 총 구매 수량
 * @param {number} subtotal - 소계 금액
 * @returns {Object} { discountRate: number, discountAmount: number, finalAmount: number }
 */
export const calculateBulkDiscount = (totalQuantity, subtotal) => {
  if (totalQuantity >= QUANTITY_THRESHOLDS.TOTAL_BULK_MIN) {
    const discountRate = DISCOUNT_RATES.BULK_PURCHASE;
    const discountAmount = subtotal * discountRate;
    const finalAmount = subtotal - discountAmount;

    return {
      discountRate,
      discountAmount,
      finalAmount,
      applicable: true,
    };
  }

  return {
    discountRate: 0,
    discountAmount: 0,
    finalAmount: subtotal,
    applicable: false,
  };
};

/**
 * 화요일 특별 할인을 계산합니다.
 * @param {number} amount - 할인 적용 전 금액
 * @param {Date} date - 현재 날짜 (기본값: new Date())
 * @returns {Object} { discountRate: number, discountAmount: number, finalAmount: number, applicable: boolean }
 */
export const calculateTuesdayDiscount = (amount, date = new Date()) => {
  const isTuesday = date.getDay() === DAYS.TUESDAY;

  if (isTuesday && amount > 0) {
    const discountRate = DISCOUNT_RATES.TUESDAY_SPECIAL;
    const discountAmount = amount * discountRate;
    const finalAmount = amount - discountAmount;

    return {
      discountRate,
      discountAmount,
      finalAmount,
      applicable: true,
    };
  }

  return {
    discountRate: 0,
    discountAmount: 0,
    finalAmount: amount,
    applicable: false,
  };
};

/**
 * 개별 상품 할인을 적용한 총 금액과 할인 정보를 계산합니다.
 * @param {Array} cartItemDetails - 장바구니 상품 상세 정보
 * @returns {Object} { totalAmount: number, discountDetails: Array }
 */
export const applyItemDiscounts = (cartItemDetails) => {
  let totalAmount = 0;
  const discountDetails = [];

  cartItemDetails.forEach((item) => {
    const discountRate = calculateItemDiscount(item.id, item.quantity);
    const discountedAmount = item.total * (1 - discountRate);
    totalAmount += discountedAmount;

    if (discountRate > 0) {
      discountDetails.push({
        name: item.name,
        discountRate,
        discount: discountRate * 100,
      });
    }
  });

  return {
    totalAmount,
    discountDetails,
  };
};

/**
 * 최종 할인율과 절약 금액을 계산합니다.
 * @param {number} originalTotal - 원래 총 금액
 * @param {number} finalTotal - 최종 할인 적용 후 금액
 * @returns {Object} { totalDiscountRate: number, savedAmount: number }
 */
export const calculateFinalDiscount = (originalTotal, finalTotal) => {
  if (originalTotal <= 0) {
    return { totalDiscountRate: 0, savedAmount: 0 };
  }

  const totalDiscountRate = (originalTotal - finalTotal) / originalTotal;
  const savedAmount = originalTotal - finalTotal;

  return {
    totalDiscountRate,
    savedAmount,
  };
};

/**
 * 할인 표시 메시지를 생성합니다.
 * @param {boolean} isBulkDiscount - 대량 구매 할인 적용 여부
 * @param {Array} itemDiscounts - 개별 상품 할인 정보 배열
 * @param {boolean} isTuesdayDiscount - 화요일 할인 적용 여부
 * @returns {Array} 할인 표시 메시지 배열
 */
export const generateDiscountMessages = (isBulkDiscount, itemDiscounts, isTuesdayDiscount) => {
  const messages = [];

  if (isBulkDiscount) {
    messages.push({
      type: 'bulk',
      message: DISCOUNT_DISPLAY_MESSAGES.BULK_PURCHASE,
      percentage: DISCOUNT_RATES.BULK_PURCHASE * 100,
    });
  } else if (itemDiscounts.length > 0) {
    itemDiscounts.forEach((item) => {
      const discountMessage = DISCOUNT_DISPLAY_MESSAGES.INDIVIDUAL_DISCOUNT.replace(
        '{productName}',
        item.name,
      );
      messages.push({
        type: 'item',
        message: discountMessage,
        percentage: item.discount,
      });
    });
  }

  if (isTuesdayDiscount) {
    messages.push({
      type: 'tuesday',
      message: DISCOUNT_DISPLAY_MESSAGES.TUESDAY_SPECIAL,
      percentage: DISCOUNT_RATES.TUESDAY_SPECIAL * 100,
    });
  }

  return messages;
};

/**
 * 모든 할인을 종합적으로 계산합니다.
 * @param {Array} cartItemDetails - 장바구니 상품 상세 정보
 * @param {number} totalQuantity - 총 구매 수량
 * @param {Date} date - 현재 날짜
 * @returns {Object} 종합 할인 계산 결과
 */
export const calculateTotalDiscount = (cartItemDetails, totalQuantity, date = new Date()) => {
  // 소계 계산
  const subtotal = cartItemDetails.reduce((sum, item) => sum + item.total, 0);

  // 대량 구매 할인 확인
  const bulkDiscount = calculateBulkDiscount(totalQuantity, subtotal);

  let finalAmount;
  let itemDiscountDetails = [];

  if (bulkDiscount.applicable) {
    // 대량 구매 할인 적용 (개별 할인 무시)
    finalAmount = bulkDiscount.finalAmount;
  } else {
    // 개별 상품 할인 적용
    const itemDiscountResult = applyItemDiscounts(cartItemDetails);
    finalAmount = itemDiscountResult.totalAmount;
    itemDiscountDetails = itemDiscountResult.discountDetails;
  }

  // 화요일 할인 적용
  const tuesdayDiscount = calculateTuesdayDiscount(finalAmount, date);
  finalAmount = tuesdayDiscount.finalAmount;

  // 최종 할인 정보 계산
  const finalDiscountInfo = calculateFinalDiscount(subtotal, finalAmount);

  return {
    subtotal,
    finalAmount,
    totalDiscountRate: finalDiscountInfo.totalDiscountRate,
    savedAmount: finalDiscountInfo.savedAmount,
    bulkDiscount: bulkDiscount.applicable,
    itemDiscounts: itemDiscountDetails,
    tuesdayDiscount: tuesdayDiscount.applicable,
    discountMessages: generateDiscountMessages(
      bulkDiscount.applicable,
      itemDiscountDetails,
      tuesdayDiscount.applicable,
    ),
  };
};
