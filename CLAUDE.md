# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

일정 관리 캘린더 애플리케이션으로, 반복 일정, 알림, 드래그 앤 드롭 기능을 지원합니다.

**기술 스택**:
- React 19 + TypeScript
- Vite (빌드 도구)
- Material-UI + Emotion (스타일링)
- Vitest + Testing Library (유닛/통합 테스팅)
- Playwright (E2E 테스팅)
- MSW (API 모킹)
- Express (개발 서버)
- @dnd-kit/core (드래그 앤 드롭)

## 개발 명령어

### 환경 실행
```bash
# 개발 서버 + API 서버 동시 실행 (권장)
pnpm dev

# 프론트엔드만 실행 (포트 5173)
pnpm start

# API 서버만 실행 (포트 3000)
pnpm server

# API 서버 watch 모드
pnpm server:watch
```

### 테스팅
```bash
# 유닛/통합 테스트 (Vitest)
pnpm test                    # watch 모드
pnpm test:ui                 # UI 모드
pnpm test:coverage           # 커버리지 리포트
pnpm test src/__tests__/unit/easy.dateUtils.spec.ts  # 특정 파일

# E2E 테스트 (Playwright)
pnpm test:e2e                # E2E 테스트 실행
pnpm test:e2e:ui             # UI 모드
pnpm test:e2e:debug          # 디버그 모드
pnpm test:e2e:headed         # 브라우저 표시
pnpm test:e2e:report         # 리포트 보기

# 특정 테스트만 실행 (it.only 또는 describe.only 사용)
```

### 린팅 & 타입 체크
```bash
# 전체 린팅 (ESLint + TypeScript)
pnpm lint

# ESLint만 실행
pnpm lint:eslint

# TypeScript 타입 체크만 실행
pnpm lint:tsc
```

### 빌드
```bash
# 프로덕션 빌드
pnpm build
```

## 아키텍처 구조

### 디렉토리 구조
```
src/
├── components/        # React 컴포넌트
│   ├── DraggableEvent.tsx      # 드래그 가능한 일정 컴포넌트
│   ├── DroppableCell.tsx       # 드롭 가능한 날짜 셀
│   └── RecurringEventDialog.tsx # 반복 일정 다이얼로그
├── hooks/            # 커스텀 훅 (비즈니스 로직)
│   ├── useEventOperations.ts   # 일정 CRUD 작업
│   ├── useRecurringEventOperations.ts # 반복 일정 관리
│   ├── useCalendarView.ts      # 캘린더 뷰 상태
│   ├── useNotifications.ts     # 알림 시스템
│   ├── useSearch.ts            # 검색 및 필터링
│   └── useEventForm.ts         # 폼 상태 관리
├── utils/            # 유틸리티 함수 (순수 함수)
│   ├── dateUtils.ts            # 날짜 계산 및 포맷팅
│   ├── eventUtils.ts           # 일정 변환 및 검증
│   ├── generateRepeatEvents.ts # 반복 일정 생성
│   ├── eventOverlap.ts         # 일정 겹침 검사
│   ├── notificationUtils.ts    # 알림 생성
│   └── timeValidation.ts       # 시간 유효성 검증
├── apis/             # API 호출 로직
├── types.ts          # 공통 타입 정의
├── __mocks__/        # MSW 핸들러 & 테스트 데이터
│   ├── handlers.ts             # MSW API 핸들러
│   └── response/
│       ├── realEvents.json     # 개발용 데이터
│       └── e2e.json            # E2E 테스트용 데이터
└── __tests__/        # 테스트 파일
    ├── unit/         # 유닛 테스트
    ├── integration/  # 통합 테스트
    ├── hooks/        # 훅 테스트
    ├── components/   # 컴포넌트 테스트
    ├── edge-cases/   # 엣지 케이스 테스트
    └── regression/   # 회귀 테스트
e2e/                  # Playwright E2E 테스트
├── example.spec.ts   # E2E 테스트 예제
└── fixtures.ts       # E2E 테스트 픽스처
```

### 핵심 설계 원칙

**1. 훅 기반 아키텍처**
- 비즈니스 로직은 커스텀 훅에 집중 (`hooks/`)
- 컴포넌트는 UI 렌더링과 훅 조합에 집중
- 주요 훅들:
  - `useEventOperations`: 일정 CRUD 작업
  - `useRecurringEventOperations`: 반복 일정 관리
  - `useCalendarView`: 캘린더 뷰 상태 관리
  - `useNotifications`: 알림 시스템
  - `useSearch`: 검색 및 필터링
  - `useEventForm`: 폼 상태 관리

**2. 순수 함수 유틸리티**
- `utils/` 디렉토리의 함수들은 순수 함수로 작성
- 테스트하기 쉽고 재사용 가능
- 주요 유틸리티:
  - `dateUtils`: 날짜 계산 및 포맷팅
  - `eventUtils`: 일정 관련 변환 및 검증
  - `generateRepeatEvents`: 반복 일정 생성 로직
  - `eventOverlap`: 일정 겹침 검사
  - `notificationUtils`: 알림 생성 로직
  - `timeValidation`: 시간 유효성 검증

**3. API 레이어**
- Express 서버가 파일 기반 데이터베이스 역할 (`src/__mocks__/response/realEvents.json`)
- Vite 프록시를 통해 `/api` 요청을 `localhost:3000`으로 전달
- 주요 엔드포인트:
  - `GET/POST/PUT/DELETE /api/events/:id` - 단일 일정 CRUD
  - `POST/PUT/DELETE /api/events-list` - 배치 일정 작업
  - `PUT/DELETE /api/recurring-events/:repeatId` - 반복 일정 시리즈 관리

