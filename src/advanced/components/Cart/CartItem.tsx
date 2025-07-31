import React from 'react';
import { useCartStore } from '../../stores';

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
  console.log('cartItem', products);

  const product = products[item.productId];
  if (!product) return null;

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

  // 할인 상태에 따른 라벨과 가격 HTML 생성 (Original 스타일)
  const getDiscountLabel = () => {
    if (product.onSale && product.suggestSale) {
      return '⚡💝';
    } else if (product.onSale) {
      return '⚡';
    } else if (product.suggestSale) {
      return '💝';
    }
    return '';
  };

  const getPriceHTML = () => {
    if (product.onSale || product.suggestSale) {
      const colorClass =
        product.onSale && product.suggestSale
          ? 'text-purple-600'
          : product.onSale
            ? 'text-red-500'
            : 'text-blue-500';

      const originalPrice = product.originalVal || product.price;

      return (
        <>
          <span className="line-through text-gray-400">₩{originalPrice.toLocaleString()}</span>{' '}
          <span className={colorClass}>₩{product.price.toLocaleString()}</span>
        </>
      );
    }
    return <span>₩{product.price.toLocaleString()}</span>;
  };

  return (
    <div
      id={item.productId}
      className="grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0"
      role="group"
      aria-label={`${product.name} in cart`}
    >
      {/* 상품 이미지 영역 */}
      <div className="w-20 h-20 bg-gradient-black relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
      </div>

      {/* 상품 정보 및 수량 조절 영역 */}
      <div>
        <h3 className="text-base font-normal mb-1 tracking-tight">
          {getDiscountLabel()}
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
        <p className="text-xs mb-3">{getPriceHTML()}</p>

        {/* 수량 조절 버튼 그룹 */}
        <div className="flex items-center gap-4" role="group" aria-label="수량 조절">
          <button
            className="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white"
            data-product-id={item.productId}
            data-change="-1"
            onClick={() => handleQuantityChange(-1)}
            aria-label={`${product.name} 수량 감소`}
          >
            −
          </button>
          <span
            className="quantity-number text-sm font-normal min-w-[20px] text-center tabular-nums"
            aria-label={`Quantity: ${item.quantity}`}
          >
            {item.quantity}
          </span>
          <button
            className="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white"
            data-product-id={item.productId}
            data-change="1"
            onClick={() => handleQuantityChange(1)}
            aria-label={`${product.name} 수량 증가`}
          >
            +
          </button>
        </div>
      </div>

      {/* 가격 및 제거 버튼 영역 */}
      <div className="text-right">
        <div className="text-lg mb-2 tracking-tight tabular-nums">{getPriceHTML()}</div>
        <button
          className="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black"
          data-product-id={item.productId}
          onClick={handleRemove}
          aria-label={`${product.name} 제거`}
        >
          REMOVE
        </button>
      </div>
    </div>
  );
};
