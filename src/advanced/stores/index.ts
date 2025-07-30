/**
 * Zustand 스토어 모듈 통합 export
 * @fileoverview 모든 스토어 관련 타입과 함수들을 중앙에서 관리
 */

// 메인 스토어
export {
  useCartStore,
  resetAllState,
  useCartStoreSelectors,
  useCartStoreActions,
  createAppStateCompatibility,
  type CartStore,
} from './useCartStore';

// 슬라이스 타입들
export type {
  ProductState,
  ProductSlice,
  ProductSliceState,
  ProductSliceActions,
} from './slices/productSlice';

export type { CartSlice, CartSliceState, CartSliceActions } from './slices/cartSlice';

export type {
  UIElements,
  DiscountTimer,
  UISlice,
  UISliceState,
  UISliceActions,
} from './slices/uiSlice';

// 미들웨어
export {
  persist,
  createCartPersistConfig,
  clearPersistedState,
  hasPersistedState,
  type PersistOptions,
} from './middleware/persistMiddleware';

// 스토어 생성 함수들 (필요시 직접 사용)
export { createProductSlice } from './slices/productSlice';
export { createCartSlice } from './slices/cartSlice';
export { createUISlice } from './slices/uiSlice';
