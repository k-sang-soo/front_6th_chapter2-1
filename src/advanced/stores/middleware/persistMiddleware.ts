/**
 * 상태 영속화를 위한 Zustand 미들웨어
 * @fileoverview localStorage를 이용한 장바구니 상태 영속화 기능
 */

import type { StateCreator, StoreMutatorIdentifier } from 'zustand';

/** 영속화 설정 옵션 */
export interface PersistOptions<T> {
  /** localStorage 키 이름 */
  name: string;
  /** 영속화할 상태 선택 함수 (선택적) */
  partialize?: (state: T) => Partial<T>;
  /** 상태 복원 시 병합 함수 (선택적) */
  merge?: (persistedState: unknown, currentState: T) => T;
  /** 영속화 제외할 키들 */
  skipHydration?: boolean;
  /** 버전 관리 */
  version?: number;
}

type PersistImpl = <T>(
  stateCreator: StateCreator<T, [], [], T>,
  options: PersistOptions<T>,
) => StateCreator<T, [], [], T>;

/** 영속화 미들웨어 타입 */
type Persist = PersistImpl;

/**
 * 안전한 JSON 파싱 함수
 * @param str - 파싱할 JSON 문자열
 * @returns 파싱된 객체 또는 null
 */
const safeParse = (str: string): unknown => {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
};

/**
 * 기본 병합 함수
 * @param persistedState - 영속화된 상태
 * @param currentState - 현재 상태
 * @returns 병합된 상태
 */
const defaultMerge = <T>(persistedState: unknown, currentState: T): T => {
  if (typeof persistedState !== 'object' || persistedState === null) {
    return currentState;
  }

  return {
    ...currentState,
    ...(persistedState as Partial<T>),
  };
};

/**
 * 영속화 미들웨어 구현
 * 장바구니 상태를 localStorage에 저장하고 복원하는 기능 제공
 */
export const persist: Persist = <T>(
  stateCreator: StateCreator<T, [], [], T>,
  options: PersistOptions<T>,
) => {
  const {
    name,
    partialize = (state) => state,
    merge = defaultMerge,
    skipHydration = false,
    version = 1,
  } = options;

  return (set, get, api) => {
    const initialState = stateCreator(set, get, api);

    // localStorage에서 상태 복원
    if (!skipHydration && typeof window !== 'undefined') {
      try {
        const persistedData = localStorage.getItem(name);
        if (persistedData) {
          const parsed = safeParse(persistedData);
          if (parsed && typeof parsed === 'object' && parsed !== null) {
            const persistedState = parsed as { state?: unknown; version?: number };

            // 버전 체크
            if (persistedState.version === version && persistedState.state) {
              const mergedState = merge(persistedState.state, initialState);
              Object.assign(initialState, mergedState);
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to load persisted state for ${name}:`, error);
      }
    }

    // 상태 변경 시 localStorage에 저장하는 래핑된 set 함수
    const persistedSet: typeof set = (partial, replace) => {
      set(partial, replace);

      if (typeof window !== 'undefined') {
        try {
          const currentState = get();
          const stateToSave = partialize(currentState);
          const persistData = {
            state: stateToSave,
            version,
            timestamp: Date.now(),
          };

          localStorage.setItem(name, JSON.stringify(persistData));
        } catch (error) {
          console.warn(`Failed to save persisted state for ${name}:`, error);
        }
      }
    };

    return stateCreator(persistedSet, get, api);
  };
};

/**
 * 장바구니 전용 영속화 설정
 * UI 관련 상태는 제외하고 장바구니와 상품 상태만 영속화
 */
export const createCartPersistConfig = <T extends Record<string, any>>(
  name: string = 'cart-store',
): PersistOptions<T> => ({
  name,
  version: 1,
  partialize: (state) => {
    // UI 관련 상태는 영속화에서 제외
    const { ui, discountTimers, isLoading, error, notification, ...persistableState } =
      state as any;

    return {
      ...persistableState,
      // UI 상태 중 중요한 것들만 선별적으로 포함
      lastUpdated: (state as any).lastUpdated,
    } as Partial<T>;
  },
  merge: (persistedState, currentState) => {
    if (typeof persistedState !== 'object' || persistedState === null) {
      return currentState;
    }

    const persisted = persistedState as Partial<T>;

    return {
      ...currentState,
      ...persisted,
      // UI 상태는 현재 상태 유지
      ui: (currentState as any).ui,
      discountTimers: (currentState as any).discountTimers,
      isLoading: false, // 로딩 상태는 항상 false로 초기화
      error: null, // 에러 상태는 항상 null로 초기화
      notification: null, // 알림 상태는 항상 null로 초기화
    };
  },
});

/**
 * 영속화된 데이터를 수동으로 지우는 유틸리티 함수
 * @param name - localStorage 키 이름
 */
export const clearPersistedState = (name: string): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.warn(`Failed to clear persisted state for ${name}:`, error);
    }
  }
};

/**
 * 영속화된 데이터 존재 여부 확인
 * @param name - localStorage 키 이름
 * @returns 데이터 존재 여부
 */
export const hasPersistedState = (name: string): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const data = localStorage.getItem(name);
    return data !== null;
  } catch {
    return false;
  }
};
