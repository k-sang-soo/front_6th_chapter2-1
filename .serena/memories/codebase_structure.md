# 코드베이스 구조

## 전체 구조

```
/
├── src/
│   ├── basic/                 # 바닐라 JS 기본 과제
│   ├── advanced/              # React + TS 고급 과제
│   ├── main.original.js       # 원본 더티코드 참조
│   └── setupTests.js          # 테스트 설정
├── docs/                      # 문서
├── .github/                   # GitHub 설정
├── .husky/                    # Git hooks
└── 설정 파일들
```

## src/basic/ 구조 (잘 정리된 바닐라 JS)

```
src/basic/
├── main.basic.js              # 메인 엔트리포인트
├── constants.js               # 상수 정의
├── state/
│   └── AppState.js           # 중앙 상태 관리
├── services/                  # 비즈니스 로직
│   ├── CartService.js        # 장바구니 로직
│   ├── DiscountService.js    # 할인 계산
│   ├── PointService.js       # 포인트 계산
│   ├── ProductService.js     # 상품 관리
│   ├── TimerService.js       # 특별 할인 타이머
│   └── UIService.js          # UI 업데이트
├── components/
│   └── UIComponents.js       # UI 컴포넌트 생성
├── utils/
│   └── domUtils.js           # DOM 유틸리티
├── events/
│   └── EventHandlers.js      # 이벤트 처리
├── dom/
│   └── DOMInitializer.js     # DOM 초기화
└── __tests__/
    └── basic.test.js         # 종합 테스트
```

## src/advanced/ 구조 (React + TS 예정)

```
src/advanced/
├── main.advanced.js          # React 엔트리포인트 (예정)
└── __tests__/
    └── advanced.test.js      # React 테스트
```

## 핵심 아키텍처 패턴

- **중앙집중식 상태**: AppState 객체
- **서비스 레이어**: 도메인별 비즈니스 로직 분리
- **컴포넌트 기반**: UI 요소 모듈화
- **이벤트 기반**: 사용자 상호작용 처리
- **유틸리티 분리**: 공통 기능 추상화
