import React from 'react';
import { useCartStore } from '../stores/simpleCartStore';
import { Button } from './common/Button';

/**
 * 주문 요약 컴포넌트
 */
export const OrderSummary: React.FC = () => {
  const { cartItems, products, totalAmount, loyaltyPoints, discounts, isTuesdayDiscount } =
    useCartStore();

  const hasItems = cartItems.length > 0;
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  /**
   * 할인 정보 렌더링
   */
  const renderDiscountInfo = () => {
    if (!discounts || discounts.length === 0) return null;

    return (
      <div id="discount-info" className="text-sm text-green-600 space-y-1 mb-4">
        {discounts.map((discount, index) => (
          <div key={`${discount.type}-${index}`}>
            {discount.message} ({discount.percentage}% 할인)
          </div>
        ))}
      </div>
    );
  };

  /**
   * 주문 상세 내역 렌더링
   */
  const renderSummaryDetails = () => {
    if (!hasItems) {
      return (
        <div className="text-sm text-gray-500 text-center py-8">장바구니에 상품을 추가해주세요</div>
      );
    }

    const subtotal = cartItems.reduce((sum, item) => {
      const product = products[item.productId];
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    return (
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>상품 개수</span>
          <span>{totalQuantity}개</span>
        </div>
        <div className="flex justify-between">
          <span>소계</span>
          <span>₩{subtotal.toLocaleString()}</span>
        </div>
        {renderDiscountInfo()}
      </div>
    );
  };

  return (
    <aside
      className="w-80 bg-white p-6 rounded-lg shadow-sm"
      role="complementary"
      aria-label="주문 요약"
    >
      <h2 className="text-xl font-bold mb-4 text-gray-800">주문요약</h2>

      <div className="flex flex-col h-96">
        {/* 주문 상세 내역 영역 */}
        <div id="summary-details" className="flex-1 overflow-y-auto">
          {renderSummaryDetails()}
        </div>

        <div className="mt-auto">
          {/* 총 결제 금액 영역 */}
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">총액</span>
              <div
                id="cart-total"
                className="text-xl font-bold text-blue-600"
                aria-label="총 결제 금액"
              >
                ₩{totalAmount.toLocaleString()}
              </div>
            </div>
            <div
              id="loyalty-points"
              className="text-sm text-blue-600 mt-1"
              aria-label="적립 포인트"
            >
              적립 포인트: {loyaltyPoints.toLocaleString()}p
            </div>
          </div>

          {/* 화요일 특별 할인 알림 */}
          {isTuesdayDiscount && (
            <div
              id="tuesday-special"
              className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xs">🎉</span>
                <span className="text-xs uppercase tracking-wide">화요일 특별 할인!</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 체크아웃 버튼 */}
      <Button fullWidth size="lg" className="mt-4" disabled={!hasItems} aria-label="결제하기">
        주문하기
      </Button>

      {/* 추가 정보 */}
      <p className="text-xs text-gray-500 mt-3 leading-relaxed">
        50,000원 이상 구매 시 무료배송
        <br />
        <span id="points-notice">구매 시 포인트를 적립해드립니다.</span>
      </p>
    </aside>
  );
};
