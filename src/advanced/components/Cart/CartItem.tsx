import React from 'react';
import { useCartStore } from '../../stores/simpleCartStore';

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
  const handleQuantityChange = (change: number) => {
    const newQuantity = item.quantity + change;
    if (newQuantity <= 0) {
      removeFromCart(item.productId);
    } else {
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
    <div
      id={item.productId}
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 first:pt-0 last:border-b-0"
    >
      {/* 상품 이미지 영역 */}
      <div className="bg-gradient-black w-16 h-16 rounded-md mb-3"></div>

      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-800 flex-1">{product.name}</h3>
        <button
          onClick={handleRemove}
          className="remove-item text-red-500 hover:text-red-700 p-1"
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
          <button
            className="quantity-change px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            data-change="-1"
            onClick={() => handleQuantityChange(-1)}
            aria-label="수량 감소"
          >
            -
          </button>

          <span className="quantity-number font-medium min-w-[2rem] text-center">
            {item.quantity}
          </span>

          <button
            className="quantity-change px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            data-change="1"
            onClick={() => handleQuantityChange(1)}
            disabled={isQuantityAtMax}
            aria-label="수량 증가"
          >
            +
          </button>
        </div>

        <div className="text-right">
          <div className="font-medium">₩{totalPrice.toLocaleString()}</div>
          {isQuantityAtMax && <div className="text-xs text-red-500">최대 수량</div>}
        </div>
      </div>
    </div>
  );
};
