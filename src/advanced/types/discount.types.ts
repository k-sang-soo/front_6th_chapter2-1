/**
 * 할인 관련 타입 정의
 * @fileoverview 다양한 할인 유형, 상태, 계산 등 할인 관련 핵심 타입들을 정의합니다.
 */

import type { ProductId } from './product.types';

/** 할인 유형 */
export type DiscountType =
  | 'individual' // 개별 상품 할인
  | 'bulk_purchase' // 대량구매 할인
  | 'tuesday_special' // 화요일 할인
  | 'lightning_sale' // 번개세일
  | 'suggestion_sale' // 추천할인
  | 'super_sale'; // 슈퍼세일 (번개 + 추천)

/** 개별 상품 할인 정보 */
export interface IndividualDiscount {
  type: 'individual';
  productId: ProductId;
  rate: number;
  minQuantity: number;
  isActive: boolean;
}

/** 대량구매 할인 정보 */
export interface BulkDiscount {
  type: 'bulk_purchase';
  rate: number;
  minTotalQuantity: number;
  isActive: boolean;
}

/** 화요일 할인 정보 */
export interface TuesdayDiscount {
  type: 'tuesday_special';
  rate: number;
  isActive: boolean;
}

/** 번개세일 할인 정보 */
export interface LightningDiscount {
  type: 'lightning_sale';
  productId: ProductId | null;
  rate: number;
  isActive: boolean;
  remainingTime?: number;
}

/** 추천할인 정보 */
export interface SuggestionDiscount {
  type: 'suggestion_sale';
  productId: ProductId | null;
  rate: number;
  isActive: boolean;
  remainingTime?: number;
}

/** 슈퍼세일 할인 정보 */
export interface SuperDiscount {
  type: 'super_sale';
  rate: number;
  isActive: boolean;
}

/** 통합 할인 정보 유니온 타입 */
export type Discount =
  | IndividualDiscount
  | BulkDiscount
  | TuesdayDiscount
  | LightningDiscount
  | SuggestionDiscount
  | SuperDiscount;

/** 활성 할인 상태 */
export interface ActiveDiscounts {
  /** 개별 상품 할인 목록 */
  individual: IndividualDiscount[];
  /** 대량구매 할인 */
  bulkPurchase: BulkDiscount | null;
  /** 화요일 할인 */
  tuesdaySpecial: TuesdayDiscount | null;
  /** 번개세일 */
  lightningSale: LightningDiscount | null;
  /** 추천할인 */
  suggestionSale: SuggestionDiscount | null;
  /** 슈퍼세일 */
  superSale: SuperDiscount | null;
}

/** 할인 적용 결과 */
export interface DiscountApplication {
  /** 할인 유형 */
  type: DiscountType;
  /** 할인명 */
  name: string;
  /** 할인율 */
  rate: number;
  /** 할인 금액 */
  amount: number;
  /** 적용된 상품 ID (개별 할인의 경우) */
  productId?: ProductId;
}

/** 할인 계산 결과 */
export interface DiscountCalculation {
  /** 적용된 할인 목록 */
  appliedDiscounts: DiscountApplication[];
  /** 총 할인 금액 */
  totalDiscountAmount: number;
  /** 할인 전 금액 */
  originalAmount: number;
  /** 할인 후 금액 */
  discountedAmount: number;
}

/** 프로모션 타이머 상태 */
export interface PromotionTimer {
  /** 프로모션 유형 */
  type: 'lightning_sale' | 'suggestion_sale';
  /** 활성화 여부 */
  isActive: boolean;
  /** 시작 시간 */
  startTime: number;
  /** 지속 시간 (밀리초) */
  duration: number;
  /** 남은 시간 (밀리초) */
  remainingTime: number;
  /** 대상 상품 ID */
  targetProductId?: ProductId;
}
