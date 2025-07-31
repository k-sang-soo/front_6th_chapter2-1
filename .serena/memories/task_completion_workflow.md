# 작업 완료 시 수행할 작업

## 필수 품질 검사 (순서대로 실행)

### 1. 코드 품질 검사

```bash
pnpm lint              # ESLint 검사
pnpm lint:fix          # 자동 수정 가능한 문제 해결
pnpm format            # Prettier 포맷 검사
pnpm format:fix        # 자동 포맷팅
```

### 2. 테스트 실행

```bash
pnpm test              # 전체 테스트 스위트 실행
# 또는 특정 테스트만
pnpm test:basic        # 기본 과제 테스트
pnpm test:advanced     # 고급 과제 테스트
```

### 3. 빌드 검증

```bash
pnpm build             # 프로덕션 빌드 테스트
```

## Git 커밋 절차

### 1. 변경사항 스테이징

```bash
git add .              # lint-staged가 자동으로 실행됨
```

### 2. 커밋 (Conventional Commits)

```bash
git commit -m "feat: 새로운 기능 추가"
git commit -m "fix: 버그 수정"
git commit -m "refactor: 코드 리팩토링"
git commit -m "test: 테스트 추가"
git commit -m "docs: 문서 수정"
```

## 품질 게이트

- **Pre-commit**: ESLint + Prettier 자동 적용
- **Commit-msg**: Conventional Commits 형식 검증
- **CI/CD**: 모든 테스트 통과 필수

## 주의사항

- 모든 테스트가 통과해야 함 (기능 일치 보장)
- 기존 기능 변경 시 테스트 업데이트 필요
- React 전환 시에도 동일한 테스트 스위트 통과해야 함
