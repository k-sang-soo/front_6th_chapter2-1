import React from 'react';

/**
 * 빈 장바구니 상태 컴포넌트
 */
export const EmptyCart: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm text-center">
      <div className="text-gray-400 mb-4">
        <svg
          className="w-16 h-16 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m4.5-5v6m0-6l2.5 5M17 13v6m0-6l-2.5 5"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-500 mb-2">장바구니가 비어있습니다</h3>
      <p className="text-sm text-gray-400">위에서 상품을 선택하여 장바구니에 추가해보세요</p>
    </div>
  );
};
