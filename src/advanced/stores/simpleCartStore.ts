/**
 * 간단한 React 호환 카트 스토어
 * @fileoverview React 컴포넌트에서 직접 사용할 수 있는 간단한 Zustand 스토어
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Product } from '../types/product.types';
import { PRODUCT_INFO } from '../constants';

interface CartItem {
  productId: string;
  quantity: number;
}

interface SimpleCartStore {
  // 상태
  products: Record<string, Product & { stock: number }>;
  cartItems: CartItem[];
  totalAmount: number;
  loyaltyPoints: number;
  discounts: Record<string, { label: string; amount: number }> | null;
  stockStatus: Record<string, string>;

  // 계산된 상태
  isTuesdayDiscount: boolean;

  // 액션
  initializeProducts: () => void;
  addToCart: (productId: string) => boolean;
  removeFromCart: (productId: string) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  updateStockStatus: () => void;
  startTimers: () => void;
  calculateTotals: () => void;
}

/**
 * 간단한 카트 스토어 생성
 */
export const useCartStore = create<SimpleCartStore>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      products: {},
      cartItems: [],
      totalAmount: 0,
      loyaltyPoints: 0,
      discounts: null,
      stockStatus: {},

      // 계산된 상태
      get isTuesdayDiscount() {
        const today = new Date().getDay();
        return today === 2; // 화요일
      },

      // 상품 초기화
      initializeProducts: () => {
        const products: Record<string, Product & { stock: number }> = {};
        const stockStatus: Record<string, string> = {};

        PRODUCT_INFO.forEach((product) => {
          products[product.id] = {
            ...product,
            stock: product.initialStock,
          };

          if (product.initialStock === 0) {
            stockStatus[product.id] = 'out_of_stock';
          } else if (product.initialStock < 5) {
            stockStatus[product.id] = 'low_stock';
          } else {
            stockStatus[product.id] = 'available';
          }
        });

        set({ products, stockStatus });
      },

      // 장바구니에 추가
      addToCart: (productId: string) => {
        const state = get();
        const product = state.products[productId];

        if (!product || product.stock <= 0) {
          return false;
        }

        const existingItemIndex = state.cartItems.findIndex((item) => item.productId === productId);

        let newCartItems: CartItem[];
        if (existingItemIndex !== -1) {
          // 기존 아이템 수량 증가
          newCartItems = [...state.cartItems];
          newCartItems[existingItemIndex].quantity += 1;
        } else {
          // 새 아이템 추가
          newCartItems = [...state.cartItems, { productId, quantity: 1 }];
        }

        // 재고 감소
        const newProducts = {
          ...state.products,
          [productId]: {
            ...product,
            stock: product.stock - 1,
          },
        };

        set({ cartItems: newCartItems, products: newProducts });
        get().calculateTotals();
        get().updateStockStatus();
        return true;
      },

      // 장바구니에서 제거
      removeFromCart: (productId: string) => {
        const state = get();
        const cartItem = state.cartItems.find((item) => item.productId === productId);

        if (cartItem) {
          // 재고 복원
          const product = state.products[productId];
          const newProducts = {
            ...state.products,
            [productId]: {
              ...product,
              stock: product.stock + cartItem.quantity,
            },
          };

          const newCartItems = state.cartItems.filter((item) => item.productId !== productId);

          set({ cartItems: newCartItems, products: newProducts });
          get().calculateTotals();
          get().updateStockStatus();
        }
      },

      // 수량 업데이트
      updateItemQuantity: (productId: string, newQuantity: number) => {
        const state = get();
        const existingItem = state.cartItems.find((item) => item.productId === productId);

        if (!existingItem) return;

        const product = state.products[productId];
        const quantityDiff = newQuantity - existingItem.quantity;

        // 재고 확인
        if (quantityDiff > 0 && product.stock < quantityDiff) {
          return; // 재고 부족
        }

        if (newQuantity <= 0) {
          // 아이템 제거
          get().removeFromCart(productId);
          return;
        }

        // 수량 업데이트
        const newCartItems = state.cartItems.map((item) =>
          item.productId === productId ? { ...item, quantity: newQuantity } : item,
        );

        // 재고 업데이트
        const newProducts = {
          ...state.products,
          [productId]: {
            ...product,
            stock: product.stock - quantityDiff,
          },
        };

        set({ cartItems: newCartItems, products: newProducts });
        get().calculateTotals();
        get().updateStockStatus();
      },

      // 재고 상태 업데이트
      updateStockStatus: () => {
        const state = get();
        const stockStatus: Record<string, string> = {};

        Object.values(state.products).forEach((product) => {
          if (product.stock === 0) {
            stockStatus[product.id] = 'out_of_stock';
          } else if (product.stock < 5) {
            stockStatus[product.id] = 'low_stock';
          } else {
            stockStatus[product.id] = 'available';
          }
        });

        set({ stockStatus });
      },

      // 총액 계산
      calculateTotals: () => {
        const state = get();
        let totalAmount = 0;
        let loyaltyPoints = 0;

        state.cartItems.forEach((item) => {
          const product = state.products[item.productId];
          if (product) {
            totalAmount += product.price * item.quantity;
          }
        });

        // 기본 포인트 계산 (0.1%)
        loyaltyPoints = Math.floor(totalAmount * 0.001);

        // 화요일 2배 적립
        if (get().isTuesdayDiscount) {
          loyaltyPoints *= 2;
        }

        set({ totalAmount, loyaltyPoints });
      },

      // 타이머 시작 (placeholder)
      startTimers: () => {
        console.log('타이머 시작됨');
      },
    }),
    {
      name: 'SimpleCartStore',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
);
