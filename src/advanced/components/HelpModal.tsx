import React, { useState } from 'react';

/**
 * 도움말 모달 컴포넌트
 * 사이드 패널 형태로 구현 (기존 바닐라 JS 디자인과 동일)
 */
export const HelpModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  /**
   * 모달 열기/닫기 토글
   */
  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  /**
   * 모달 닫기
   */
  const closeModal = () => {
    setIsOpen(false);
  };

  /**
   * 오버레이 클릭 시 모달 닫기
   */
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  };

  // ESC 키 처리
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* 도움말 토글 버튼 */}
      <button
        onClick={toggleModal}
        className="fixed top-4 right-4 bg-black text-white p-3 rounded-full hover:bg-gray-900 transition-colors z-50"
        aria-label="도움말 열기"
        aria-expanded={isOpen}
        aria-controls="help-modal-panel"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {/* 모달 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="help-modal-title"
          onClick={handleOverlayClick}
        >
          <aside
            id="help-modal-panel"
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 overflow-y-auto p-6 transform transition-transform duration-300 ease-in-out"
            role="complementary"
            aria-label="도움말"
            style={{
              transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
            }}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
              aria-label="도움말 닫기"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h2 id="help-modal-title" className="text-xl font-bold mb-6 pr-12">
              쇼핑 가이드
            </h2>

            {/* 할인 정책 섹션 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">💰 할인 정책</h3>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded border">
                  <h4 className="font-medium text-sm mb-1 text-gray-700">개별 상품 할인</h4>
                  <p className="text-xs text-gray-600">
                    같은 상품을 10개 이상 구매시 상품별 할인율을 적용받을 수 있습니다.
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded border">
                  <h4 className="font-medium text-sm mb-1 text-gray-700">총 수량 할인</h4>
                  <p className="text-xs text-gray-600">
                    전체 상품 수량이 30개 이상이면 25% 대량구매 할인을 받을 수 있습니다.
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded border">
                  <h4 className="font-medium text-sm mb-1 text-gray-700">특별 할인</h4>
                  <p className="text-xs text-gray-600">
                    화요일 할인, 번개세일, 추천할인 등 특별 이벤트를 통해 추가 할인을 받을 수
                    있습니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 포인트 적립 섹션 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">🎁 포인트 적립</h3>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded border">
                  <h4 className="font-medium text-sm mb-1 text-gray-700">기본 적립</h4>
                  <p className="text-xs text-gray-600">
                    결제 금액의 0.01%를 기본 포인트로 적립해드립니다.
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded border">
                  <h4 className="font-medium text-sm mb-1 text-gray-700">추가 적립</h4>
                  <p className="text-xs text-gray-600">
                    화요일 2배 적립, 콤보 세트 보너스, 대량구매 보너스 등으로 추가 포인트를 받을 수
                    있습니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 유용한 팁 섹션 */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <p className="text-xs font-bold mb-1">💡 쇼핑 팁</p>
              <p className="text-2xs text-gray-600 leading-relaxed">
                할인과 포인트를 최대한 활용하려면 화요일에 30개 이상 구매하고, 번개세일과 추천할인
                타이밍을 노려보세요!
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
