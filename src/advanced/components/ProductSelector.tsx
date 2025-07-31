import React, { useState, useEffect, useMemo } from 'react';
import { useCartStore } from '../stores';
import { QUANTITY_THRESHOLDS } from '../constants';

/**
 * 상품 선택 컴포넌트
 * 상품 드롭다운과 장바구니 추가 버튼을 제공
 */
export const ProductSelector: React.FC = () => {
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  const { products, addToCart, initializeProducts, updateStockStatus } = useCartStore();

  // 반응형 재고 경고 계산
  const stockWarnings = useMemo(() => {
    const warnings: string[] = [];
    Object.values(products).forEach((product) => {
      if (product.stock < QUANTITY_THRESHOLDS.LOW_STOCK_WARNING) {
        if (product.stock === 0) {
          warnings.push(`${product.name}: 품절`);
        } else {
          warnings.push(`${product.name}: 재고 부족 (${product.stock}개 남음)`);
        }
      }
    });
    return warnings;
  }, [products]);

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
   * 재고 상태 메시지 생성 (전체 상품 대상)
   */
  const getStockStatusMessage = () => {
    return stockWarnings.join('\n');
  };

  return (
    <div className="mb-6 pb-6 border-b border-gray-200">
      <select
        id="product-select"
        value={selectedProductId}
        onChange={handleProductSelect}
        className="w-full p-3 border border-gray-300 rounded-lg text-base mb-3"
        aria-label="구매할 상품을 선택하세요"
      >
        <option value="">상품을 선택하세요</option>
        {Object.values(products).map((product) => {
          const isProductOutOfStock = product.stock === 0;
          const stockInfo = isProductOutOfStock ? ' (품절)' : '';

          // 할인 아이콘 및 텍스트 생성
          let discountIcon = '';
          let priceDisplay = `₩${product.price.toLocaleString()}`;
          let saleLabel = '';

          if (product.onSale && product.suggestSale) {
            // 번개세일 + 추천할인 (25% SUPER SALE)
            discountIcon = '⚡💝 ';
            const originalPrice = product.originalVal || product.price;
            priceDisplay = `₩${originalPrice.toLocaleString()} → ₩${product.price.toLocaleString()}`;
            saleLabel = ' (25% SUPER SALE!)';
          } else if (product.onSale) {
            // 번개세일만 (20% SALE)
            discountIcon = '⚡ ';
            const originalPrice = product.originalVal || product.price;
            priceDisplay = `₩${originalPrice.toLocaleString()} → ₩${product.price.toLocaleString()}`;
            saleLabel = ' (20% SALE!)';
          } else if (product.suggestSale) {
            // 추천할인만 (5% SALE)
            discountIcon = '💝 ';
            const originalPrice = product.originalVal || product.price;
            priceDisplay = `₩${originalPrice.toLocaleString()} → ₩${product.price.toLocaleString()}`;
            saleLabel = ' (5% 추천할인!)';
          }

          return (
            <option key={product.id} value={product.id} disabled={isProductOutOfStock}>
              {discountIcon}
              {product.name} - {priceDisplay}
              {saleLabel}
              {stockInfo}
            </option>
          );
        })}
      </select>

      <button
        id="add-to-cart"
        onClick={handleAddToCart}
        disabled={isAddButtonDisabled}
        className="w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all disabled:bg-gray-300"
        aria-label="선택한 상품을 장바구니에 추가"
      >
        Add to Cart
      </button>

      <div
        id="stock-status"
        className="text-xs text-red-500 mt-3 whitespace-pre-line"
        aria-live="polite"
        aria-atomic="true"
      >
        {getStockStatusMessage()}
      </div>
    </div>
  );
};
