/**
 * 타입 가드 함수들
 * @fileoverview 런타임에서 타입을 안전하게 검증하기 위한 타입 가드 함수들을 정의합니다.
 */

import type {
  ProductId,
  Product,
  CartItem,
  StockStatus,
  DiscountType,
  Discount,
  AppEvent,
} from '../types';
import { VALID_PRODUCT_IDS } from '../constants';

/**
 * 값이 유효한 ProductId인지 확인합니다.
 */
export function isValidProductId(value: unknown): value is ProductId {
  return typeof value === 'string' && VALID_PRODUCT_IDS.has(value as ProductId);
}

/**
 * 객체가 Product 인터페이스를 만족하는지 확인합니다.
 */
export function isProduct(value: unknown): value is Product {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    isValidProductId(obj.id) &&
    typeof obj.name === 'string' &&
    typeof obj.price === 'number' &&
    obj.price > 0 &&
    typeof obj.initialStock === 'number' &&
    obj.initialStock >= 0
  );
}

/**
 * 객체가 CartItem 인터페이스를 만족하는지 확인합니다.
 */
export function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    isValidProductId(obj.id) &&
    typeof obj.quantity === 'number' &&
    obj.quantity > 0 &&
    Number.isInteger(obj.quantity)
  );
}

/**
 * 값이 유효한 StockStatus인지 확인합니다.
 */
export function isStockStatus(value: unknown): value is StockStatus {
  return typeof value === 'string' && ['available', 'low_stock', 'out_of_stock'].includes(value);
}

/**
 * 값이 유효한 DiscountType인지 확인합니다.
 */
export function isDiscountType(value: unknown): value is DiscountType {
  return (
    typeof value === 'string' &&
    [
      'individual',
      'bulk_purchase',
      'tuesday_special',
      'lightning_sale',
      'suggestion_sale',
      'super_sale',
    ].includes(value)
  );
}

/**
 * 객체가 Discount 유니온 타입을 만족하는지 확인합니다.
 */
export function isDiscount(value: unknown): value is Discount {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  if (!isDiscountType(obj.type)) {
    return false;
  }

  const baseValidation =
    typeof obj.rate === 'number' &&
    obj.rate >= 0 &&
    obj.rate <= 1 &&
    typeof obj.isActive === 'boolean';

  if (!baseValidation) {
    return false;
  }

  switch (obj.type) {
    case 'individual':
      return (
        isValidProductId(obj.productId) &&
        typeof obj.minQuantity === 'number' &&
        obj.minQuantity > 0
      );
    case 'bulk_purchase':
      return typeof obj.minTotalQuantity === 'number' && obj.minTotalQuantity > 0;
    case 'tuesday_special':
    case 'super_sale':
      return true;
    case 'lightning_sale':
    case 'suggestion_sale':
      return (
        (obj.productId === null || isValidProductId(obj.productId)) &&
        (obj.remainingTime === undefined || typeof obj.remainingTime === 'number')
      );
    default:
      return false;
  }
}

/**
 * 배열이 CartItem 배열인지 확인합니다.
 */
export function isCartItemArray(value: unknown): value is CartItem[] {
  return Array.isArray(value) && value.every(isCartItem);
}

/**
 * 배열이 Product 배열인지 확인합니다.
 */
export function isProductArray(value: unknown): value is Product[] {
  return Array.isArray(value) && value.every(isProduct);
}

/**
 * 객체가 유효한 AppEvent인지 확인합니다.
 */
export function isAppEvent(value: unknown): value is AppEvent {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  if (typeof obj.type !== 'string') {
    return false;
  }

  switch (obj.type) {
    case 'ADD_TO_CART':
    case 'REMOVE_FROM_CART':
    case 'UPDATE_CART_ITEM':
      return (
        typeof obj.payload === 'object' &&
        obj.payload !== null &&
        isValidProductId((obj.payload as Record<string, unknown>).productId) &&
        typeof (obj.payload as Record<string, unknown>).quantity === 'number'
      );
    case 'CLEAR_CART':
      return obj.payload === undefined;
    case 'ACTIVATE_LIGHTNING_SALE':
    case 'ACTIVATE_SUGGESTION_SALE':
      return (
        typeof obj.payload === 'object' &&
        obj.payload !== null &&
        isValidProductId((obj.payload as Record<string, unknown>).productId)
      );
    case 'DEACTIVATE_LIGHTNING_SALE':
    case 'DEACTIVATE_SUGGESTION_SALE':
    case 'CLEAR_ERROR':
      return obj.payload === undefined;
    case 'UPDATE_STOCK':
      return (
        typeof obj.payload === 'object' &&
        obj.payload !== null &&
        isValidProductId((obj.payload as Record<string, unknown>).productId) &&
        typeof (obj.payload as Record<string, unknown>).stock === 'number'
      );
    case 'SET_ERROR':
      return (
        typeof obj.payload === 'object' &&
        obj.payload !== null &&
        typeof (obj.payload as Record<string, unknown>).message === 'string'
      );
    default:
      return false;
  }
}

/**
 * 숫자가 양의 정수인지 확인합니다.
 */
export function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

/**
 * 숫자가 음이 아닌 정수인지 확인합니다.
 */
export function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

/**
 * 값이 유효한 할인율(0~1 사이의 숫자)인지 확인합니다.
 */
export function isValidDiscountRate(value: unknown): value is number {
  return typeof value === 'number' && value >= 0 && value <= 1 && !isNaN(value);
}

/**
 * 객체의 특정 속성이 존재하고 특정 타입인지 확인하는 헬퍼 함수입니다.
 */
export function hasProperty<T extends Record<string, unknown>, K extends string>(
  obj: T,
  key: K,
  typeCheck: (value: unknown) => boolean,
): obj is T & Record<K, unknown> {
  return key in obj && typeCheck(obj[key]);
}

/**
 * 안전한 JSON 파싱을 위한 헬퍼 함수입니다.
 */
export function safeParse<T>(
  jsonString: string,
  typeGuard: (value: unknown) => value is T,
): T | null {
  try {
    const parsed = JSON.parse(jsonString);
    return typeGuard(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
