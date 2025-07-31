import React, { useState, useEffect } from 'react';
import { useCartStore } from '../stores/simpleCartStore';
import { Button } from './common/Button';

/**
 * 상품 선택 컴포넌트
 * 상품 드롭다운과 장바구니 추가 버튼을 제공
 */
export const ProductSelector: React.FC = () => {
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  const { products, addToCart, initializeProducts, updateStockStatus } = useCartStore();

  // 컴포넌트 마운트 시 상품 초기화
  useEffect(() => {
    initializeProducts();
  }, [initializeProducts]);

  // 재고 상태 업데이트
  useEffect(() => {
    updateStockStatus();
  }, [products, updateStockStatus]);

  /**
   * 상품 선택 핸들러
   */
  const handleProductSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProductId(event.target.value);
  };

  /**
   * 장바구니 추가 핸들러
   */
  const handleAddToCart = () => {
    if (!selectedProductId) return;

    const success = addToCart(selectedProductId);
    if (success) {
      // 성공 시 선택 초기화
      setSelectedProductId('');
    }
  };

  /**
   * 선택된 상품 정보 가져오기
   */
  const selectedProduct = selectedProductId ? products[selectedProductId] : null;
  const isOutOfStock = Boolean(selectedProduct && selectedProduct.stock === 0);
  const isAddButtonDisabled = !selectedProductId || isOutOfStock;

  /**
   * 재고 상태 메시지 생성
   */
  const getStockStatusMessage = () => {
    if (!selectedProduct) return '';

    const { stock, name } = selectedProduct;
    if (stock === 0) {
      return `❌ ${name} - 품절`;
    } else if (stock < 5) {
      return `⚠️ ${name} - 재고 부족 (${stock}개 남음)`;
    } else {
      return `✅ ${name} - 재고 충분 (${stock}개)`;
    }
  };

  return (
    <section className="bg-white p-4 rounded-lg shadow-sm mb-4" aria-label="상품 선택">
      <select
        id="product-select"
        value={selectedProductId}
        onChange={handleProductSelect}
        className="w-full border-2 border-gray-300 rounded-md p-2 mb-4 focus:border-blue-500 focus:outline-none"
        aria-label="구매할 상품을 선택하세요"
      >
        <option value="">상품을 선택하세요</option>
        {Object.values(products).map((product) => {
          const isProductOutOfStock = product.stock === 0;
          const stockInfo = isProductOutOfStock ? ' (품절)' : '';

          return (
            <option key={product.id} value={product.id} disabled={isProductOutOfStock}>
              {product.name} - ₩{product.price.toLocaleString()}
              {stockInfo}
            </option>
          );
        })}
      </select>

      <Button
        id="add-to-cart"
        fullWidth
        onClick={handleAddToCart}
        disabled={isAddButtonDisabled}
        className="mb-4"
        aria-label="선택한 상품을 장바구니에 추가"
      >
        장바구니에 추가
      </Button>

      <div
        id="stock-status"
        className="text-sm text-gray-600"
        aria-live="polite"
        aria-atomic="true"
      >
        {getStockStatusMessage()}
      </div>
    </section>
  );
};
