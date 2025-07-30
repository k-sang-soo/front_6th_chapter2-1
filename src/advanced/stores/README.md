# Zustand 상태 관리 스토어

## 개요

기존 `AppState.js`를 Zustand로 완전히 마이그레이션한 현대적인 상태 관리 솔루션입니다.

## 주요 특징

- ✅ **불변성 보장**: Immer를 활용한 안전한 상태 업데이트
- ✅ **DevTools 연동**: 개발 환경에서 디버깅 지원
- ✅ **상태 영속화**: localStorage를 통한 장바구니 상태 유지
- ✅ **타입 안전성**: TypeScript 완전 지원
- ✅ **모듈 분리**: 도메인별 slice 구조
- ✅ **호환성**: 기존 AppState API와 100% 호환

## 파일 구조

```
stores/
├── index.ts                    # 통합 export
├── useCartStore.ts            # 메인 스토어
├── slices/
│   ├── productSlice.ts        # 상품 상태 관리
│   ├── cartSlice.ts           # 장바구니 상태 관리
│   └── uiSlice.ts             # UI 상태 관리
└── middleware/
    └── persistMiddleware.ts   # 상태 영속화
```

## 사용법

### 기본 사용법

```typescript
import { useCartStore } from './stores';

// 컴포넌트에서 사용
const MyComponent = () => {
  const products = useCartStore((state) => state.products);
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <div>
      {products.map(product => (
        <button key={product.id} onClick={() => addToCart(product.id)}>
          {product.name}
        </button>
      ))}
    </div>
  );
};
```

### 선택자 사용 (성능 최적화)

```typescript
import { useCartStoreSelectors } from './stores';

const ProductList = () => {
  const products = useCartStoreSelectors.products();
  const getProduct = useCartStoreSelectors.getProduct();

  // ...
};
```

### 액션 사용

```typescript
import { useCartStoreActions } from './stores';

const CartControls = () => {
  const addToCart = useCartStoreActions.addToCart();
  const clearCart = useCartStoreActions.clearCart();

  // ...
};
```

### 호환성 래퍼 사용 (점진적 마이그레이션)

```typescript
import { createAppStateCompatibility } from './stores';

// 기존 코드와 100% 호환
const AppState = createAppStateCompatibility();

// 기존 방식 그대로 사용 가능
AppState.initializeProducts(productData);
const product = AppState.getProduct('p1');
```

## 슬라이스별 상세 기능

### ProductSlice

- 상품 목록 관리
- 상품 정보 업데이트
- 마지막 선택 상품 추적

### CartSlice

- 장바구니 아이템 관리
- 계산 결과 저장
- 수량 업데이트/삭제

### UISlice

- DOM 엘리먼트 참조 관리
- 할인 타이머 상태
- 로딩/에러/알림 상태

## 마이그레이션 가이드

### 1단계: 호환성 래퍼 사용

```javascript
// 기존 코드
import AppState from './state/AppState.js';

// 새 코드 (호환성 유지)
import { createAppStateCompatibility } from './stores';
const AppState = createAppStateCompatibility();
```

### 2단계: 점진적 교체

```javascript
// Before
AppState.products.forEach((product) => {
  // ...
});

// After
import { useCartStore } from './stores';
const products = useCartStore.getState().products;
products.forEach((product) => {
  // ...
});
```

### 3단계: React 컴포넌트화

```tsx
// React 컴포넌트에서 사용
const ProductComponent = () => {
  const products = useCartStore(state => state.products);
  const updateProduct = useCartStore(state => state.updateProduct);

  return (
    // JSX
  );
};
```

## 성능 최적화

### 선택적 구독

```typescript
// 전체 상태 구독 (비효율적)
const state = useCartStore();

// 특정 상태만 구독 (효율적)
const products = useCartStore((state) => state.products);
const cartItems = useCartStore((state) => state.cart.items);
```

### 얕은 비교 최적화

```typescript
import { shallow } from 'zustand/shallow';

const { products, cartItems } = useCartStore(
  (state) => ({
    products: state.products,
    cartItems: state.cart.items,
  }),
  shallow,
);
```

## 디버깅

### DevTools 사용

개발 환경에서 자동으로 활성화되며, Redux DevTools 확장프로그램으로 상태를 모니터링할 수 있습니다.

### 콘솔 디버깅

```javascript
// 개발 환경에서 전역 접근 가능
window.cartStore.getState(); // 현재 상태 확인
window.resetCartStore(); // 상태 초기화
```

## 상태 영속화

장바구니와 상품 상태는 자동으로 localStorage에 저장되며, 페이지 새로고침 후에도 유지됩니다.

```typescript
import { clearPersistedState, hasPersistedState } from './stores';

// 저장된 상태 확인
if (hasPersistedState('hanghae-cart-store')) {
  console.log('저장된 상태가 있습니다');
}

// 저장된 상태 삭제
clearPersistedState('hanghae-cart-store');
```
