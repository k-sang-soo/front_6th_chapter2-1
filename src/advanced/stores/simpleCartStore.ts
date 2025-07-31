/**
 * 완전한 React 호환 카트 스토어
 * @fileoverview 모든 비즈니스 로직을 포함한 완전한 쇼핑카트 구현
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Product } from '../types/product.types';
import {
  PRODUCT_INFO,
  DISCOUNT_RATES,
  QUANTITY_THRESHOLDS,
  DISCOUNT_DISPLAY_MESSAGES,
  POINTS,
} from '../constants';

interface CartItem {
  productId: string;
  quantity: number;
}

interface DiscountInfo {
  type: string;
  message: string;
  percentage: number;
}

interface TimerState {
  lightningTimer: NodeJS.Timeout | null;
  suggestionTimer: NodeJS.Timeout | null;
  activeDiscounts: {
    lightning?: { productId: string; discountRate: number };
    suggestion?: { productId: string; discountRate: number };
  };
}

interface SimpleCartStore {
  // 상태
  products: Record<string, Product & { stock: number }>;
  cartItems: CartItem[];
  totalAmount: number;
  loyaltyPoints: number;
  discounts: DiscountInfo[];
  stockStatus: Record<string, string>;
  timerState: TimerState;

  // 계산된 상태
  get isTuesdayDiscount(): boolean;
  get totalQuantity(): number;
  get subtotal(): number;

  // 액션
  initializeProducts: () => void;
  addToCart: (productId: string) => boolean;
  removeFromCart: (productId: string) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  updateStockStatus: () => void;
  startTimers: () => void;
  calculateTotals: () => void;
  applyLightningSale: (productId: string) => void;
  applySuggestionSale: (productId: string) => void;
  clearTimers: () => void;
}

/**
 * 완전한 카트 스토어 생성
 */
