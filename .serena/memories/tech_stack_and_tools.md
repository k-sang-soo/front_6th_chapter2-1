# 기술 스택 및 도구

## 개발 환경

- **번들러**: Vite 7.0.5
- **Node.js 패키지 매니저**: pnpm (지정된 버전: 10.13.1)
- **모듈 시스템**: ES Modules (type: "module")

## 테스팅

- **테스트 러너**: Vitest 3.2.4
- **테스트 환경**: jsdom (브라우저 환경 시뮬레이션)
- **테스팅 라이브러리**: @testing-library/jest-dom, @testing-library/user-event
- **UI 테스팅**: @vitest/ui (테스트 UI 제공)

## 코드 품질 도구

- **린터**: ESLint 9.32.0 (@eslint/js)
- **포매터**: Prettier 3.6.2
- **Git Hooks**: Husky 9.1.7
- **스테이징**: lint-staged 16.1.2
- **커밋 컨벤션**: @commitlint/cli + @commitlint/config-conventional

## 설정 파일

- **ESLint**: eslint.config.js (플랫 설정)
- **Prettier**: .prettierrc (singleQuote, semi, 2-space tabs)
- **Vite**: vite.config.js (Vitest 통합)
- **Git 무시**: .gitignore
- **워크스페이스**: pnpm-workspace.yaml

## 브라우저 호환성

- **전역 변수**: globals.browser 사용
- **ES6+ 문법** 지원
