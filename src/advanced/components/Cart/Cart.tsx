import React from 'react';
import { useCartStore } from '../../stores';
import { CartItem } from './CartItem';
import { EmptyCart } from './EmptyCart';

/**
 * 장바구니 컨테이너 컴포넌트
 */
export const Cart: React.FC = () => {
  const { cartItems } = useCartStore();

  const hasItems = cartItems.length > 0;

  return (
    <div id="cart-items" aria-label="Shopping cart items" aria-live="polite" className="space-y-3">
      {hasItems ? (
        cartItems.map((item) => <CartItem key={item.productId} item={item} />)
      ) : (
        <EmptyCart />
      )}
    </div>
  );
};
