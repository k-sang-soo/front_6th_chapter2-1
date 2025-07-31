# 프로젝트 개요

## 프로젝트 목적

- **챕터 2-1 클린 코드 리팩토링 과제**
- 더티코드를 클린코드로 개선하는 쇼핑카트 애플리케이션
- 2단계 구조: 바닐라 JS 리팩토링 (basic) → React + TypeScript 고도화 (advanced)

## 핵심 기능

- 개발자 전문 용품 온라인 쇼핑몰의 장바구니 기능
- 복잡한 할인 시스템 (개별 상품, 대량 할인, 특별 프로모션)
- 실시간 재고 관리
- 포인트 적립 시스템
- 반응형 UI (Tailwind CSS)

## 기술 스택

- **개발 환경**: Vite
- **테스팅**: Vitest + jsdom + Testing Library
- **패키지 매니저**: pnpm
- **코드 품질**: ESLint + Prettier + Husky
- **스타일링**: Tailwind CSS (CDN)
- **기본 과제**: 바닐라 JavaScript ES6+
- **고급 과제**: React + TypeScript

## 아키텍처 특징

- 잘 모듈화된 서비스 기반 구조
- 중앙집중식 상태 관리 (AppState)
- 도메인별 서비스 분리 (Cart, Discount, Point, Product 등)
- 컴포넌트 기반 UI 구조 (React 전환 준비)
