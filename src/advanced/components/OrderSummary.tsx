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
  const _totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  /**
   * 할인 정보 렌더링
   */
  const _renderDiscountInfo = () => {
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
      return null;
    }

    return (
      <div className="space-y-3">
        {cartItems.map((item) => {
          const product = products[item.productId];
          if (!product) return null;

          return (
            <div key={item.productId} className="flex justify-between text-sm text-white">
              <span>
                {product.name} x {item.quantity}
              </span>
              <span>₩{(product.price * item.quantity).toLocaleString()}</span>
            </div>
          );
        })}
        <div className="flex justify-between text-sm text-white/70 pt-2">
          <span>Subtotal</span>
          <span>
            ₩
            {cartItems
              .reduce((sum, item) => {
                const product = products[item.productId];
                return sum + (product ? product.price * item.quantity : 0);
              }, 0)
              .toLocaleString()}
          </span>
        </div>
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
          <div id="discount-info" className="mb-4"></div>
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
