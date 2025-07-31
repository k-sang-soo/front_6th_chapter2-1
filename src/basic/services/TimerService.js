/**
 * 타이머 기반 이벤트 관리 서비스
 * @fileoverview 번개세일과 추천할인 타이머를 관리하고 상품 할인을 적용합니다.
 * 의존성 주입을 통해 테스트 가능하고 side effect가 분리된 구조를 제공합니다.
 */

import { DISCOUNT_RATES, TIMERS, MESSAGES } from '../constants.js';

/**
 * 타이머 상태 관리 클래스
 * Race condition 방지와 메모리 누수 방지를 위한 중앙화된 타이머 관리
 */
class TimerStateManager {
  constructor() {
    this.activeTimers = new Map(); // ID별 타이머 관리
    this.activeSales = new Map(); // 상품별 활성 세일 상태
    this.timerIdCounter = 0;
  }

  /**
   * 새로운 타이머를 등록합니다.
   * @param {number} timerId - 타이머 ID
   * @param {string} type - 타이머 타입 ('interval' | 'timeout')
   * @returns {string} 내부 관리 ID
   */
  registerTimer(timerId, type) {
    const managementId = `${type}_${++this.timerIdCounter}`;
    this.activeTimers.set(managementId, { id: timerId, type });
    return managementId;
  }

  /**
   * 상품의 세일 상태를 등록합니다.
   * @param {string} productId - 상품 ID
   * @param {string} saleType - 세일 타입 ('lightning' | 'suggestion')
   * @returns {boolean} 등록 성공 여부
   */
  registerSale(productId, saleType) {
    const saleKey = `${productId}_${saleType}`;
    if (this.activeSales.has(saleKey)) {
      return false; // 이미 진행 중인 세일
    }
    this.activeSales.set(saleKey, { productId, saleType, timestamp: Date.now() });
    return true;
  }

  /**
   * 상품의 세일 상태를 해제합니다.
   * @param {string} productId - 상품 ID
   * @param {string} saleType - 세일 타입
   */
  unregisterSale(productId, saleType) {
    const saleKey = `${productId}_${saleType}`;
    this.activeSales.delete(saleKey);
  }

  /**
   * 모든 타이머를 정리합니다.
   */
  cleanup() {
    // 모든 활성 타이머 정리
    this.activeTimers.forEach(({ id, type }) => {
      if (type === 'interval') {
        clearInterval(id);
      } else if (type === 'timeout') {
        clearTimeout(id);
      }
    });

    // 상태 초기화
    this.activeTimers.clear();
    this.activeSales.clear();
    this.timerIdCounter = 0;
  }

  /**
   * 현재 활성 타이머 수를 반환합니다.
   * @returns {number} 활성 타이머 수
   */
  getActiveTimerCount() {
    return this.activeTimers.size;
  }

  /**
   * 현재 활성 세일 수를 반환합니다.
   * @returns {number} 활성 세일 수
   */
  getActiveSaleCount() {
    return this.activeSales.size;
  }
}

/**
 * 의존성 주입 가능한 타이머 서비스를 생성합니다.
 * @param {Object} dependencies - 주입할 의존성 객체
 * @param {Function} dependencies.alertFn - 알림 함수 (기본: window.alert)
 * @param {Function} dependencies.timerFn - 타이머 함수 (기본: setInterval)
 * @param {Function} dependencies.delayFn - 지연 함수 (기본: setTimeout)
 * @param {TimerStateManager} dependencies.stateManager - 상태 관리자 (선택적)
 * @returns {Object} 타이머 서비스 객체
 */
