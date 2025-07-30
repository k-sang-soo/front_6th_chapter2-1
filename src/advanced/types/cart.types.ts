/**
 * 장바구니 관련 타입 정의
 * @fileoverview 장바구니 아이템, 상태, 포인트 등 장바구니 관련 핵심 타입들을 정의합니다.
 */

import type { ProductId } from './product.types';

/** 장바구니 아이템 */
export interface CartItem {
  /** 상품 ID */
  id: ProductId;
  /** 수량 */
  quantity: number;
}

/** 장바구니 상태 */
export interface CartState {
  /** 장바구니 아이템 목록 */
  items: CartItem[];
  /** 총 수량 */
  totalQuantity: number;
  /** 총 금액 (할인 적용 전) */
  subtotal: number;
  /** 총 할인 금액 */
  totalDiscount: number;
  /** 최종 결제 금액 (할인 적용 후) */
  finalAmount: number;
  /** 적립 포인트 */
  loyaltyPoints: number;
}

/** 포인트 계산 상세 정보 */
export interface PointsBreakdown {
  /** 기본 포인트 */
  base: number;
  /** 화요일 추가 포인트 */
  tuesdayBonus: number;
  /** 키보드+마우스 콤보 보너스 */
  keyboardMouseCombo: number;
  /** 풀세트 구매 보너스 */
  fullSetBonus: number;
  /** 대량구매 보너스 (10개+) */
  bulk10Bonus: number;
  /** 대량구매 보너스 (20개+) */
  bulk20Bonus: number;
  /** 대량구매 보너스 (30개+) */
  bulk30Bonus: number;
  /** 총 포인트 */
  total: number;
}

/** 장바구니 아이템 세부 정보 (계산용) */
export interface CartItemDetail extends CartItem {
  /** 상품명 */
  name: string;
  /** 상품 단가 */
  price: number;
  /** 소계 (수량 × 단가) */
  subtotal: number;
  /** 개별 할인율 */
  individualDiscountRate: number;
  /** 개별 할인 금액 */
  individualDiscount: number;
  /** 할인 적용된 개별 금액 */
  discountedAmount: number;
}

/** 장바구니 계산 결과 */
export interface CartCalculation {
  /** 장바구니 아이템 세부 정보 */
  itemsDetail: CartItemDetail[];
  /** 할인 전 총액 */
  subtotal: number;
  /** 개별 할인 총액 */
  individualDiscounts: number;
  /** 대량구매 할인 금액 */
  bulkDiscount: number;
  /** 화요일 할인 금액 */
  tuesdayDiscount: number;
  /** 번개세일 할인 금액 */
  lightningDiscount: number;
  /** 추천할인 금액 */
  suggestionDiscount: number;
  /** 총 할인 금액 */
  totalDiscount: number;
  /** 최종 결제 금액 */
  finalAmount: number;
  /** 포인트 상세 정보 */
  pointsBreakdown: PointsBreakdown;
}
