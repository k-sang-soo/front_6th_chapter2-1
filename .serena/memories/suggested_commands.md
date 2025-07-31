# 개발 명령어

## 패키지 관리

```bash
pnpm install           # 의존성 설치
```

## 개발 서버

```bash
pnpm dev               # 일반 개발 서버
pnpm start:basic       # 기본 버전 (index.basic.html)
pnpm start:advanced    # 고급 버전 (index.advanced.html)
```

## 테스트

```bash
pnpm test              # 모든 테스트 실행
pnpm test:basic        # 기본 과제 테스트만
pnpm test:advanced     # 고급 과제 테스트만
pnpm test:ui           # 테스트 UI 실행
```

## 코드 품질

```bash
pnpm lint              # ESLint 검사
pnpm lint:fix          # ESLint 자동 수정
pnpm format            # Prettier 검사
pnpm format:fix        # Prettier 자동 포맷팅
```

## 빌드 및 배포

```bash
pnpm build             # 프로덕션 빌드
pnpm preview           # 빌드 결과 미리보기
```

## Git 및 품질 관리

```bash
git add .              # 스테이징 (자동으로 lint-staged 실행)
git commit -m "..."    # 커밋 (commitlint 검사)
```

## 시스템 명령어 (macOS)

```bash
ls -la                 # 파일 목록 보기
find . -name "*.js"    # JavaScript 파일 찾기
grep -r "pattern" src/ # 패턴 검색
```