export const createTimerService = (dependencies = {}) => {
  const {
    alertFn = window.alert,
    timerFn = setInterval,
    delayFn = setTimeout,
    stateManager = new TimerStateManager(),
  } = dependencies;

  // 의존성 검증
  if (typeof alertFn !== 'function') {
    throw new Error('alertFn must be a function');
  }
  if (typeof timerFn !== 'function') {
    throw new Error('timerFn must be a function');
  }
  if (typeof delayFn !== 'function') {
    throw new Error('delayFn must be a function');
  }

  return {
    /**
     * 번개세일을 시작합니다.
     * @param {Array} products - 전체 상품 목록
     * @param {Function} onSaleStart - 세일 시작 콜백 함수
     * @returns {Object} 타이머 제어 객체
     */
    startLightningSale: (products, onSaleStart) => {
      const lightningDelay = generateRandomDelay(TIMERS.MAX_INITIAL_DELAY);
      let intervalManagementId = null;

      const delayTimer = delayFn(() => {
        const intervalTimer = timerFn(() => {
          const saleResult = processLightningSale(products, stateManager);

          if (saleResult.success) {
            executeSaleNotification(alertFn, saleResult.selectedProduct, 'lightning');

            if (onSaleStart) {
              onSaleStart(saleResult.selectedProduct);
            }
          }
        }, TIMERS.LIGHTNING_SALE_INTERVAL);

        intervalManagementId = stateManager.registerTimer(intervalTimer, 'interval');
      }, lightningDelay);

      const delayManagementId = stateManager.registerTimer(delayTimer, 'timeout');

      return {
        stop: () => {
          if (intervalManagementId) {
            const timerInfo = stateManager.activeTimers.get(intervalManagementId);
            if (timerInfo) {
              clearInterval(timerInfo.id);
              stateManager.activeTimers.delete(intervalManagementId);
            }
          }
        },
        getStatus: () => ({
          delayId: delayManagementId,
          intervalId: intervalManagementId,
          isActive: intervalManagementId !== null,
        }),
      };
    },

    /**
     * 추천할인을 시작합니다.
     * @param {Array} products - 전체 상품 목록
     * @param {Function} getLastSelectedProduct - 마지막 선택 상품 조회 함수
     * @param {Function} onSuggestionStart - 추천할인 시작 콜백 함수
     * @param {Function} isCartEmpty - 장바구니 비어있음 확인 함수
     * @returns {Object} 타이머 제어 객체
     */
    startSuggestionSale: (products, getLastSelectedProduct, onSuggestionStart, isCartEmpty) => {
      let intervalManagementId = null;

      const delayTimer = delayFn(() => {
        const intervalTimer = timerFn(() => {
          const saleResult = processSuggestionSale(
            products,
            getLastSelectedProduct,
            isCartEmpty,
            stateManager,
          );

          if (saleResult.success) {
            executeSaleNotification(alertFn, saleResult.suggestedProduct, 'suggestion');

            if (onSuggestionStart) {
              onSuggestionStart(saleResult.suggestedProduct);
            }
          }
        }, TIMERS.SUGGESTION_SALE_INTERVAL);

        intervalManagementId = stateManager.registerTimer(intervalTimer, 'interval');
      }, generateRandomDelay(TIMERS.MAX_SUGGESTION_DELAY));

      const delayManagementId = stateManager.registerTimer(delayTimer, 'timeout');

      return {
        stop: () => {
          if (intervalManagementId) {
            const timerInfo = stateManager.activeTimers.get(intervalManagementId);
            if (timerInfo) {
              clearInterval(timerInfo.id);
              stateManager.activeTimers.delete(intervalManagementId);
            }
          }
        },
        getStatus: () => ({
          delayId: delayManagementId,
          intervalId: intervalManagementId,
          isActive: intervalManagementId !== null,
        }),
      };
    },

    /**
     * 모든 활성 타이머를 정리합니다.
     * @returns {Object} 정리 결과 통계
     */
    cleanup: () => {
      const beforeCount = stateManager.getActiveTimerCount();
      const beforeSaleCount = stateManager.getActiveSaleCount();

      stateManager.cleanup();

      return {
        clearedTimers: beforeCount,
        clearedSales: beforeSaleCount,
        timestamp: Date.now(),
      };
    },

    /**
     * 타이머 서비스 상태를 조회합니다.
     * @returns {Object} 현재 상태 정보
     */
    getStatus: () => ({
      activeTimers: stateManager.getActiveTimerCount(),
      activeSales: stateManager.getActiveSaleCount(),
      uptime: Date.now(),
    }),
  };
};

/**
 * 번개세일 처리 로직 (순수 함수 + 상태 관리 분리)
 * @param {Array} products - 전체 상품 목록
 * @param {TimerStateManager} stateManager - 상태 관리자
 * @returns {Object} 처리 결과
 */
const processLightningSale = (products, stateManager) => {
  const eligibleProducts = getEligibleProductsForLightningSale(products);

  if (eligibleProducts.length === 0) {
    return { success: false, reason: 'no_eligible_products' };
  }

  const selectedProduct = selectRandomProduct(eligibleProducts);

  // Race condition 방지: 상태 관리자를 통한 안전한 등록
  if (!stateManager.registerSale(selectedProduct.id, 'lightning')) {
    return { success: false, reason: 'sale_already_active' };
  }

  const updatedProduct = applyLightningSale(selectedProduct);

  // 번개세일은 영구적으로 유지됨 (원본 동작과 일치)

  return {
    success: true,
    selectedProduct: updatedProduct,
    saleId: `${selectedProduct.id}_lightning`,
    timestamp: Date.now(),
  };
};

/**
 * 추천할인 처리 로직 (순수 함수 + 상태 관리 분리)
 * @param {Array} products - 전체 상품 목록
 * @param {Function} getLastSelectedProduct - 마지막 선택 상품 조회 함수
 * @param {Function} isCartEmpty - 장바구니 비어있음 확인 함수
 * @param {TimerStateManager} stateManager - 상태 관리자
 * @returns {Object} 처리 결과
 */
