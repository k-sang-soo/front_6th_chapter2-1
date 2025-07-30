/**
 * 애플리케이션 전체 상태를 관리하는 중앙 상태 객체
 * 전역 변수를 캡슐화하여 상태 관리를 체계적으로 처리합니다.
 */
export const AppState = {
  // 데이터 상태
  products: [],
  lastSelectedProductId: null,

  // UI 엘리먼트 참조
  ui: {
    stockInfoElement: null,
    productSelector: null,
    addToCartButton: null,
    cartDisplayArea: null,
    orderSummaryElement: null,
  },

  /**
   * 상품 목록을 초기화합니다.
   * @param {Array} productInfo - 상품 정보 배열
   */
  initializeProducts(productInfo) {
    this.products = productInfo.map((product) => ({
      id: product.id,
      name: product.name,
      val: product.price,
      originalVal: product.price,
      q: product.initialStock,
      onSale: false,
      suggestSale: false,
    }));
  },

  /**
   * 상품 정보를 업데이트합니다.
   * @param {string} productId - 상품 ID
   * @param {Object} updates - 업데이트할 정보
   * @returns {boolean} 업데이트 성공 여부
   */
  updateProduct(productId, updates) {
    const productIndex = this.products.findIndex((p) => p.id === productId);
    if (productIndex === -1) {
      return false;
    }

    this.products[productIndex] = {
      ...this.products[productIndex],
      ...updates,
    };
    return true;
  },

  /**
   * 특정 상품을 조회합니다.
   * @param {string} productId - 상품 ID
   * @returns {Object|null} 상품 정보 또는 null
   */
  getProduct(productId) {
    return this.products.find((p) => p.id === productId) || null;
  },

  /**
   * UI 엘리먼트 참조를 설정합니다.
   * @param {string} elementName - 엘리먼트 이름
   * @param {HTMLElement} element - DOM 엘리먼트
   */
  setUIElement(elementName, element) {
    if (Object.prototype.hasOwnProperty.call(this.ui, elementName)) {
      this.ui[elementName] = element;
    } else {
      // Development warning for invalid UI element registration
      // console.warn(`Unknown UI element: ${elementName}`);
    }
  },

  /**
   * 마지막 선택 상품 ID를 설정합니다.
   * @param {string} productId - 상품 ID
   */
  setLastSelectedProduct(productId) {
    this.lastSelectedProductId = productId;
  },

  /**
   * 마지막 선택 상품 ID를 반환합니다.
   * @returns {string|null} 마지막 선택 상품 ID
   */
  getLastSelectedProduct() {
    return this.lastSelectedProductId;
  },
};
