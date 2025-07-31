import React, { useEffect } from 'react';
import { useCartStore } from '../stores';
import { ProductSelector } from './ProductSelector';
import { Cart } from './Cart/Cart';
import { OrderSummary } from './OrderSummary';
import { HelpModal } from './HelpModal';

/**
 * 메인 애플리케이션 컴포넌트
 */
export const App: React.FC = () => {
  const { cartItems, initializeProducts, startTimers } = useCartStore();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    initializeProducts();
    startTimers();

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      const store = useCartStore.getState();
      store.clearTimers();
    };
  }, [initializeProducts, startTimers]);

  return (
    <div className="max-w-screen-xl h-screen max-h-800 mx-auto p-8 flex flex-col">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-xs font-medium tracking-extra-wide uppercase mb-2">
          🛒 Hanghae Online Store
        </h1>
        <div className="text-5xl tracking-tight leading-none">Shopping Cart</div>
        <p
          id="item-count"
          className="text-sm text-gray-500 font-normal mt-3"
          aria-label="장바구니 아이템 수"
          aria-live="polite"
        >
          🛍️ {totalItems} items in cart
        </p>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden">
        {/* 좌측 열 - 상품 선택 및 장바구니 */}
        <div className="bg-white border border-gray-200 p-8 overflow-y-auto">
          <ProductSelector />
          <Cart />
        </div>

        {/* 우측 열 - 주문 요약 */}
        <OrderSummary />
      </div>

      {/* 도움말 모달 */}
      <HelpModal />
    </div>
  );
};
