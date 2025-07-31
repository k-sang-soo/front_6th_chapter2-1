import React from 'react';
import { useCartStore } from '../stores';

/**
 * 주문 요약 컴포넌트
 */
export const OrderSummary: React.FC = () => {
  const {
    cartItems,
    products,
    totalAmount,
    loyaltyPoints,
    pointDetails,
    discounts,
    isTuesdayDiscount,
  } = useCartStore();

  const hasItems = cartItems.length > 0;

  // 실시간 subtotal 계산 (반응형)
  const realTimeSubtotal = cartItems.reduce((sum, item) => {
    const product = products[item.productId];
    return product ? sum + product.price * item.quantity : sum;
  }, 0);

  // 총 할인 계산
  const totalDiscountAmount = realTimeSubtotal - totalAmount;
  const totalDiscountRate =
    realTimeSubtotal > 0 ? (totalDiscountAmount / realTimeSubtotal) * 100 : 0;

  /**
   * 할인 정보 렌더링 (개별 상품 10개 이상, 전체 30개 이상 대량구매만)
   */
  const renderDiscountInfo = () => {
    if (!discounts || discounts.length === 0) return null;

    const discountsToShow = [];

    // 1. 대량구매 할인 (30개 이상) - 우선 표시
    const bulkDiscount = discounts.find((discount) => discount.type === 'bulk');
    if (bulkDiscount) {
      discountsToShow.push(bulkDiscount);
    } else {
      // 2. 개별 상품 할인 - 대량구매 할인이 없을 때만 하나만 표시
      const itemDiscount = discounts.find((discount) => discount.type === 'item');
      if (itemDiscount) {
        discountsToShow.push(itemDiscount);
      }
    }

    if (discountsToShow.length === 0) return null;

    return (
      <div className="space-y-1">
        {discountsToShow.map((discount, index) => (
          <div
            key={`${discount.type}-${index}`}
            className="flex justify-between text-sm tracking-wide text-green-400"
          >
            <span className="text-xs">{discount.message}</span>
            <span className="text-xs">-{discount.percentage}%</span>
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
      return null;
    }

    return (
      <div className="space-y-3">
        {cartItems.map((item) => {
          const product = products[item.productId];
          if (!product) return null;

          return (
            <div
              key={item.productId}
              className="flex justify-between text-xs tracking-wide text-gray-400"
            >
              <span>
                {product.name} x {item.quantity}
              </span>
              <span>₩{(product.price * item.quantity).toLocaleString()}</span>
            </div>
          );
        })}
        <div className="border-t border-white/10 my-3"></div>
        <div className="flex justify-between text-sm tracking-wide">
          <span>Subtotal</span>
          <span>₩{realTimeSubtotal.toLocaleString()}</span>
        </div>
        {renderDiscountInfo()}
        <div className="flex justify-between text-sm text-white/70">
          <span>Shipping</span>
          <span>Free</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-black text-white p-8 flex flex-col">
      <h2 className="text-xs font-medium mb-5 tracking-extra-wide uppercase">Order Summary</h2>
      <div className="flex-1 flex flex-col">
        <div id="summary-details" className="space-y-3">
          {renderSummaryDetails()}
        </div>
        <div className="mt-auto">
          {totalDiscountAmount > 0 && (
            <div id="discount-info" className="mb-4">
              <div className="bg-green-500/20 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
                  <span className="text-sm font-medium text-green-400">
                    {totalDiscountRate.toFixed(1)}%
                  </span>
                </div>
                <div className="text-2xs text-gray-300">
                  ₩{totalDiscountAmount.toLocaleString()} 할인되었습니다
                </div>
              </div>
            </div>
          )}
          <div id="cart-total" className="pt-5 border-t border-white/10">
            <div className="flex justify-between items-baseline">
              <span className="text-sm uppercase tracking-wider">Total</span>
              <div className="text-2xl tracking-tight">₩{totalAmount.toLocaleString()}</div>
            </div>
            <div id="loyalty-points" className="text-xs text-blue-400 mt-2 text-right">
              {loyaltyPoints > 0 ? (
                <div>
                  <div>
                    적립 포인트:{' '}
                    <span className="font-bold">{loyaltyPoints.toLocaleString()}p</span>
                  </div>
                  {pointDetails.breakdown.length > 0 && (
                    <div className="text-2xs opacity-70 mt-1">
                      {pointDetails.breakdown.join(', ')}
                    </div>
                  )}
                </div>
              ) : (
                '적립 포인트: 0p'
              )}
            </div>
          </div>
          {isTuesdayDiscount && (
            <div id="tuesday-special" className="mt-4 p-3 bg-white/10 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xs">🎉</span>
                <span className="text-xs uppercase tracking-wide">Tuesday Special 10% Applied</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <button
        className="w-full py-4 bg-white text-black text-sm font-normal uppercase tracking-super-wide cursor-pointer mt-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30 disabled:opacity-50"
        disabled={!hasItems}
        aria-label="결제하기"
      >
        Proceed to Checkout
      </button>
      <p className="mt-4 text-2xs text-white/60 text-center leading-relaxed">
        Free shipping on all orders.
        <br />
        <span id="points-notice">Earn loyalty points with purchase.</span>
      </p>
    </div>
  );
};
