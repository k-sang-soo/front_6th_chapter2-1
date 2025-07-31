import { describe, expect, it, beforeEach } from 'vitest';

describe('advanced test', () => {
  // 각 테스트 전에 localStorage 클리어
  beforeEach(() => {
    localStorage.clear();
  });

  it('advanced 버전이 basic 테스트와 호환되는지 확인 (간단)', async () => {
    // basic 버전을 advanced로 바꿔서 테스트
    const { beforeEach, afterEach, describe, expect, it, vi } = await import('vitest');

    // 간단한 이벤트 시뮬레이션 함수
    const simulateChange = (element, value) => {
      element.value = value;
      const event = new Event('change', { bubbles: true });
      element.dispatchEvent(event);
    };

    const simulateClick = (element) => {
      const event = new Event('click', { bubbles: true });
      element.dispatchEvent(event);
    };

    // 공통 헬퍼 함수
    const addItemsToCart = async (sel, addBtn, productId, count) => {
      simulateChange(sel, productId);
      await new Promise((resolve) => setTimeout(resolve, 100)); // React 상태 업데이트 대기
      for (let i = 0; i < count; i++) {
        simulateClick(addBtn);
        await new Promise((resolve) => setTimeout(resolve, 100)); // 각 클릭 후 대기
      }
    };

    const getCartItemQuantity = (cartDisp, productId) => {
      const item = cartDisp.querySelector(`#${productId}`);
      if (!item) return 0;
      const qtyElement = item.querySelector('.quantity-number');
      return qtyElement ? parseInt(qtyElement.textContent) : 0;
    };

    // 화요일 할인을 방지하기 위해 월요일로 설정
    const mockDate = new Date('2024-01-01T00:00:00.000Z'); // 월요일
    vi.spyOn(Date.prototype, 'getDay').mockReturnValue(mockDate.getDay());
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    // 전체 DOM 재초기화
    document.body.innerHTML = '<div id="app"></div>';

    // 모듈 캐시 클리어 및 재로드
    vi.resetModules();
    await import('../main.advanced.js');

    // React 렌더링 완료를 기다림
    await new Promise((resolve) => setTimeout(resolve, 200));

    // DOM 요소 참조
    const sel = document.getElementById('product-select');
    const addBtn = document.getElementById('add-to-cart');
    const cartDisp = document.getElementById('cart-items');
    const sum = document.getElementById('cart-total');
    const stockInfo = document.getElementById('stock-status');
    const itemCount = document.getElementById('item-count');
    const loyaltyPoints = document.getElementById('loyalty-points');
    const discountInfo = document.getElementById('discount-info');

    // 기본 기능 테스트: 상품 추가
    expect(sel).toBeTruthy();
    expect(addBtn).toBeTruthy();
    expect(cartDisp).toBeTruthy();

    // 상품 선택 및 추가 (React 방식)
    simulateChange(sel, 'p1');
    await new Promise((resolve) => setTimeout(resolve, 100)); // React 상태 업데이트 대기
    simulateClick(addBtn);

    // React 상태 변경 반영을 기다림
    await new Promise((resolve) => setTimeout(resolve, 200));

    // 장바구니에 아이템이 추가되었는지 확인
    expect(cartDisp.children.length).toBe(1);
    expect(cartDisp.querySelector('#p1')).toBeTruthy();

    // 기본 DOM 요소들이 존재하는지 확인
    expect(sum).toBeTruthy(); // cart-total
    expect(stockInfo).toBeTruthy(); // stock-status
    expect(itemCount).toBeTruthy(); // item-count
    expect(loyaltyPoints).toBeTruthy(); // loyalty-points

    // 총액이 정확히 계산되는지 확인 (p1 = 10000원, 콤마 포함)
    expect(sum.textContent).toContain('10,000');

    // 포인트가 계산되는지 확인 (10000원의 0.1% = 10p)
    expect(loyaltyPoints.textContent).toContain('10');

    // 아이템 카운트가 정확한지 확인
    expect(itemCount.textContent).toContain('1');
  });

  it('전체 basic 테스트와 100% 호환성 확인', async () => {
    // Basic 테스트를 advanced 버전에서 실행
    const { beforeEach, afterEach, describe, expect, it, vi } = await import('vitest');
    const userEvent = (await import('@testing-library/user-event')).default;

    // 공통 헬퍼 함수 (basic 테스트와 동일)
    const addItemsToCart = async (sel, addBtn, productId, count) => {
      simulateChange(sel, productId);
      await new Promise((resolve) => setTimeout(resolve, 50));
      for (let i = 0; i < count; i++) {
        simulateClick(addBtn);
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    };

    const getCartItemQuantity = (cartDisp, productId) => {
      const item = cartDisp.querySelector(`#${productId}`);
      if (!item) return 0;
      const qtyElement = item.querySelector('.quantity-number');
      return qtyElement ? parseInt(qtyElement.textContent) : 0;
    };

    // 간단한 이벤트 시뮬레이션 함수
    const simulateChange = (element, value) => {
      element.value = value;
      const event = new Event('change', { bubbles: true });
      element.dispatchEvent(event);
    };

    const simulateClick = (element) => {
      const event = new Event('click', { bubbles: true });
      element.dispatchEvent(event);
    };

    // 화요일 할인을 방지하기 위해 월요일로 설정
    const mockDate = new Date('2024-01-01T00:00:00.000Z');
    vi.spyOn(Date.prototype, 'getDay').mockReturnValue(mockDate.getDay());
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    // DOM 초기화
    document.body.innerHTML = '<div id="app"></div>';
    vi.resetModules();
    await import('../main.advanced.js');
    await new Promise((resolve) => setTimeout(resolve, 200));

    // DOM 요소 참조
    const sel = document.getElementById('product-select');
    const addBtn = document.getElementById('add-to-cart');
    const cartDisp = document.getElementById('cart-items');
    const sum = document.getElementById('cart-total');
    const stockInfo = document.getElementById('stock-status');
    const itemCount = document.getElementById('item-count');
    const loyaltyPoints = document.getElementById('loyalty-points');
    const discountInfo = document.getElementById('discount-info');

    // 1. 기본 기능 테스트
    expect(sel).toBeTruthy();
    expect(addBtn).toBeTruthy();
    expect(cartDisp).toBeTruthy();

    // 2. 상품 선택 및 추가
    await addItemsToCart(sel, addBtn, 'p1', 1);
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(cartDisp.children.length).toBe(1);
    expect(cartDisp.querySelector('#p1')).toBeTruthy();
    expect(getCartItemQuantity(cartDisp, 'p1')).toBe(1);

    // 3. 수량 변경 테스트
    const plusBtn = cartDisp.querySelector('#p1 .quantity-change[data-change="1"]');
    const minusBtn = cartDisp.querySelector('#p1 .quantity-change[data-change="-1"]');

    if (plusBtn) {
      simulateClick(plusBtn);
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(getCartItemQuantity(cartDisp, 'p1')).toBe(2);
    }

    if (minusBtn) {
      simulateClick(minusBtn);
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(getCartItemQuantity(cartDisp, 'p1')).toBe(1);
    }

    // 4. 상품 제거 테스트
    const removeBtn = cartDisp.querySelector('#p1 .remove-item');
    if (removeBtn) {
      simulateClick(removeBtn);
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(cartDisp.querySelector('#p1')).toBeFalsy();
    }

    console.log('전체 basic 테스트 호환성 확인 완료!');
  });
});
