/**
 * DOM 초기화 및 구조 생성을 담당하는 모듈
 * 메인 애플리케이션의 DOM 구조를 체계적으로 생성합니다.
 */

import {
  createHeader,
  createProductSelector,
  createHelpModalButton,
  createHelpModalOverlay,
  createOrderSummary,
} from '../components/UIComponents.js';

import { AppState } from '../state/AppState.js';

/**
 * 메인 애플리케이션 DOM 구조를 초기화합니다.
 * @param {HTMLElement} rootElement - 루트 DOM 엘리먼트
 * @returns {Object} 생성된 주요 DOM 엘리먼트들의 참조
 */
export function initializeMainDOM(rootElement) {
  let headerElement;
  let gridContainer;
  let leftColumn;
  let selectorContainer;
  let rightColumn;
  let manualToggle;
  let manualOverlay;
  let manualColumn;

  // 헤더 생성
  headerElement = document.createElement('div');
  headerElement.innerHTML = createHeader();

  // 상품 선택 컴포넌트 생성 및 UI 엘리먼트 등록
  selectorContainer = document.createElement('div');
  selectorContainer.innerHTML = createProductSelector();
  AppState.setUIElement('productSelector', selectorContainer.querySelector('#product-select'));
  AppState.setUIElement('addToCartButton', selectorContainer.querySelector('#add-to-cart'));
  AppState.setUIElement('stockInfoElement', selectorContainer.querySelector('#stock-status'));

  // 메인 그리드 컨테이너 생성
  gridContainer = document.createElement('div');
  gridContainer.className =
    'grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden';

  // 좌측 열 생성
  leftColumn = document.createElement('div');
  leftColumn.className = 'bg-white border border-gray-200 p-8 overflow-y-auto';
  leftColumn.appendChild(selectorContainer);

  // 장바구니 표시 영역 생성
  const cartDisplayArea = document.createElement('div');
  cartDisplayArea.id = 'cart-items';
  cartDisplayArea.setAttribute('aria-label', 'Shopping cart items');
  cartDisplayArea.setAttribute('aria-live', 'polite');
  leftColumn.appendChild(cartDisplayArea);
  AppState.setUIElement('cartDisplayArea', cartDisplayArea);

  // 우측 열 (주문 요약) 생성
  rightColumn = document.createElement('div');
  rightColumn.innerHTML = createOrderSummary();
  AppState.setUIElement('orderSummaryElement', rightColumn.querySelector('#cart-total'));

  // 도움말 모달 컴포넌트 생성
  manualToggle = document.createElement('div');
  manualToggle.innerHTML = createHelpModalButton();

  manualOverlay = document.createElement('div');
  manualOverlay.innerHTML = createHelpModalOverlay();
  manualColumn = manualOverlay.querySelector('#help-modal-panel');

  // DOM 트리 조립
  gridContainer.appendChild(leftColumn);
  gridContainer.appendChild(rightColumn);
  manualOverlay.appendChild(manualColumn);
  rootElement.appendChild(headerElement);
  rootElement.appendChild(gridContainer);
  rootElement.appendChild(manualToggle);
  rootElement.appendChild(manualOverlay);

  return {
    headerElement,
    gridContainer,
    leftColumn,
    rightColumn,
    cartDisplayArea,
    manualToggle,
    manualOverlay,
    manualColumn,
  };
}

/**
 * 도움말 모달 이벤트 리스너를 설정합니다.
 * DOM 초기화 직후 호출되어야 합니다.
 */
export function setupHelpModalEvents() {
  const helpToggleButton = document.getElementById('help-modal-toggle');
  const helpOverlay = document.getElementById('help-modal-overlay');
  const helpPanel = document.getElementById('help-modal-panel');
  const helpCloseButton = document.getElementById('help-modal-close');

  helpToggleButton.onclick = () => {
    helpOverlay.classList.toggle('hidden');
    helpPanel.classList.toggle('translate-x-full');
  };

  helpOverlay.onclick = (e) => {
    if (e.target === helpOverlay) {
      helpOverlay.classList.add('hidden');
      helpPanel.classList.add('translate-x-full');
    }
  };

  helpCloseButton.onclick = () => {
    helpOverlay.classList.add('hidden');
    helpPanel.classList.add('translate-x-full');
  };
}
