/**
 * UI 상태 관리를 위한 Zustand slice
 * @fileoverview DOM 엘리먼트 참조, 타이머, 할인 상태 등 UI 관련 상태를 관리
 */

import { produce } from 'immer';
import type { StateCreator } from 'zustand';

/** UI 엘리먼트 참조 인터페이스 (AppState.ui 호환) */
export interface UIElements {
  /** 재고 정보 표시 엘리먼트 */
  stockInfoElement: HTMLElement | null;
  /** 상품 선택자 엘리먼트 */
  productSelector: HTMLElement | null;
  /** 장바구니 추가 버튼 엘리먼트 */
  addToCartButton: HTMLElement | null;
  /** 장바구니 표시 영역 엘리먼트 */
  cartDisplayArea: HTMLElement | null;
  /** 주문 요약 엘리먼트 */
  orderSummaryElement: HTMLElement | null;
}

/** 할인 타이머 상태 */
export interface DiscountTimer {
  /** 번개세일 타이머 ID */
  lightningTimerId: number | null;
  /** 추천세일 타이머 ID */
  suggestionTimerId: number | null;
  /** 번개세일 활성 상태 */
  isLightningActive: boolean;
  /** 추천세일 활성 상태 */
  isSuggestionActive: boolean;
}

/** UI 슬라이스 상태 인터페이스 */
export interface UISliceState {
  /** UI 엘리먼트 참조 */
  ui: UIElements;
  /** 할인 타이머 상태 */
  discountTimers: DiscountTimer;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 알림 메시지 */
  notification: string | null;
}

/** UI 슬라이스 액션 인터페이스 */
export interface UISliceActions {
  /**
   * UI 엘리먼트 참조를 설정합니다.
   * @param elementName - 엘리먼트 이름
   * @param element - DOM 엘리먼트
   */
  setUIElement: <K extends keyof UIElements>(elementName: K, element: UIElements[K]) => void;

  /**
   * 특정 UI 엘리먼트 참조를 가져옵니다.
   * @param elementName - 엘리먼트 이름
   * @returns DOM 엘리먼트 또는 null
   */
  getUIElement: <K extends keyof UIElements>(elementName: K) => UIElements[K];

  /**
   * 번개세일 타이머를 설정합니다.
   * @param timerId - 타이머 ID
   */
  setLightningTimer: (timerId: number | null) => void;

  /**
   * 추천세일 타이머를 설정합니다.
   * @param timerId - 타이머 ID
   */
  setSuggestionTimer: (timerId: number | null) => void;

  /**
   * 번개세일 활성 상태를 설정합니다.
   * @param isActive - 활성 상태
   */
  setLightningActive: (isActive: boolean) => void;

  /**
   * 추천세일 활성 상태를 설정합니다.
   * @param isActive - 활성 상태
   */
  setSuggestionActive: (isActive: boolean) => void;

  /**
   * 모든 할인 타이머를 초기화합니다.
   */
  clearAllTimers: () => void;

  /**
   * 로딩 상태를 설정합니다.
   * @param isLoading - 로딩 상태
   */
  setLoading: (isLoading: boolean) => void;

  /**
   * 에러 메시지를 설정합니다.
   * @param error - 에러 메시지
   */
  setError: (error: string | null) => void;

  /**
   * 알림 메시지를 설정합니다.
   * @param notification - 알림 메시지
   */
  setNotification: (notification: string | null) => void;

  /**
   * UI 상태를 초기화합니다.
   */
  resetUIState: () => void;
}

/** UI 슬라이스 타입 */
export type UISlice = UISliceState & UISliceActions;

/** UI 슬라이스 초기 상태 */
const initialUIState: UISliceState = {
  ui: {
    stockInfoElement: null,
    productSelector: null,
    addToCartButton: null,
    cartDisplayArea: null,
    orderSummaryElement: null,
  },
  discountTimers: {
    lightningTimerId: null,
    suggestionTimerId: null,
    isLightningActive: false,
    isSuggestionActive: false,
  },
  isLoading: false,
  error: null,
  notification: null,
};

/**
 * UI 슬라이스 생성자
 * AppState의 UI 관련 로직과 할인 타이머를 위한 Zustand slice
 */
export const createUISlice: StateCreator<UISlice> = (set, get) => ({
  ...initialUIState,

  setUIElement: <K extends keyof UIElements>(elementName: K, element: UIElements[K]) => {
    set(
      produce((state: UISlice) => {
        if (Object.prototype.hasOwnProperty.call(state.ui, elementName)) {
          state.ui[elementName] = element;
        } else {
          // Development warning for invalid UI element registration
          console.warn(`Unknown UI element: ${elementName}`);
        }
      }),
    );
  },

  getUIElement: <K extends keyof UIElements>(elementName: K): UIElements[K] => {
    const state = get();
    return state.ui[elementName];
  },

  setLightningTimer: (timerId: number | null) => {
    set(
      produce((state: UISlice) => {
        state.discountTimers.lightningTimerId = timerId;
      }),
    );
  },

  setSuggestionTimer: (timerId: number | null) => {
    set(
      produce((state: UISlice) => {
        state.discountTimers.suggestionTimerId = timerId;
      }),
    );
  },

  setLightningActive: (isActive: boolean) => {
    set(
      produce((state: UISlice) => {
        state.discountTimers.isLightningActive = isActive;
      }),
    );
  },

  setSuggestionActive: (isActive: boolean) => {
    set(
      produce((state: UISlice) => {
        state.discountTimers.isSuggestionActive = isActive;
      }),
    );
  },

  clearAllTimers: () => {
    set(
      produce((state: UISlice) => {
        // 기존 타이머들 정리
        if (state.discountTimers.lightningTimerId) {
          clearTimeout(state.discountTimers.lightningTimerId);
        }
        if (state.discountTimers.suggestionTimerId) {
          clearTimeout(state.discountTimers.suggestionTimerId);
        }

        // 타이머 상태 초기화
        state.discountTimers = {
          lightningTimerId: null,
          suggestionTimerId: null,
          isLightningActive: false,
          isSuggestionActive: false,
        };
      }),
    );
  },

  setLoading: (isLoading: boolean) => {
    set(
      produce((state: UISlice) => {
        state.isLoading = isLoading;
      }),
    );
  },

  setError: (error: string | null) => {
    set(
      produce((state: UISlice) => {
        state.error = error;
      }),
    );
  },

  setNotification: (notification: string | null) => {
    set(
      produce((state: UISlice) => {
        state.notification = notification;
      }),
    );
  },

  resetUIState: () => {
    const currentState = get();

    // 타이머들 정리
    currentState.clearAllTimers();

    set(
      produce((state: UISlice) => {
        // UI 엘리먼트 참조는 유지하고 나머지만 초기화
        state.discountTimers = { ...initialUIState.discountTimers };
        state.isLoading = initialUIState.isLoading;
        state.error = initialUIState.error;
        state.notification = initialUIState.notification;
      }),
    );
  },
});
