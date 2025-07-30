/**
 * 메인 애플리케이션 엔트리 포인트
 * 모듈 조합과 초기화만을 담당하는 단순화된 메인 파일
 */

import { PRODUCT_INFO } from './constants.js';
import { isCartEmpty } from './services/CartService.js';
import { initializeTimers } from './services/TimerService.js';
import { AppState } from './state/AppState.js';
import { initializeMainDOM, setupHelpModalEvents } from './dom/DOMInitializer.js';
import { setupCartEventListeners, setupAddToCartEventListener } from './events/EventHandlers.js';
import { calculateCartTotals, updateCartItemPrices } from './services/UIService.js';
import { updateProductSelectOptions } from './services/ProductService.js';

/**
 * 메인 애플리케이션 초기화 함수
 * 모든 모듈을 조합하여 애플리케이션을 시작합니다.
 */
function main() {
  const rootElement = document.getElementById('app');

  // 애플리케이션 상태 초기화
  AppState.initializeProducts(PRODUCT_INFO);
  ``;

  // DOM 구조 초기화
  initializeMainDOM(rootElement);

  // 이벤트 리스너 설정
  setupHelpModalEvents();
  setupAddToCartEventListener(calculateCartTotals);
  setupCartEventListeners(calculateCartTotals, updateProductSelectOptions);

  // 초기 UI 업데이트
  updateProductSelectOptions();
  calculateCartTotals();

  // 타이머 서비스로 할인 이벤트 초기화
  initializeTimers(
    AppState.products,
    () => AppState.getLastSelectedProduct(),
    () => {
      updateProductSelectOptions();
      updateCartItemPrices();
    },
    () => isCartEmpty(AppState.ui.cartDisplayArea.children),
  );
}

// 메인 애플리케이션 시작
main();
