/**
 * 장바구니 상태 관리를 위한 Zustand slice
 * @fileoverview 장바구니 아이템, 계산 결과, 포인트 등의 상태를 관리
 */

import { produce } from 'immer';
import type { StateCreator } from 'zustand';
import type {
  CartItem,
  CartState,
  CartCalculation,
  CartItemDetail,
  PointsBreakdown,
} from '../../types/cart.types';
import type { ProductId } from '../../types/product.types';

/** 장바구니 슬라이스 상태 인터페이스 */
export interface CartSliceState {
  /** 장바구니 기본 상태 */
  cart: CartState;
  /** 마지막 계산 결과 */
  lastCalculation: CartCalculation | null;
  /** 장바구니 업데이트 타임스탬프 */
  lastUpdated: number;
}

/** 장바구니 슬라이스 액션 인터페이스 */
export interface CartSliceActions {
  /**
   * 장바구니에 상품을 추가합니다.
   * @param productId - 상품 ID
   * @param quantity - 추가할 수량 (기본값: 1)
   */
  addToCart: (productId: ProductId, quantity?: number) => void;

  /**
   * 장바구니에서 상품을 제거합니다.
   * @param productId - 상품 ID
   */
  removeFromCart: (productId: ProductId) => void;

  /**
   * 장바구니 아이템의 수량을 업데이트합니다.
   * @param productId - 상품 ID
   * @param quantity - 새로운 수량
   */
  updateCartItemQuantity: (productId: ProductId, quantity: number) => void;

  /**
   * 장바구니를 비웁니다.
   */
  clearCart: () => void;

  /**
   * 특정 장바구니 아이템을 조회합니다.
   * @param productId - 상품 ID
   * @returns 장바구니 아이템 또는 null
   */
  getCartItem: (productId: ProductId) => CartItem | null;

  /**
   * 장바구니 계산 결과를 업데이트합니다.
   * @param calculation - 계산 결과
   */
  updateCartCalculation: (calculation: CartCalculation) => void;

  /**
   * 장바구니 기본 상태를 업데이트합니다.
   * @param cartState - 새로운 장바구니 상태
   */
  updateCartState: (cartState: Partial<CartState>) => void;

  /**
   * 장바구니 상태를 초기화합니다.
   */
  resetCartState: () => void;
}

/** 장바구니 슬라이스 타입 */
export type CartSlice = CartSliceState & CartSliceActions;

/** 장바구니 슬라이스 초기 상태 */
const initialCartState: CartSliceState = {
  cart: {
    items: [],
    totalQuantity: 0,
    subtotal: 0,
    totalDiscount: 0,
    finalAmount: 0,
    loyaltyPoints: 0,
  },
  lastCalculation: null,
  lastUpdated: Date.now(),
};

/**
 * 장바구니 슬라이스 생성자
 * 장바구니 아이템 관리와 계산 결과를 위한 Zustand slice
 */
export const createCartSlice: StateCreator<CartSlice> = (set, get) => ({
  ...initialCartState,

  addToCart: (productId: ProductId, quantity = 1) => {
    set(
      produce((state: CartSlice) => {
        const existingItemIndex = state.cart.items.findIndex((item) => item.id === productId);

        if (existingItemIndex !== -1) {
          // 기존 아이템 수량 증가
          state.cart.items[existingItemIndex].quantity += quantity;
        } else {
          // 새 아이템 추가
          state.cart.items.push({
            id: productId,
            quantity,
          });
        }

        state.lastUpdated = Date.now();
      }),
    );
  },

  removeFromCart: (productId: ProductId) => {
    set(
      produce((state: CartSlice) => {
        state.cart.items = state.cart.items.filter((item) => item.id !== productId);
        state.lastUpdated = Date.now();
      }),
    );
  },

  updateCartItemQuantity: (productId: ProductId, quantity: number) => {
    set(
      produce((state: CartSlice) => {
        const existingItemIndex = state.cart.items.findIndex((item) => item.id === productId);

        if (existingItemIndex !== -1) {
          if (quantity <= 0) {
            // 수량이 0 이하면 아이템 제거
            state.cart.items.splice(existingItemIndex, 1);
          } else {
            // 수량 업데이트
            state.cart.items[existingItemIndex].quantity = quantity;
          }
          state.lastUpdated = Date.now();
        }
      }),
    );
  },

  clearCart: () => {
    set(
      produce((state: CartSlice) => {
        state.cart.items = [];
        state.cart.totalQuantity = 0;
        state.cart.subtotal = 0;
        state.cart.totalDiscount = 0;
        state.cart.finalAmount = 0;
        state.cart.loyaltyPoints = 0;
        state.lastCalculation = null;
        state.lastUpdated = Date.now();
      }),
    );
  },

  getCartItem: (productId: ProductId) => {
    const state = get();
    return state.cart.items.find((item) => item.id === productId) || null;
  },

  updateCartCalculation: (calculation: CartCalculation) => {
    set(
      produce((state: CartSlice) => {
        state.lastCalculation = calculation;

        // 장바구니 기본 상태도 계산 결과로 업데이트
        state.cart.totalQuantity = calculation.itemsDetail.reduce(
          (total, item) => total + item.quantity,
          0,
        );
        state.cart.subtotal = calculation.subtotal;
        state.cart.totalDiscount = calculation.totalDiscount;
        state.cart.finalAmount = calculation.finalAmount;
        state.cart.loyaltyPoints = calculation.pointsBreakdown.total;

        state.lastUpdated = Date.now();
      }),
    );
  },

  updateCartState: (cartState: Partial<CartState>) => {
    set(
      produce((state: CartSlice) => {
        Object.assign(state.cart, cartState);
        state.lastUpdated = Date.now();
      }),
    );
  },

  resetCartState: () => {
    set(
      produce((state: CartSlice) => {
        Object.assign(state, initialCartState);
        state.lastUpdated = Date.now();
      }),
    );
  },
});
