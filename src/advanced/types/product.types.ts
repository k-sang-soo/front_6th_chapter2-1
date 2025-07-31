/**
 * 상품 관련 타입 정의
 * @fileoverview 상품, 재고, 가격 등 상품 관련 핵심 타입들을 정의합니다.
 */

/** 상품 ID 유니온 타입 */
export type ProductId = 'p1' | 'p2' | 'p3' | 'p4' | 'p5';

/** 상품 기본 정보 인터페이스 */
export interface Product {
  /** 상품 고유 ID */
  id: ProductId;
  /** 상품명 */
  name: string;
  /** 상품 가격 */
  price: number;
  /** 초기 재고 수량 */
  initialStock: number;
  /** 원래 가격 (할인 전) */
  originalVal?: number;
  /** 번개세일 상태 */
  onSale?: boolean;
  /** 추천세일 상태 */
  suggestSale?: boolean;
}

/** 상품 재고 상태 */
export interface ProductStock {
  /** 상품 ID */
  id: ProductId;
  /** 현재 재고 수량 */
  currentStock: number;
  /** 초기 재고 수량 */
  initialStock: number;
}

/** 재고 상태 타입 */
export type StockStatus = 'available' | 'low_stock' | 'out_of_stock';

/** 상품 재고 상태 정보 */
export interface ProductStockInfo extends ProductStock {
  /** 재고 상태 */
  status: StockStatus;
  /** 재고 부족 경고 여부 */
  isLowStock: boolean;
  /** 품절 여부 */
  isOutOfStock: boolean;
}

/** 상품 표시 정보 (UI용) */
export interface ProductDisplayInfo extends Product {
  /** 현재 재고 수량 */
  currentStock: number;
  /** 재고 상태 */
  stockStatus: StockStatus;
  /** 활성 할인 정보 */
  activeDiscounts: string[];
  /** 할인 적용된 가격 */
  discountedPrice?: number;
}
