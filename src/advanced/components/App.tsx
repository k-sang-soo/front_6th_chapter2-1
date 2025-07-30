import React, { useEffect } from 'react';
import { useCartStore } from '../stores/simpleCartStore';
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
  }, [initializeProducts, startTimers]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <header className="bg-blue-600 text-white p-4" role="banner">
        <h1 className="text-xs font-medium mb-1">🛒 Hanghae Online Store</h1>
        <div className="text-5xl font-bold mb-2" role="heading" aria-level={2}>
          Shopping Cart
        </div>
        <p id="item-count" className="text-xs" aria-label="장바구니 아이템 수" aria-live="polite">
          🛍️ {totalItems} items in cart
        </p>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="container mx-auto p-4 flex gap-6">
        {/* 좌측 열 - 상품 선택 및 장바구니 */}
        <div className="w-1/2 p-4">
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
