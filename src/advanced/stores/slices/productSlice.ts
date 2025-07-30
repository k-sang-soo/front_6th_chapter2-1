/**
 * 상품 상태 관리를 위한 Zustand slice
 * @fileoverview AppState의 products 상태와 관련 메서드들을 Zustand slice로 변환
 */

import { produce } from 'immer';
import type { StateCreator } from 'zustand';
import type { Product, ProductId } from '../../types/product.types';

/** 상품 내부 상태 인터페이스 (AppState.products 호환) */
export interface ProductState {
  /** 상품 ID */
  id: ProductId;
  /** 상품명 */
  name: string;
  /** 현재 가격 (할인 적용될 수 있음) */
  val: number;
  /** 원본 가격 */
  originalVal: number;
  /** 현재 재고 수량 */
  q: number;
  /** 번개세일 여부 */
  onSale: boolean;
  /** 추천세일 여부 */
  suggestSale: boolean;
}

/** 상품 슬라이스 상태 인터페이스 */
export interface ProductSliceState {
  /** 상품 목록 */
  products: ProductState[];
  /** 마지막 선택된 상품 ID */
  lastSelectedProductId: ProductId | null;
}

/** 상품 슬라이스 액션 인터페이스 */
export interface ProductSliceActions {
  /**
   * 상품 목록을 초기화합니다.
   * @param productInfo - 상품 정보 배열
   */
  initializeProducts: (productInfo: Product[]) => void;

  /**
   * 상품 정보를 업데이트합니다.
   * @param productId - 상품 ID
   * @param updates - 업데이트할 정보
   * @returns 업데이트 성공 여부
   */
  updateProduct: (productId: ProductId, updates: Partial<ProductState>) => boolean;

  /**
   * 특정 상품을 조회합니다.
   * @param productId - 상품 ID
   * @returns 상품 정보 또는 null
   */
  getProduct: (productId: ProductId) => ProductState | null;

  /**
   * 마지막 선택 상품 ID를 설정합니다.
   * @param productId - 상품 ID
   */
  setLastSelectedProduct: (productId: ProductId) => void;

  /**
   * 마지막 선택 상품 ID를 반환합니다.
   * @returns 마지막 선택 상품 ID
   */
  getLastSelectedProduct: () => ProductId | null;

  /**
   * 상품 상태를 초기화합니다.
   */
  resetProductState: () => void;
}

/** 상품 슬라이스 타입 */
export type ProductSlice = ProductSliceState & ProductSliceActions;

/** 상품 슬라이스 초기 상태 */
const initialProductState: ProductSliceState = {
  products: [],
  lastSelectedProductId: null,
};

/**
 * 상품 슬라이스 생성자
 * AppState의 products 관련 로직을 Zustand slice로 변환
 */
export const createProductSlice: StateCreator<ProductSlice> = (set, get) => ({
  ...initialProductState,

  initializeProducts: (productInfo: Product[]) => {
    set(
      produce((state: ProductSlice) => {
        state.products = productInfo.map((product) => ({
          id: product.id,
          name: product.name,
          val: product.price,
          originalVal: product.price,
          q: product.initialStock,
          onSale: false,
          suggestSale: false,
        }));
      }),
    );
  },

  updateProduct: (productId: ProductId, updates: Partial<ProductState>) => {
    let updateSuccess = false;

    set(
      produce((state: ProductSlice) => {
        const productIndex = state.products.findIndex((p) => p.id === productId);
        if (productIndex !== -1) {
          state.products[productIndex] = {
            ...state.products[productIndex],
            ...updates,
          };
          updateSuccess = true;
        }
      }),
    );

    return updateSuccess;
  },

  getProduct: (productId: ProductId) => {
    const state = get();
    return state.products.find((p) => p.id === productId) || null;
  },

  setLastSelectedProduct: (productId: ProductId) => {
    set(
      produce((state: ProductSlice) => {
        state.lastSelectedProductId = productId;
      }),
    );
  },

  getLastSelectedProduct: () => {
    const state = get();
    return state.lastSelectedProductId;
  },

  resetProductState: () => {
    set(
      produce((state: ProductSlice) => {
        Object.assign(state, initialProductState);
      }),
    );
  },
});