const processSuggestionSale = (products, getLastSelectedProduct, isCartEmpty, stateManager) => {
  // 전처리 검증
  const validationResult = validateSuggestionSaleConditions(
    products,
    getLastSelectedProduct,
    isCartEmpty,
  );

  if (!validationResult.isValid) {
    return { success: false, reason: validationResult.reason };
  }

  const { lastSelectedProduct, suggestedProduct } = validationResult;

  // Race condition 방지: 상태 관리자를 통한 안전한 등록
  if (!stateManager.registerSale(suggestedProduct.id, 'suggestion')) {
    return { success: false, reason: 'sale_already_active' };
  }

  const updatedProduct = applySuggestionSale(suggestedProduct);

  // 추천세일은 영구적으로 유지됨 (원본 동작과 일치)

  return {
    success: true,
    suggestedProduct: updatedProduct,
    lastSelectedProduct,
    saleId: `${suggestedProduct.id}_suggestion`,
    timestamp: Date.now(),
  };
};

/**
 * 상품 배열에서 랜덤하게 하나를 선택합니다. (순수 함수)
 * @param {Array} products - 상품 목록
 * @returns {Object} 선택된 상품
 */
const selectRandomProduct = (products) => {
  const randomIndex = Math.floor(Math.random() * products.length);
  return products[randomIndex];
};

/**
 * 추천할인 조건을 검증합니다. (순수 함수)
 * @param {Array} products - 전체 상품 목록
 * @param {Function} getLastSelectedProduct - 마지막 선택 상품 조회 함수
 * @param {Function} isCartEmpty - 장바구니 비어있음 확인 함수
 * @returns {Object} 검증 결과
 */
const validateSuggestionSaleConditions = (products, getLastSelectedProduct, isCartEmpty) => {
  if (isCartEmpty()) {
    return { isValid: false, reason: 'cart_empty' };
  }

  const lastSelectedProduct = getLastSelectedProduct();
  if (!lastSelectedProduct) {
    return { isValid: false, reason: 'no_last_selected' };
  }

  const suggestedProduct = findSuggestionProduct(products, lastSelectedProduct);
  if (!suggestedProduct) {
    return { isValid: false, reason: 'no_suggested_product' };
  }

  return {
    isValid: true,
    lastSelectedProduct,
    suggestedProduct,
  };
};

/**
 * 세일 알림을 실행합니다. (사이드 이펙트 분리)
 * @param {Function} alertFn - 알림 함수
 * @param {Object} product - 상품 정보
 * @param {string} saleType - 세일 타입
 */
const executeSaleNotification = (alertFn, product, saleType) => {
  const messageTemplate =
    saleType === 'lightning' ? MESSAGES.LIGHTNING_SALE_ALERT : MESSAGES.SUGGESTION_SALE_ALERT;

  const alertMessage = formatSaleMessage(messageTemplate, product.name);
  alertFn(alertMessage);
};

/**
 * 세일 메시지를 포맷팅합니다. (순수 함수)
 * @param {string} template - 메시지 템플릿
 * @param {string} productName - 상품명
 * @returns {string} 포맷된 메시지
 */
const formatSaleMessage = (template, productName) => {
  return template.replace('{productName}', productName);
};

/**
 * 번개세일을 시작합니다. (레거시 호환성을 위한 래퍼)
 * @param {Array} products - 전체 상품 목록
 * @param {Function} onSaleStart - 세일 시작 콜백 함수
 */
export const startLightningSale = (products, onSaleStart) => {
  const timerService = createTimerService();
  return timerService.startLightningSale(products, onSaleStart);
};

/**
 * 추천할인을 시작합니다. (레거시 호환성을 위한 래퍼)
 * @param {Array} products - 전체 상품 목록
 * @param {Function} getLastSelectedProduct - 마지막 선택 상품 조회 함수
 * @param {Function} onSuggestionStart - 추천할인 시작 콜백 함수
 * @param {Function} isCartEmpty - 장바구니 비어있음 확인 함수
 */
export const startSuggestionSale = (
  products,
  getLastSelectedProduct,
  onSuggestionStart,
  isCartEmpty,
) => {
  const timerService = createTimerService();
  return timerService.startSuggestionSale(
    products,
    getLastSelectedProduct,
    onSuggestionStart,
    isCartEmpty,
  );
};

/**
 * 번개세일 대상 상품을 필터링합니다.
 * @param {Array} products - 전체 상품 목록
 * @returns {Array} 번개세일 가능한 상품 목록
 */
export const getEligibleProductsForLightningSale = (products) => {
  return products.filter((product) => product.q > 0 && !product.onSale);
};

