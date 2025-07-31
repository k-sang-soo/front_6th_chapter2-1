/**
 * 쇼핑카트 애플리케이션의 비즈니스 상수 정의
 * @fileoverview 상품 정보, 할인율, 포인트 비율 등 비즈니스 로직 관련 상수들을 정의합니다.
 */

// 상품 ID 상수
export const PRODUCT_IDS = {
  KEYBOARD: 'p1',
  MOUSE: 'p2',
  MONITOR_ARM: 'p3',
  LAPTOP_POUCH: 'p4',
  SPEAKER: 'p5',
};

// 상품 기본 정보
export const PRODUCT_INFO = [
  {
    id: PRODUCT_IDS.KEYBOARD,
    name: '버그 없애는 키보드',
    price: 10000,
    initialStock: 50,
  },
  {
    id: PRODUCT_IDS.MOUSE,
    name: '생산성 폭발 마우스',
    price: 20000,
    initialStock: 30,
  },
  {
    id: PRODUCT_IDS.MONITOR_ARM,
    name: '거북목 탈출 모니터암',
    price: 30000,
    initialStock: 20,
  },
  {
    id: PRODUCT_IDS.LAPTOP_POUCH,
    name: '에러 방지 노트북 파우치',
    price: 15000,
    initialStock: 0,
  },
  {
    id: PRODUCT_IDS.SPEAKER,
    name: '코딩할 때 듣는 Lo-Fi 스피커',
    price: 25000,
    initialStock: 10,
  },
];

// 할인율 상수
export const DISCOUNT_RATES = {
  // 개별 상품 할인율 (10개 이상 구매 시)
  KEYBOARD_BULK: 0.1, // 10%
  MOUSE_BULK: 0.15, // 15%
  MONITOR_ARM_BULK: 0.2, // 20%
  LAPTOP_POUCH_BULK: 0.05, // 5%
  SPEAKER_BULK: 0.25, // 25%

  // 전체 할인율
  BULK_PURCHASE: 0.25, // 25% (30개 이상)
  TUESDAY_SPECIAL: 0.1, // 10% (화요일)
  LIGHTNING_SALE: 0.2, // 20% (번개세일)
  SUGGESTION_SALE: 0.05, // 5% (추천할인)
  SUPER_SALE: 0.25, // 25% (번개+추천 조합)
};

// 수량 임계값
export const QUANTITY_THRESHOLDS = {
  BULK_DISCOUNT_MIN: 10, // 개별 상품 대량 할인 최소 수량
  TOTAL_BULK_MIN: 30, // 전체 대량 할인 최소 수량
  LOW_STOCK_WARNING: 4, // 재고 부족 경고 임계값 (4개 이하일 때)
  STOCK_WARNING_THRESHOLD: 50, // 전체 재고 경고 임계값
};

// 포인트 관련 상수
export const POINTS = {
  BASE_RATE: 0.0001, // 기본 포인트 비율 (0.01% = 1/10000)
  TUESDAY_MULTIPLIER: 2, // 화요일 포인트 배수
  COMBO_KEYBOARD_MOUSE: 50, // 키보드+마우스 콤보 보너스
  FULL_SET_BONUS: 100, // 풀세트 구매 보너스
  BULK_10_BONUS: 20, // 10개 이상 구매 보너스
  BULK_20_BONUS: 50, // 20개 이상 구매 보너스
  BULK_30_BONUS: 100, // 30개 이상 구매 보너스
};

// 타이머 상수 (밀리초)
export const TIMERS = {
  LIGHTNING_SALE_INTERVAL: 30000, // 번개세일 간격 (30초)
  SUGGESTION_SALE_INTERVAL: 60000, // 추천할인 간격 (60초)
  MAX_INITIAL_DELAY: 10000, // 번개세일 초기 지연 최대값 (10초)
  MAX_SUGGESTION_DELAY: 20000, // 추천할인 초기 지연 최대값 (20초)
};

// 메시지 텍스트
export const MESSAGES = {
  OUT_OF_STOCK: '품절',
  LOW_STOCK: '재고 부족',
  STOCK_SHORTAGE: '재고가 부족합니다.',
  LIGHTNING_SALE_ALERT: '⚡번개세일! {productName}이(가) 20% 할인 중입니다!',
  SUGGESTION_SALE_ALERT: '💝 {productName}은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!',
  ITEMS_IN_CART: '🛍️ {count} items in cart',
  LOYALTY_POINTS: '적립 포인트: {points}p',
  STOCK_WARNING: '{productName}: 재고 부족 ({remaining}개 남음)',
  OUT_OF_STOCK_WARNING: '{productName}: 품절',
};

// 할인 표시 텍스트
export const DISCOUNT_LABELS = {
  LIGHTNING_SALE: '⚡SALE',
  SUGGESTION_SALE: '💝추천',
  SUPER_SALE: '⚡💝',
  LIGHTNING_DISCOUNT: '20% SALE!',
  SUGGESTION_DISCOUNT: '5% 추천할인!',
  SUPER_DISCOUNT: '25% SUPER SALE!',
};

// 포인트 상세 메시지
export const POINTS_MESSAGES = {
  BASE: '기본: {points}p',
  TUESDAY_DOUBLE: '화요일 2배',
  KEYBOARD_MOUSE_SET: '키보드+마우스 세트 +50p',
  FULL_SET: '풀세트 구매 +100p',
  BULK_10: '대량구매(10개+) +20p',
  BULK_20: '대량구매(20개+) +50p',
  BULK_30: '대량구매(30개+) +100p',
};

// 할인 표시 메시지
export const DISCOUNT_DISPLAY_MESSAGES = {
  BULK_PURCHASE: '🎉 대량구매 할인 (30개 이상)',
  TUESDAY_SPECIAL: '🌟 화요일 추가 할인',
  INDIVIDUAL_DISCOUNT: '{productName} (10개↑)',
};

// 요일 상수
export const DAYS = {
  TUESDAY: 2,
};
