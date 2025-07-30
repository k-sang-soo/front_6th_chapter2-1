import React from 'react';
import { useCartStore } from '../../stores/simpleCartStore';
import { Button } from '../common/Button';

interface CartItemType {
  productId: string;
  quantity: number;
}

interface CartItemProps {
  item: CartItemType;
}

/**
 * 장바구니 아이템 컴포넌트
 */
export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { products, updateItemQuantity, removeFromCart } = useCartStore();

  const product = products[item.productId];
  if (!product) return null;

  const totalPrice = product.price * item.quantity;
  const isQuantityAtMax = item.quantity >= product.stock;

  /**
   * 수량 변경 핸들러
   */
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(item.productId);
    } else if (newQuantity <= product.stock) {
      updateItemQuantity(item.productId, newQuantity);
    }
  };

  /**
   * 아이템 제거 핸들러
   */
  const handleRemove = () => {
    removeFromCart(item.productId);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-800 flex-1">{product.name}</h3>
        <button
          onClick={handleRemove}
          className="text-red-500 hover:text-red-700 p-1"
          aria-label={`${product.name} 삭제`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={item.quantity <= 1}
            aria-label="수량 감소"
          >
            -
          </Button>

          <span
            className="mx-2 min-w-[2rem] text-center font-medium"
            aria-label={`수량 ${item.quantity}개`}
          >
            {item.quantity}
          </span>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={isQuantityAtMax}
            aria-label="수량 증가"
          >
            +
          </Button>
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-500">
            ₩{product.price.toLocaleString()} × {item.quantity}
          </div>
          <div className="font-semibold text-gray-800">₩{totalPrice.toLocaleString()}</div>
        </div>
      </div>

      {isQuantityAtMax && (
        <div className="mt-2 text-xs text-orange-600">
          ⚠️ 재고가 부족합니다 (최대 {product.stock}개)
        </div>
      )}
    </div>
  );
};
