/**
 * 상품 관리 모듈
 * 상품 옵션 생성, 재고 관리, 상품 선택 드롭다운 관련 로직을 담당합니다.
 */

import { AppState } from '../state/AppState.js';
import { QUANTITY_THRESHOLDS, MESSAGES, DISCOUNT_LABELS } from '../constants.js';

/**
 * 전체 상품의 총 재고를 계산합니다.
 * @returns {number} 전체 재고 수량
 */
function calculateTotalStock() {
  return AppState.products.reduce((total, product) => total + product.q, 0);
}

/**
 * 상품의 할인 정보 텍스트를 생성합니다.
 * @param {Object} product - 상품 정보
 * @returns {string} 할인 정보 텍스트
 */
function generateDiscountText(product) {
  const discountLabels = [
    product.onSale && DISCOUNT_LABELS.LIGHTNING_SALE,
    product.suggestSale && DISCOUNT_LABELS.SUGGESTION_SALE,
  ].filter(Boolean);

  return discountLabels.length > 0 ? ` ${discountLabels.join(' ')}` : '';
}

/**
 * 상품 할인 상태에 따른 옵션 설정을 반환합니다.
 * @param {Object} product - 상품 정보
 * @returns {Object} 옵션 설정 객체
 */
function getProductOptionConfig(product) {
  const discountText = generateDiscountText(product);

  if (product.q === 0) {
    return {
      textContent: `${product.name} - ${product.val}원 (${MESSAGES.OUT_OF_STOCK})${discountText}`,
      disabled: true,
      className: 'text-gray-400',
    };
  }

  const discountConfigs = [
    {
      condition: product.onSale && product.suggestSale,
      textContent: `${DISCOUNT_LABELS.SUPER_SALE}${product.name} - ${product.originalVal}원 → ${product.val}원 (${DISCOUNT_LABELS.SUPER_DISCOUNT})`,
      className: 'text-purple-600 font-bold',
    },
    {
      condition: product.onSale,
      textContent: `⚡${product.name} - ${product.originalVal}원 → ${product.val}원 (${DISCOUNT_LABELS.LIGHTNING_DISCOUNT})`,
      className: 'text-red-500 font-bold',
    },
    {
      condition: product.suggestSale,
      textContent: `💝${product.name} - ${product.originalVal}원 → ${product.val}원 (${DISCOUNT_LABELS.SUGGESTION_DISCOUNT})`,
      className: 'text-blue-500 font-bold',
    },
  ];

  const matchedConfig = discountConfigs.find((config) => config.condition);

  return (
    matchedConfig || {
      textContent: `${product.name} - ${product.val}원${discountText}`,
      disabled: false,
      className: '',
    }
  );
}

/**
 * 상품 옵션 엘리먼트를 생성합니다.
 * @param {Object} product - 상품 정보
 * @returns {HTMLOptionElement} 생성된 옵션 엘리먼트
 */
function createProductOption(product) {
  const optionElement = document.createElement('option');
  const config = getProductOptionConfig(product);

  optionElement.value = product.id;
  optionElement.textContent = config.textContent;
  optionElement.disabled = config.disabled || false;
  optionElement.className = config.className;

  return optionElement;
}

/**
 * 재고 상황에 따라 상품 선택 드롭다운의 시각적 표시를 업데이트합니다.
 * @param {number} totalStock - 전체 재고 수량
 */
function updateSelectVisualFeedback(totalStock) {
  const productSelector = AppState.ui.productSelector;
  if (totalStock < QUANTITY_THRESHOLDS.STOCK_WARNING_THRESHOLD) {
    productSelector.style.borderColor = 'orange';
  } else {
    productSelector.style.borderColor = '';
  }
}

/**
 * 상품 선택 드롭다운 옵션을 업데이트합니다.
 * 재고 상태와 할인 정보를 반영하여 옵션을 생성합니다.
 */
export function updateProductSelectOptions() {
  const productSelector = AppState.ui.productSelector;
  productSelector.innerHTML = '';

  const totalStock = calculateTotalStock();

  // 각 상품별 옵션 생성
  AppState.products
    .map((product) => createProductOption(product))
    .forEach((optionElement) => productSelector.appendChild(optionElement));

  updateSelectVisualFeedback(totalStock);
}