## 테스팅 가이드

### 테스트 환경 설정 (`setupTests.ts`)
- **MSW 서버**: 모든 API 요청을 모킹
- **Fake Timers**: 시간 관련 테스트를 위한 가짜 타이머 사용
- **고정 시스템 시간**: `2025-10-01`로 고정 (모든 테스트에서 일관된 시간 기준)
- **Timezone**: UTC로 고정
- **자동 검증**: `expect.hasAssertions()` - 모든 테스트가 최소 하나의 assertion을 가져야 함

### 테스트 작성 패턴
```typescript
// 시간 기반 테스트
vi.setSystemTime(new Date('2025-10-15'));

// 시간 경과 시뮬레이션
vi.advanceTimersByTime(1000 * 60); // 1분 경과

// MSW 핸들러 재정의
server.use(
  http.get('/api/events', () => {
    return HttpResponse.json({ events: [] });
  })
);
```

### 테스트 파일 명명 규칙
- `easy.*`: 기본적인 유닛 테스트
- `medium.*`: 중간 난이도의 통합 테스트
- `hard.*`: 복잡한 시나리오 테스트
- `*.spec.ts(x)`: 모든 테스트 파일

## 핵심 도메인 개념

### 1. 반복 일정 (Recurring Events)
- `RepeatInfo` 타입으로 반복 정보 관리
- 반복 타입: `none`, `daily`, `weekly`, `monthly`, `yearly`
- 반복 일정들은 동일한 `repeat.id`를 공유
- 반복 일정 생성 시 `generateRepeatEvents` 유틸리티 사용
- 시리즈 단위 수정/삭제는 `/api/recurring-events/:repeatId` 엔드포인트 사용

### 2. 알림 시스템
- `notificationTime`은 분 단위로 저장 (예: 10 = 10분 전)
- 현재 시간 기준으로 알림 대상 일정을 필터링
- `notificationUtils`를 통해 알림 대상 검사

### 3. 일정 겹침 처리
- `eventOverlap` 유틸리티로 시간 겹침 검사
- 시작/종료 시간 기반 겹침 검증
- 동일 날짜 내 시간 범위 충돌 체크

### 4. 시간 유효성 검증
- `timeValidation` 유틸리티 사용
- 시작 시간이 종료 시간보다 빠른지 검증
- HH:mm 포맷 검증

## 주요 기능 구현 현황

### ✅ 완료된 기능
1. **드래그 앤 드롭 (D&D)** - `@dnd-kit/core` 기반
   - `DraggableEvent`: 일정을 드래그 가능하게 만드는 컴포넌트
   - `DroppableCell`: 날짜 셀을 드롭 타겟으로 만드는 컴포넌트
   - 드래그 시 시각적 피드백 (투명도 변경, 커서 스타일)
   - 드롭 가능 영역 하이라이트 (배경색 변경)
   - CSS transform과 transition을 활용한 부드러운 애니메이션

2. **날짜 클릭 일정 생성**
   - 캘린더 셀 클릭 시 해당 날짜가 자동으로 폼에 입력됨
   - 빈 날짜 셀 클릭으로 즉시 일정 생성 폼 오픈

3. **E2E 테스트 인프라**
   - Playwright 기반 E2E 테스트 환경 구축
   - `e2e/example.spec.ts`: 기본 워크플로우 검증 예제
   - `TEST_ENV=e2e` 환경변수로 테스트 데이터 분리

### 📋 테스트 작성 계획
- [ ] 기본 일정 관리 워크플로우 (CRUD) E2E 테스트
- [ ] 반복 일정 관리 워크플로우 E2E 테스트
- [ ] 일정 겹침 처리 검증
- [ ] 알림 시스템 노출 조건 검증
- [ ] 검색 및 필터링 기능 검증
- [ ] 시각적 회귀 테스트 (캘린더 뷰, 일정 상태, 다이얼로그 등)

## 개발 시 주의사항

### 드래그 앤 드롭 구현
- **@dnd-kit 사용**: `useDraggable`과 `useDroppable` 훅 활용
- **드래그 데이터**: `data: { event }` 형태로 일정 정보 전달
- **스타일 처리**: `transform`, `opacity`, `cursor` 등을 통한 시각적 피드백
- **드롭 영역**: `isOver` 상태로 드롭 가능 영역 하이라이트

### API 서버 환경 변수
- `TEST_ENV=e2e`: E2E 테스트 데이터 파일 사용 (`e2e.json`)
- 미설정: 개발 데이터 파일 사용 (`realEvents.json`)

### E2E 테스트 작성
- **Playwright**: 브라우저 자동화 및 E2E 테스트
- **픽스처**: `e2e/fixtures.ts`에서 공통 설정 관리
- **데이터 분리**: `TEST_ENV` 환경변수로 테스트 데이터 격리
- **디버깅**: `--debug`, `--headed`, `--ui` 옵션 활용

### 타임존 관련
- 모든 날짜/시간 처리는 UTC 기준
- 테스트에서 `vi.stubEnv('TZ', 'UTC')` 사용 중
- 날짜 비교 시 타임존 고려 필요

### 상태 관리
- 전역 상태 관리 라이브러리 미사용
- React 상태와 커스텀 훅으로 상태 관리
- 필요시 Context API 활용 가능

### 스타일링
- Material-UI 컴포넌트 우선 사용
- Emotion을 통한 커스텀 스타일링
- `sx` prop 또는 `styled` API 활용
- 드래그 앤 드롭 시각 효과는 인라인 스타일과 `sx` prop 조합
