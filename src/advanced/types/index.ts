/**
 * 타입 정의 통합 export
 * @fileoverview 모든 타입 정의를 한 곳에서 export하여 쉽게 import할 수 있도록 합니다.
 */

// 상품 관련 타입
export type {
  ProductId,
  Product,
  ProductStock,
  StockStatus,
  ProductStockInfo,
  ProductDisplayInfo,
} from './product.types';

// 장바구니 관련 타입
export type {
  CartItem,
  CartState,
  PointsBreakdown,
  CartItemDetail,
  CartCalculation,
} from './cart.types';

// 할인 관련 타입
export type {
  DiscountType,
  IndividualDiscount,
  BulkDiscount,
  TuesdayDiscount,
  LightningDiscount,
  SuggestionDiscount,
  SuperDiscount,
  Discount,
  ActiveDiscounts,
  DiscountApplication,
  DiscountCalculation,
  PromotionTimer,
} from './discount.types';

/** 애플리케이션 전체 상태 */
export interface AppState {
  /** 상품 목록 */
  products: Product[];
  /** 상품 재고 정보 */
  productStocks: Record<ProductId, ProductStockInfo>;
  /** 장바구니 상태 */
  cart: CartState;
  /** 활성 할인 정보 */
  activeDiscounts: ActiveDiscounts;
  /** 프로모션 타이머 상태 */
  promotionTimers: {
    lightningSale: PromotionTimer | null;
    suggestionSale: PromotionTimer | null;
  };
  /** UI 상태 */
  ui: {
    /** 현재 선택된 상품 ID */
    selectedProductId: ProductId | null;
    /** 로딩 상태 */
    isLoading: boolean;
    /** 에러 메시지 */
    errorMessage: string | null;
  };
}

/** 이벤트 타입 */
export type AppEvent =
  | { type: 'ADD_TO_CART'; payload: { productId: ProductId; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: { productId: ProductId; quantity: number } }
  | { type: 'UPDATE_CART_ITEM'; payload: { productId: ProductId; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'ACTIVATE_LIGHTNING_SALE'; payload: { productId: ProductId } }
  | { type: 'DEACTIVATE_LIGHTNING_SALE' }
  | { type: 'ACTIVATE_SUGGESTION_SALE'; payload: { productId: ProductId } }
  | { type: 'DEACTIVATE_SUGGESTION_SALE' }
  | { type: 'UPDATE_STOCK'; payload: { productId: ProductId; stock: number } }
  | { type: 'SET_ERROR'; payload: { message: string } }
  | { type: 'CLEAR_ERROR' };

/** 액션 핸들러 타입 */
export type AppActionHandler = (event: AppEvent) => void;

/** 상태 변경 콜백 타입 */
export type StateChangeCallback = (state: AppState) => void;