export const useCartStore = create<SimpleCartStore>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      products: {},
      cartItems: [],
      totalAmount: 0,
      loyaltyPoints: 0,
      discounts: [],
      stockStatus: {},
      timerState: {
        lightningTimer: null,
        suggestionTimer: null,
        activeDiscounts: {},
      },

      // 계산된 상태
      get isTuesdayDiscount() {
        const today = new Date().getDay();
        return today === 2; // 화요일
      },

      get totalQuantity() {
        return get().cartItems.reduce((sum, item) => sum + item.quantity, 0);
      },

      get subtotal() {
        const state = get();
        return state.cartItems.reduce((sum, item) => {
          const product = state.products[item.productId];
          return product ? sum + product.price * item.quantity : sum;
        }, 0);
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

      // 총액 및 할인 계산
      calculateTotals: () => {
        const state = get();
        if (state.cartItems.length === 0) {
          set({ totalAmount: 0, loyaltyPoints: 0, discounts: [] });
          return;
        }

        // 장바구니 상품 상세 정보 생성
        const cartItemDetails = state.cartItems.map((item) => {
          const product = state.products[item.productId];
          return {
            id: item.productId,
            name: product.name,
            price: product.price,
            quantity: item.quantity,
            total: product.price * item.quantity,
          };
        });

        const subtotal = cartItemDetails.reduce((sum, item) => sum + item.total, 0);
        const totalQuantity = cartItemDetails.reduce((sum, item) => sum + item.quantity, 0);

        // 할인 계산
        let finalAmount = subtotal;
        const discounts: DiscountInfo[] = [];

        // 대량 구매 할인 확인 (30개 이상)
        const isBulkDiscount = totalQuantity >= QUANTITY_THRESHOLDS.TOTAL_BULK_MIN;

        if (isBulkDiscount) {
          // 대량 구매 할인 적용
          const discountAmount = finalAmount * DISCOUNT_RATES.BULK_PURCHASE;
          finalAmount -= discountAmount;
          discounts.push({
            type: 'bulk',
            message: DISCOUNT_DISPLAY_MESSAGES.BULK_PURCHASE,
            percentage: DISCOUNT_RATES.BULK_PURCHASE * 100,
          });
        } else {
          // 개별 상품 할인 적용 (10개 이상)
          cartItemDetails.forEach((item) => {
            if (item.quantity >= QUANTITY_THRESHOLDS.BULK_DISCOUNT_MIN) {
              let discountRate = 0;
              switch (item.id) {
                case 'p1':
                  discountRate = DISCOUNT_RATES.KEYBOARD_BULK;
                  break;
                case 'p2':
                  discountRate = DISCOUNT_RATES.MOUSE_BULK;
                  break;
                case 'p3':
                  discountRate = DISCOUNT_RATES.MONITOR_ARM_BULK;
                  break;
                case 'p4':
                  discountRate = DISCOUNT_RATES.LAPTOP_POUCH_BULK;
                  break;
                case 'p5':
                  discountRate = DISCOUNT_RATES.SPEAKER_BULK;
                  break;
              }

              if (discountRate > 0) {
                const itemDiscountAmount = item.total * discountRate;
                finalAmount -= itemDiscountAmount;
                discounts.push({
                  type: 'item',
                  message: DISCOUNT_DISPLAY_MESSAGES.INDIVIDUAL_DISCOUNT.replace(
                    '{productName}',
                    item.name,
                  ),
                  percentage: discountRate * 100,
                });
              }
            }
          });
        }

        // 특별 할인 적용 (번개세일, 추천할인)
        if (state.timerState.activeDiscounts.lightning) {
          const { productId, discountRate } = state.timerState.activeDiscounts.lightning;
          const product = state.products[productId];
          discounts.push({
            type: 'lightning',
            message: `⚡ 번개세일! ${product.name}`,
            percentage: discountRate * 100,
          });
        }

        if (state.timerState.activeDiscounts.suggestion) {
          const { productId, discountRate } = state.timerState.activeDiscounts.suggestion;
          const product = state.products[productId];
          discounts.push({
            type: 'suggestion',
            message: `💝 ${product.name} 추천할인!`,
            percentage: discountRate * 100,
          });
        }

        // 화요일 할인 적용
        if (state.isTuesdayDiscount && finalAmount > 0) {
          const tuesdayDiscountAmount = finalAmount * DISCOUNT_RATES.TUESDAY_SPECIAL;
          finalAmount -= tuesdayDiscountAmount;
          discounts.push({
            type: 'tuesday',
            message: DISCOUNT_DISPLAY_MESSAGES.TUESDAY_SPECIAL,
            percentage: DISCOUNT_RATES.TUESDAY_SPECIAL * 100,
          });
        }

        // 포인트 계산
        let loyaltyPoints = Math.floor(finalAmount * POINTS.BASE_RATE);

        // 화요일 2배 적립
        if (state.isTuesdayDiscount) {
          loyaltyPoints *= 2;
        }

        // 수량 보너스
        if (totalQuantity >= 30) {
          loyaltyPoints += POINTS.QUANTITY_BONUS.THIRTY_PLUS;
        } else if (totalQuantity >= 20) {
          loyaltyPoints += POINTS.QUANTITY_BONUS.TWENTY_PLUS;
        } else if (totalQuantity >= 10) {
          loyaltyPoints += POINTS.QUANTITY_BONUS.TEN_PLUS;
        }

        // 세트 보너스 계산
        const hasKeyboard = state.cartItems.some((item) => item.productId === 'p1');
        const hasMouse = state.cartItems.some((item) => item.productId === 'p2');
        const hasAll = state.cartItems.length >= 5;

        if (hasAll) {
          loyaltyPoints += POINTS.SET_BONUS.FULL_SET;
        } else if (hasKeyboard && hasMouse) {
          loyaltyPoints += POINTS.SET_BONUS.KEYBOARD_MOUSE;
        }

        set({
          totalAmount: Math.round(finalAmount),
          loyaltyPoints,
          discounts,
        });
      },

      // 타이머 시작
      startTimers: () => {
        const startLightningSale = () => {
          const delay = Math.random() * 10000 + 10000; // 10-20초
          const timer = setTimeout(() => {
            const productIds = ['p1', 'p2', 'p3', 'p4', 'p5'];
            const randomProduct = productIds[Math.floor(Math.random() * productIds.length)];
            get().applyLightningSale(randomProduct);
            startLightningSale(); // 재귀 호출로 반복
          }, delay);

          set((state) => ({
            timerState: {
              ...state.timerState,
              lightningTimer: timer,
            },
          }));
        };

        const startSuggestionSale = () => {
          const delay = Math.random() * 15000 + 15000; // 15-30초
          const timer = setTimeout(() => {
            const state = get();
            if (state.cartItems.length > 0) {
              const productIds = ['p1', 'p2', 'p3', 'p4', 'p5'];
              const availableProducts = productIds.filter(
                (id) => !state.cartItems.some((item) => item.productId === id),
              );
              if (availableProducts.length > 0) {
                const randomProduct =
                  availableProducts[Math.floor(Math.random() * availableProducts.length)];
                get().applySuggestionSale(randomProduct);
              }
            }
            startSuggestionSale(); // 재귀 호출로 반복
          }, delay);

          set((state) => ({
            timerState: {
              ...state.timerState,
              suggestionTimer: timer,
            },
          }));
        };

        startLightningSale();
        startSuggestionSale();
      },

      // 번개세일 적용
      applyLightningSale: (productId: string) => {
        const state = get();
        const product = state.products[productId];
        if (!product) return;

        const discountRate = 0.2; // 20% 할인

        set((state) => ({
          timerState: {
            ...state.timerState,
            activeDiscounts: {
              ...state.timerState.activeDiscounts,
              lightning: { productId, discountRate },
            },
          },
        }));

        // 5초 후 해제
        setTimeout(() => {
          set((state) => {
            const { lightning: _lightning, ...rest } = state.timerState.activeDiscounts;
            return {
              timerState: {
                ...state.timerState,
                activeDiscounts: rest,
              },
            };
          });
          get().calculateTotals();
        }, 5000);

        get().calculateTotals();

        // 알림 표시
        if (typeof window !== 'undefined') {
          alert(`⚡ 번개세일! ${product.name}이(가) 20% 할인 중입니다!`);
        }
      },

      // 추천할인 적용
      applySuggestionSale: (productId: string) => {
        const state = get();
        const product = state.products[productId];
        if (!product) return;

        const discountRate = 0.05; // 5% 할인

        set((state) => ({
          timerState: {
            ...state.timerState,
            activeDiscounts: {
              ...state.timerState.activeDiscounts,
              suggestion: { productId, discountRate },
            },
          },
        }));

        // 5초 후 해제
        setTimeout(() => {
          set((state) => {
            const { suggestion: _suggestion, ...rest } = state.timerState.activeDiscounts;
            return {
              timerState: {
                ...state.timerState,
                activeDiscounts: rest,
              },
            };
          });
          get().calculateTotals();
        }, 5000);

        get().calculateTotals();

        // 알림 표시
        if (typeof window !== 'undefined') {
          alert(`💝 ${product.name}은(는) 어떠세요? 5% 추가 할인!`);
        }
      },

      // 타이머 정리
      clearTimers: () => {
        const state = get();
        if (state.timerState.lightningTimer) {
          clearTimeout(state.timerState.lightningTimer);
        }
        if (state.timerState.suggestionTimer) {
          clearTimeout(state.timerState.suggestionTimer);
        }
        set({
          timerState: {
            lightningTimer: null,
            suggestionTimer: null,
            activeDiscounts: {},
          },
        });
      },
    }),
    {
      name: 'SimpleCartStore',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
);