/**
 * 추천할인 대상 상품을 찾습니다.
 * @param {Array} products - 전체 상품 목록
 * @param {string} lastSelectedProductId - 마지막 선택된 상품 ID
 * @returns {Object|null} 추천할인 대상 상품 또는 null
 */
export const findSuggestionProduct = (products, lastSelectedProductId) => {
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    if (product.id !== lastSelectedProductId && product.q > 0 && !product.suggestSale) {
      return product;
    }
  }
  return null;
};

/**
 * 상품에 번개세일을 적용합니다 (원본 객체 직접 수정).
 * @param {Object} product - 할인을 적용할 상품 객체
 * @returns {Object} 수정된 상품 객체 (참조용)
 */
export const applyLightningSale = (product) => {
  const discountedPrice = Math.round(product.originalVal * (1 - DISCOUNT_RATES.LIGHTNING_SALE));

  // 원본 객체를 직접 수정 (원본 동작과 일치)
  product.val = discountedPrice;
  product.onSale = true;

  return product;
};

/**
 * 상품에 추천할인을 적용합니다 (원본 객체 직접 수정).
 * @param {Object} product - 할인을 적용할 상품 객체
 * @returns {Object} 수정된 상품 객체 (참조용)
 */
export const applySuggestionSale = (product) => {
  const discountedPrice = Math.round(product.val * (1 - DISCOUNT_RATES.SUGGESTION_SALE));

  // 원본 객체를 직접 수정 (원본 동작과 일치)
  product.val = discountedPrice;
  product.suggestSale = true;

  return product;
};

/**
 * 상품의 할인 상태를 확인합니다.
 * @param {Object} product - 확인할 상품 객체
 * @returns {Object} 할인 상태 정보
 */
export const getDiscountStatus = (product) => {
  return {
    isOnLightningSale: product.onSale,
    isOnSuggestionSale: product.suggestSale,
    isSuperSale: product.onSale && product.suggestSale,
    currentPrice: product.val,
    originalPrice: product.originalVal,
    discountAmount: product.originalVal - product.val,
  };
};

/**
 * 모든 할인 타이머를 초기화합니다.
 * 애플리케이션 종료 시 정리할 수 있는 타이머 서비스 인스턴스를 반환합니다.
 * @param {Array} products - 전체 상품 목록
 * @param {Function} getLastSelectedProduct - 마지막 선택 상품 조회 함수
 * @param {Function} onSaleStart - 세일 시작 콜백 함수
 * @param {Function} isCartEmpty - 장바구니 비어있음 확인 함수
 * @returns {Object} 타이머 서비스 인스턴스 (cleanup 메서드 포함)
 */
export const initializeTimers = (products, getLastSelectedProduct, onSaleStart, isCartEmpty) => {
  const timerService = createTimerService();

  // 타이머 시작 및 참조 저장
  const lightningTimer = timerService.startLightningSale(products, onSaleStart);
  const suggestionTimer = timerService.startSuggestionSale(
    products,
    getLastSelectedProduct,
    onSaleStart,
    isCartEmpty,
  );

  // 향상된 타이머 서비스 인터페이스 반환
  return {
    ...timerService,
    lightningTimer,
    suggestionTimer,
    /**
     * 모든 타이머의 상태를 조회합니다.
     * @returns {Object} 타이머 상태 정보
     */
    getAllTimerStatus: () => ({
      service: timerService.getStatus(),
      lightning: lightningTimer.getStatus(),
      suggestion: suggestionTimer.getStatus(),
    }),
    /**
     * 특정 타이머만 중지합니다.
     * @param {string} timerType - 'lightning' | 'suggestion' | 'all'
     */
    stopTimer: (timerType) => {
      switch (timerType) {
        case 'lightning':
          lightningTimer.stop();
          break;
        case 'suggestion':
          suggestionTimer.stop();
          break;
        case 'all':
          lightningTimer.stop();
          suggestionTimer.stop();
          break;
        default:
          throw new Error(`Unknown timer type: ${timerType}`);
      }
    },
  };
};

/**
 * 타이머 지연 시간을 생성합니다.
 * @param {number} maxDelay - 최대 지연 시간 (밀리초)
 * @param {number} minDelay - 최소 지연 시간 (밀리초, 기본값: 0)
 * @returns {number} 랜덤 지연 시간
 */
export const generateRandomDelay = (maxDelay, minDelay = 0) => {
  if (maxDelay < minDelay) {
    throw new Error('maxDelay must be greater than or equal to minDelay');
  }
  return Math.random() * (maxDelay - minDelay) + minDelay;
};

/**
 * 기본 타이머 상태 관리자 인스턴스를 생성합니다.
 * 테스트나 특별한 경우가 아니면 이 인스턴스를 사용하세요.
 * @returns {TimerStateManager} 타이머 상태 관리자
 */
export const createDefaultStateManager = () => new TimerStateManager();
