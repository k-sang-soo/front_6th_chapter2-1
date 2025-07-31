/**
 * 간단한 영속화 유틸리티
 * @fileoverview localStorage를 이용한 상태 저장/복원 기능
 */

export interface PersistConfig<T> {
  /** localStorage 키 이름 */
  name: string;
  /** 저장할 상태 선택 함수 */
  partialize?: (state: T) => Partial<T>;
  /** 복원 시 병합 함수 */
  merge?: (persisted: unknown, current: T) => T;
  /** 버전 관리 */
  version?: number;
}

/**
 * 상태를 localStorage에 저장
 */
export const saveToStorage = <T>(key: string, state: T, version: number = 1): void => {
  if (typeof window === 'undefined') return;

  try {
    const dataToSave = {
      state,
      version,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(dataToSave));
  } catch (error) {
    console.warn(`Failed to save state to localStorage (${key}):`, error);
  }
};

/**
 * localStorage에서 상태 복원
 */
export const loadFromStorage = <T>(key: string, defaultState: T, version: number = 1): T => {
  if (typeof window === 'undefined') return defaultState;

  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultState;

    const parsed = JSON.parse(stored);

    // 버전 체크
    if (parsed.version !== version) {
      console.warn(`Version mismatch for ${key}. Clearing storage.`);
      localStorage.removeItem(key);
      return defaultState;
    }

    return { ...defaultState, ...parsed.state };
  } catch (error) {
    console.warn(`Failed to load state from localStorage (${key}):`, error);
    return defaultState;
  }
};

/**
 * localStorage 키 삭제
 */
export const clearStorage = (key: string): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to clear localStorage (${key}):`, error);
  }
};

/**
 * 장바구니 전용 영속화 상태 선택
 */
export const selectCartPersistState = <T extends Record<string, unknown>>(state: T) => {
  // UI나 타이머는 영속화하지 않고, 핵심 데이터만 저장
  const { timerState: _timerState, ...persistableState } = state;

  return {
    ...persistableState,
    // 타이머는 영속화하지 않음 (초기화된 상태로 시작)
    timerState: {
      lightningTimer: null,
      suggestionTimer: null,
      activeDiscounts: {},
    },
  };
};
