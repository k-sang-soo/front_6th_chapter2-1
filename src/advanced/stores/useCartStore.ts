/**
 * 메인 Zustand 카트 스토어
 * @fileoverview 모든 slice들을 결합한 중앙 상태 관리 스토어
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createProductSlice, type ProductSlice } from './slices/productSlice';
import { createCartSlice, type CartSlice } from './slices/cartSlice';
import { createUISlice, type UISlice } from './slices/uiSlice';
import { persist, createCartPersistConfig } from './middleware/persistMiddleware';

/** 전체 스토어 상태 타입 */
export type CartStore = ProductSlice & CartSlice & UISlice;

/** 스토어 DevTools 구성 */
interface DevToolsConfig {
  name: string;
  enabled: boolean;
}

/**
 * DevTools 설정
 * 개발 환경에서만 활성화
 */
const devToolsConfig: DevToolsConfig = {
  name: 'CartStore',
  enabled: process.env.NODE_ENV === 'development',
};

/**
 * 메인 카트 스토어 생성
 * ProductSlice, CartSlice, UISlice를 결합하여 통합 상태 관리 제공
 */
export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      (...args) => ({
        // Product Slice
        ...createProductSlice(...args),

        // Cart Slice
        ...createCartSlice(...args),

        // UI Slice
        ...createUISlice(...args),
      }),
      createCartPersistConfig('hanghae-cart-store'),
    ),
    {
      name: devToolsConfig.name,
      enabled: devToolsConfig.enabled,
    },
  ),
);

/**
 * 스토어 상태 초기화 유틸리티
 * 전체 애플리케이션 상태를 초기 상태로 리셋
 */
export const resetAllState = () => {
  const store = useCartStore.getState();

  // 각 slice의 리셋 메서드 호출
  store.resetProductState();
  store.resetCartState();
  store.resetUIState();
};

/**
 * 스토어 상태 선택자들 (성능 최적화용)
 */
export const useCartStoreSelectors = {
  // Product 관련 선택자
  products: () => useCartStore((state) => state.products),
  lastSelectedProductId: () => useCartStore((state) => state.lastSelectedProductId),
  getProduct: () => useCartStore((state) => state.getProduct),

  // Cart 관련 선택자
  cartItems: () => useCartStore((state) => state.cart.items),
  cartTotalQuantity: () => useCartStore((state) => state.cart.totalQuantity),
  cartSubtotal: () => useCartStore((state) => state.cart.subtotal),
  cartFinalAmount: () => useCartStore((state) => state.cart.finalAmount),
  cartLoyaltyPoints: () => useCartStore((state) => state.cart.loyaltyPoints),
  lastCalculation: () => useCartStore((state) => state.lastCalculation),

  // UI 관련 선택자
  uiElements: () => useCartStore((state) => state.ui),
  discountTimers: () => useCartStore((state) => state.discountTimers),
  isLoading: () => useCartStore((state) => state.isLoading),
  error: () => useCartStore((state) => state.error),
  notification: () => useCartStore((state) => state.notification),

  // 조합된 선택자들
  isCartEmpty: () => useCartStore((state) => state.cart.items.length === 0),
  hasActiveDiscounts: () =>
    useCartStore(
      (state) => state.discountTimers.isLightningActive || state.discountTimers.isSuggestionActive,
    ),

  // 특정 상품 관련 선택자
  getProductById: (productId: string) =>
    useCartStore((state) => state.products.find((p) => p.id === productId)),
  getCartItemById: (productId: string) =>
    useCartStore((state) => state.cart.items.find((item) => item.id === productId)),
};

/**
 * 스토어 액션들 (성능 최적화용)
 */
export const useCartStoreActions = {
  // Product 액션들
  initializeProducts: () => useCartStore((state) => state.initializeProducts),
  updateProduct: () => useCartStore((state) => state.updateProduct),
  setLastSelectedProduct: () => useCartStore((state) => state.setLastSelectedProduct),

  // Cart 액션들
  addToCart: () => useCartStore((state) => state.addToCart),
  removeFromCart: () => useCartStore((state) => state.removeFromCart),
  updateCartItemQuantity: () => useCartStore((state) => state.updateCartItemQuantity),
  clearCart: () => useCartStore((state) => state.clearCart),
  updateCartCalculation: () => useCartStore((state) => state.updateCartCalculation),

  // UI 액션들
  setUIElement: () => useCartStore((state) => state.setUIElement),
  setLightningTimer: () => useCartStore((state) => state.setLightningTimer),
  setSuggestionTimer: () => useCartStore((state) => state.setSuggestionTimer),
  setLightningActive: () => useCartStore((state) => state.setLightningActive),
  setSuggestionActive: () => useCartStore((state) => state.setSuggestionActive),
  clearAllTimers: () => useCartStore((state) => state.clearAllTimers),
  setLoading: () => useCartStore((state) => state.setLoading),
  setError: () => useCartStore((state) => state.setError),
  setNotification: () => useCartStore((state) => state.setNotification),

  // 통합 액션들
  resetAllState: () => resetAllState,
};

/**
 * AppState 호환성을 위한 래퍼 객체
 * 기존 코드와의 호환성을 유지하면서 점진적 마이그레이션 지원
 */
export const createAppStateCompatibility = () => {
  const store = useCartStore.getState();

  return {
    // 기존 AppState.products 호환
    get products() {
      return useCartStore.getState().products;
    },

    // 기존 AppState.lastSelectedProductId 호환
    get lastSelectedProductId() {
      return useCartStore.getState().lastSelectedProductId;
    },

    // 기존 AppState.ui 호환
    get ui() {
      return useCartStore.getState().ui;
    },

    // 기존 메서드들 호환
    initializeProducts: store.initializeProducts,
    updateProduct: store.updateProduct,
    getProduct: store.getProduct,
    setUIElement: store.setUIElement,
    setLastSelectedProduct: store.setLastSelectedProduct,
    getLastSelectedProduct: store.getLastSelectedProduct,
  };
};

// 개발 환경에서 전역 접근 허용 (디버깅용)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).cartStore = useCartStore;
  (window as any).resetCartStore = resetAllState;
}
