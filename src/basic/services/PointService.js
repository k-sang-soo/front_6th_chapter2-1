/**
 * 포인트 관련 비즈니스 로직을 담당하는 서비스
 * @fileoverview 기본 포인트, 화요일 2배 적립, 세트 보너스, 수량별 보너스 등을 계산합니다.
 */

import { PRODUCT_IDS, POINTS, QUANTITY_THRESHOLDS, DAYS, POINTS_MESSAGES } from '../constants.js';

/**
 * 구매 금액 기반 기본 포인트를 계산합니다.
 * @param {number} totalAmount - 최종 구매 금액
 * @returns {number} 기본 포인트
 */
export const calculateBasePoints = (totalAmount) => {
  return Math.floor(totalAmount / 1000);
};

/**
 * 화요일 2배 포인트를 계산합니다.
 * @param {number} basePoints - 기본 포인트
 * @param {Date} date - 현재 날짜 (기본값: new Date())
 * @returns {Object} { points: number, applicable: boolean }
 */
export const calculateTuesdayPoints = (basePoints, date = new Date()) => {
  const isTuesday = date.getDay() === DAYS.TUESDAY;

  if (isTuesday && basePoints > 0) {
    return {
      points: basePoints * POINTS.TUESDAY_MULTIPLIER,
      applicable: true,
    };
  }

  return {
    points: basePoints,
    applicable: false,
  };
};

/**
 * 장바구니에서 세트 구성을 확인합니다.
 * @param {Array} cartItemDetails - 장바구니 상품 상세 정보
 * @returns {Object} { hasKeyboard: boolean, hasMouse: boolean, hasMonitorArm: boolean }
 */
export const checkSetComposition = (cartItemDetails) => {
  let hasKeyboard = false;
  let hasMouse = false;
  let hasMonitorArm = false;

  cartItemDetails.forEach((item) => {
    switch (item.id) {
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
  });

  return { hasKeyboard, hasMouse, hasMonitorArm };
};

/**
 * 세트 구매 보너스 포인트를 계산합니다.
 * @param {Object} setComposition - 세트 구성 정보
 * @returns {Object} { points: number, details: Array }
 */
export const calculateSetBonus = (setComposition) => {
  const { hasKeyboard, hasMouse, hasMonitorArm } = setComposition;
  let bonusPoints = 0;
  const details = [];

  // 키보드+마우스 세트 보너스
  if (hasKeyboard && hasMouse) {
    bonusPoints += POINTS.COMBO_KEYBOARD_MOUSE;
    details.push(POINTS_MESSAGES.KEYBOARD_MOUSE_SET);
  }

  // 풀세트 보너스 (키보드+마우스+모니터암)
  if (hasKeyboard && hasMouse && hasMonitorArm) {
    bonusPoints += POINTS.FULL_SET_BONUS;
    details.push(POINTS_MESSAGES.FULL_SET);
  }

  return { points: bonusPoints, details };
};

/**
 * 대량 구매 보너스 포인트를 계산합니다.
 * @param {number} totalQuantity - 총 구매 수량
 * @returns {Object} { points: number, details: Array }
 */
export const calculateQuantityBonus = (totalQuantity) => {
  let bonusPoints = 0;
  const details = [];

  if (totalQuantity >= QUANTITY_THRESHOLDS.TOTAL_BULK_MIN) {
    bonusPoints += POINTS.BULK_30_BONUS;
    details.push(POINTS_MESSAGES.BULK_30);
  } else if (totalQuantity >= 20) {
    bonusPoints += POINTS.BULK_20_BONUS;
    details.push(POINTS_MESSAGES.BULK_20);
  } else if (totalQuantity >= QUANTITY_THRESHOLDS.BULK_DISCOUNT_MIN) {
    bonusPoints += POINTS.BULK_10_BONUS;
    details.push(POINTS_MESSAGES.BULK_10);
  }

  return { points: bonusPoints, details };
};

/**
 * 모든 포인트를 종합적으로 계산합니다.
 * @param {number} totalAmount - 최종 구매 금액
 * @param {Array} cartItemDetails - 장바구니 상품 상세 정보
 * @param {number} totalQuantity - 총 구매 수량
 * @param {Date} date - 현재 날짜
 * @returns {Object} 종합 포인트 계산 결과
 */
export const calculateTotalPoints = (
  totalAmount,
  cartItemDetails,
  totalQuantity,
  date = new Date(),
) => {
  // 기본 포인트 계산
  const basePoints = calculateBasePoints(totalAmount);

  if (basePoints === 0 && cartItemDetails.length === 0) {
    return {
      totalPoints: 0,
      basePoints: 0,
      details: [],
      breakdown: {
        base: 0,
        tuesday: 0,
        setBonus: 0,
        quantityBonus: 0,
      },
    };
  }

  const pointsDetails = [];
  let finalPoints = 0;

  // 화요일 포인트 계산
  const tuesdayResult = calculateTuesdayPoints(basePoints, date);
  finalPoints = tuesdayResult.points;

  if (basePoints > 0) {
    const baseMessage = POINTS_MESSAGES.BASE.replace('{points}', basePoints);
    pointsDetails.push(baseMessage);

    if (tuesdayResult.applicable) {
      pointsDetails.push(POINTS_MESSAGES.TUESDAY_DOUBLE);
    }
  }

  // 세트 구성 확인 및 보너스 계산
  const setComposition = checkSetComposition(cartItemDetails);
  const setBonus = calculateSetBonus(setComposition);
  finalPoints += setBonus.points;
  pointsDetails.push(...setBonus.details);

  // 대량 구매 보너스 계산
  const quantityBonus = calculateQuantityBonus(totalQuantity);
  finalPoints += quantityBonus.points;
  pointsDetails.push(...quantityBonus.details);

  return {
    totalPoints: finalPoints,
    basePoints,
    details: pointsDetails,
    breakdown: {
      base: tuesdayResult.points,
      tuesday: tuesdayResult.applicable ? basePoints : 0,
      setBonus: setBonus.points,
      quantityBonus: quantityBonus.points,
    },
  };
};

/**
 * 포인트 표시용 메시지를 생성합니다.
 * @param {number} totalPoints - 총 포인트
 * @param {Array} details - 포인트 상세 내역
 * @returns {string} 포인트 표시 HTML
 */
export const generatePointsDisplayHTML = (totalPoints, details) => {
  if (totalPoints > 0) {
    return `
      <div>적립 포인트: <span class="font-bold">${totalPoints}p</span></div>
      <div class="text-2xs opacity-70 mt-1">${details.join(', ')}</div>
    `;
  }

  return '적립 포인트: 0p';
};
