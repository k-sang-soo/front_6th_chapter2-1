# 코드 스타일 및 컨벤션

## Prettier 설정

- **따옴표**: singleQuote (작은따옴표 사용)
- **세미콜론**: semi (세미콜론 필수)
- **탭**: useTabs: false, tabWidth: 2 (2칸 스페이스)
- **후행 쉼표**: trailingComma: "all"
- **최대 줄 길이**: printWidth: 100
- **화살표 함수**: arrowParens: "always"

## ESLint 설정

- **기본 규칙**: @eslint/js recommended
- **무시 파일**: dist/, build/, \*_/_.test.js
- **대상 파일**: \*_/_.{js,mjs,cjs}
- **브라우저 전역변수** 허용

## 명명 규칙 (기존 코드 분석 기반)

- **상수**: UPPER_SNAKE_CASE (PRODUCT_IDS, DISCOUNT_RATES)
- **함수**: camelCase (calculateTotalPoints, updateCartUI)
- **변수**: camelCase
- **JSDoc 주석**: 한국어로 작성

## 파일 구조 컨벤션

- **서비스**: /services/\*.js (비즈니스 로직)
- **상태**: /state/\*.js (전역 상태 관리)
- **컴포넌트**: /components/\*.js (UI 컴포넌트)
- **유틸리티**: /utils/\*.js (공통 유틸리티)
- **이벤트**: /events/\*.js (이벤트 핸들러)
- **DOM**: /dom/\*.js (DOM 초기화)
- **테스트**: **tests**/\*.test.js

## 커밋 컨벤션

- **Conventional Commits** 표준 사용
- **커밋린트** 강제 적용
