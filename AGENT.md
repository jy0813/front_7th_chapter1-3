# AGENT.md - TDD 에이전트 시스템 가이드

이 프로젝트는 Claude Code의 TDD(Test-Driven Development) 에이전트 시스템을 사용합니다.

## 개요

`.claude/` 디렉토리에는 Kent Beck의 TDD 철학을 기반으로 한 5단계 Red-Green-Refactor 파이프라인을 관리하는 에이전트들이 있습니다.

### 에이전트 시스템 구성

**6개의 전문 에이전트**:
1. **spec-writer**: 명세서 작성 (질문 우선 접근)
2. **test-design-strategist**: 테스트 전략 설계
3. **test-code-generator**: 테스트 코드 생성
4. **tdd-implementation-agent**: 구현 코드 작성
5. **tdd-refactor-agent**: 리팩터링
6. **tdd-orchestrator**: 전체 TDD 프로세스 조율

**2개의 참조 문서**:
- `kent-beck-tdd-philosophy.md`: TDD 핵심 원칙과 FIRST 원칙
- `rtl-test-rules.md`: React Testing Library 테스트 작성 규칙

## TDD 워크플로우

### 5단계 파이프라인 (tdd-orchestrator)

TDD 프로세스는 **반드시 순차적으로** 진행되며, 각 단계에서 사용자 승인이 필요합니다.

```
PRE-STAGE → STAGE 1 → STAGE 2 → STAGE 3 → STAGE 4 → STAGE 5
(분석)    (명세)     (테스트설계) (테스트생성) (구현)    (리팩터링)
```

#### PRE-STAGE: 코드베이스 분석 (필수 첫 단계)
- 기존 패턴, 라이브러리, 아키텍처 결정 분석
- 재사용 가능한 컴포넌트와 유사 구현 파악
- 요구사항 복잡도 평가: Simple/Moderate/Complex
- **원칙**: Simple 요구사항은 기존 패턴 사용, 새 아키텍처 생성 금지

#### STAGE 1: 명세서 작성 (RED 준비)
**담당**: spec-writer 에이전트

**프로세스**:
1. 사용자 요구사항 받기
2. **반드시 명확화 질문하기** (최소 3-5개)
3. 사용자 답변 받기
4. `specs/[feature-name].md` 파일에 명세서 작성
5. 사용자 승인 대기
6. 승인 시 커밋: `feat: add specification for [feature-name]`

**핵심 원칙**:
- 명시적으로 요청된 기능만 명세서에 포함
- 기존 패턴 기반으로 명세 작성
- 기능 확장 금지 (Feature Creep 방지)

**질문 예시**:
- 이 기능은 어떤 사용자 경험을 제공해야 하나요?
- 기존의 어떤 패턴이나 컴포넌트를 활용할 수 있나요?
- 엣지 케이스 중 꼭 처리해야 할 것은 무엇인가요?

#### STAGE 2: 테스트 설계 (RED 준비)
**담당**: test-design-strategist 에이전트

**프로세스**:
1. 승인된 명세서 읽기
2. **명확화 질문하기** (테스트 커버리지, 시나리오)
3. 최소한의 테스트 전략 설계
4. 기존 테스트 패턴 따르기
5. 사용자 승인 대기
6. 승인 시 커밋: `test: add test design for [feature-name]`

**핵심 원칙** (Kent Beck TDD):
- **FIRST 원칙**: Fast, Independent, Repeatable, Self-Validating, Timely
- **AAA 패턴**: Arrange-Act-Assert
- **한 개념 한 테스트**: 각 테스트는 하나의 동작만 검증
- **사용자 중심**: 구현 세부사항이 아닌 사용자 동작 테스트

**테스트 프레임워크 제약**:
- **Vitest만 사용**: E2E 테스트 설계 금지
- **Unit & Integration**: 단위 테스트와 통합 테스트만
- **React Testing Library**: 컴포넌트 테스트 패턴

**출력 형식**:
```markdown
### ComponentName Component
- [ ] should render correctly when given valid props
- [ ] should handle user interaction and call appropriate callbacks

### functionName Function
- [ ] should return result B when given input A
- [ ] should throw exception D when error condition C occurs
```

#### STAGE 3: 테스트 코드 생성 (RED 상태)
**담당**: test-code-generator 에이전트

**프로세스**:
1. 승인된 테스트 설계 읽기
2. **기존 테스트 파일 분석** (패턴 파악)
3. **명확화 질문하기** (목 전략, 테스트 접근법)
4. 기존 유틸리티 재사용하여 테스트 생성
5. 사용자 승인 대기
6. 승인 시 커밋: `test: implement failing tests for [feature-name] (RED)`

**핵심 원칙**:
- **기존 패턴 따르기**: 새로운 테스트 유틸리티 생성 금지
- **재사용 우선**: `src/__tests__/utils.ts`, `src/setupTests.ts` 활용
- **MSW 패턴**: `src/__mocks__/handlers.ts` 패턴 따르기
- **RED 상태**: 테스트는 실패해야 함 (구현 전)

**React Testing Library 규칙** (rtl-test-rules.md):
- **쿼리 우선순위**: getByRole > getByLabelText > getByPlaceholderText > getByText
- **userEvent 사용**: fireEvent 대신 userEvent.setup() 사용
- **모킹 최소화**: 외부 의존성만 모킹, 내부 로직은 실제 동작
- **jest-dom matchers**: toBeDisabled(), toBeInTheDocument() 등 활용

#### STAGE 4: 구현 (GREEN 상태)
**담당**: tdd-implementation-agent 에이전트

**프로세스**:
1. 실패하는 테스트 분석
2. **기존 코드베이스 패턴 분석**
3. **package.json 확인** (사용 가능한 라이브러리)
4. **명확화 질문하기** (구현 접근법, 패턴 사용)
5. 최소한의 코드로 테스트 통과시키기
6. 사용자 승인 대기
7. 승인 시 커밋: `feat: implement [feature-name] (GREEN)`

**핵심 원칙**:
- **기존 라이브러리 우선**: MUI, React 등 활용
- **재사용 우선**: 기존 컴포넌트, 훅, 유틸리티 활용
- **YAGNI**: 테스트가 요구하는 것만 구현
- **KISS**: 가장 단순한 해결책 선택

**이 프로젝트 컨텍스트**:
- **MUI 컴포넌트 재사용**: 커스텀 컴포넌트 대신 MUI 사용
- **기존 훅 활용**: `src/hooks/` 디렉토리 패턴 따르기
- **MSW 패턴**: API 모킹은 `src/__mocks__/handlers.ts` 활용
- **setupTests.ts 패턴**: 전역 설정 참조 (타이머, 모킹)

**안티패턴**:
- MUI 컴포넌트가 있는데 커스텀 컴포넌트 생성
- 기존 훅을 재사용할 수 있는데 새 훅 작성
- 테스트가 요구하지 않는 성능 최적화 추가
- 테스트가 요구하지 않는 접근성 기능 구현

#### STAGE 5: 리팩터링 (GREEN 유지)
**담당**: tdd-refactor-agent 에이전트

**프로세스**:
1. **모든 테스트 GREEN 확인**
2. **명확화 질문하기** (리팩터링 우선순위, 범위)
3. 보수적 리팩터링 계획 수립
4. **한 번에 하나씩 변경** → 테스트 실행 → GREEN 확인
5. 테스트 실패 시 즉시 되돌리기
6. 사용자 승인 대기
7. 승인 시 커밋: `refactor: improve code quality for [feature-name]`

**핵심 원칙**:
- **보수적 리팩터링**: 꼭 필요한 개선만
- **기존 라이브러리 활용**: 커스텀 코드를 라이브러리 기능으로 교체
- **아키텍처 유지**: 대규모 재구조화 금지
- **테스트 불변**: 절대 테스트 코드 수정 금지

**리팩터링 대상** (필요 시만):
- 중복 코드 제거
- 명명 규칙 개선
- 기존 라이브러리로 교체
- **성능 최적화 금지** (치명적 이슈 있을 때만)
- **접근성 구현 금지** (명시적 요구 시만)

**안티패턴**:
- 라이브러리가 있는데 커스텀 솔루션 유지
- 대규모 아키텍처 리팩터링
- 필요 없는 성능 최적화
- 변경을 위한 변경

## 에이전트별 상세 가이드

### 1. spec-writer (명세서 작성)

**사용 시기**: 새 기능 개발 시작 시

**특징**:
- **질문 우선 접근**: 반드시 3-5개 질문 필수
- **한글 작성**: 모든 질문, 답변, 명세서는 한글
- **specs/ 디렉토리**: `specs/[feature-name].md`에 저장

**질문 가이드라인**:
- 구현에 영향을 미치는 구체적 질문
- 예/아니오 질문 피하기
- 기능 요구사항, UX, 통합 지점 집중

**출력 형식**:
```markdown
# 기능 명세: [Feature Name]

## 질문 및 답변

Q1: [질문]
A1: [사용자 답변]

Q2: [질문]
A2: [사용자 답변]

## 기능 명세서

[명세서 내용]
```

### 2. test-design-strategist (테스트 설계)

**사용 시기**: 명세서 완성 후 테스트 계획 시

**참조 문서**:
- `.claude/docs/kent-beck-tdd-philosophy.md`
- `.claude/docs/rtl-test-rules.md`

**Kent Beck TDD 원칙**:
- **Red-Green-Refactor 인식**: 실패 테스트로 시작
- **FIRST 원칙**: Fast, Independent, Repeatable, Self-Validating, Timely
- **한 개념 한 테스트**: 각 테스트는 하나의 동작만

**최소 테스트 설계**:
- 명시된 기능만 테스트
- 기존 테스트 패턴 따르기
- 명시되지 않은 엣지 케이스 포함 금지

**테스트 우선순위** (Kent Beck ROI 관점):
1. High Risk, High Value (중요하고 위험한 코드)
2. Core Business Logic (핵심 비즈니스 로직)
3. Integration Points (외부 시스템 통합)
4. Edge Cases (명시된 경계값만)

### 3. test-code-generator (테스트 코드 생성)

**사용 시기**: 테스트 설계 완성 후 실제 테스트 파일 생성

**필수 절차**:
1. **기존 테스트 파일 분석 먼저**
2. 기존 유틸리티 재사용 (`src/__tests__/utils.ts`)
3. 기존 목 패턴 따르기 (`src/__mocks__/`)
4. 새로운 유틸리티 생성 금지

**React Testing Library 규칙**:

**쿼리 우선순위**:
```javascript
// 1순위: getByRole (접근성)
const button = screen.getByRole('button', { name: '제출' });

// 2순위: getByLabelText (폼 요소)
const input = screen.getByLabelText('이메일');

// 3순위: getByPlaceholderText
const search = screen.getByPlaceholderText('검색어 입력');

// 4순위: getByText
const heading = screen.getByText('환영합니다');

// 최후: getByTestId (다른 방법이 없을 때만)
const element = screen.getByTestId('custom-element');
```

**비동기 처리**:
```javascript
// waitFor 사용
await waitFor(() => {
  expect(screen.getByText('로딩 완료')).toBeInTheDocument();
});

// findBy 쿼리 (비동기 자동 대기)
const element = await screen.findByText('비동기 콘텐츠');
```

**이벤트 처리**:
```javascript
// userEvent 사용 (권장)
const user = userEvent.setup();
await user.click(button);
await user.type(input, '텍스트');

// fireEvent는 사용 금지 (userEvent로 불가능한 경우만 예외)
```

**안티패턴 회피**:
- 구현 세부사항 테스트 금지
- 스냅샷 테스트 금지
- fragile 쿼리 사용 금지
- 테스트 간 의존성 금지

### 4. tdd-implementation-agent (구현 코드)

**사용 시기**: RED 테스트가 있고 GREEN으로 만들 때

**구현 우선순위**:
1. **package.json 확인**: 이미 설치된 라이브러리 먼저
2. **기존 컴포넌트 재사용**: `src/components/` 확인
3. **기존 훅 재사용**: `src/hooks/` 확인
4. **기존 유틸리티 재사용**: `src/utils/` 확인

**이 프로젝트 패턴**:
```javascript
// MUI 컴포넌트 재사용
import { Button, Dialog, TextField } from '@mui/material';

// 기존 훅 활용
import { useEventOperations } from './hooks/useEventOperations';

// MSW 패턴 (테스트용)
import { server } from './setupTests';
import { handlers } from './__mocks__/handlers';
```

**setupTests.ts 패턴**:
- MSW 서버 자동 시작/정리
- Fake Timers 자동 설정
- 시스템 시간 고정: `2025-10-01`
- UTC 타임존
- `expect.hasAssertions()` 전역 설정 (개별 파일에 추가 금지)

**반복 개발 프로세스**:
1. 실패 테스트 하나 선택
2. 최소 코드로 해당 테스트 통과
3. 테스트 실행 → GREEN 확인
4. 다음 테스트로 진행

### 5. tdd-refactor-agent (리팩터링)

**사용 시기**: 모든 테스트가 GREEN이고 코드 품질 개선 필요 시

**보수적 리팩터링 절차**:
1. 라이브러리 분석: MUI/React로 교체 가능한지 확인
2. 최소 필요 개선 파악
3. 테스트 GREEN 확인
4. 보수적 계획 수립
5. **하나씩 변경** → 테스트 → GREEN 확인
6. 반복

**리팩터링 대상** (필요 시만):
- 명백한 중복 코드 제거
- 명명 규칙 개선
- 커스텀 코드를 라이브러리로 교체

**절대 금지**:
- 테스트 코드 수정
- 대규모 아키텍처 변경
- 불필요한 성능 최적화
- 명시되지 않은 접근성 구현

**에러 복구**:
테스트 실패 시:
1. 즉시 변경 되돌리기
2. 실패 원인 분석
3. 대안 접근법 제시
4. GREEN 복구 후 진행

### 6. tdd-orchestrator (전체 조율)

**사용 시기**: 완전한 TDD 사이클로 새 기능 구현 시

**핵심 책임**:
- 5단계 파이프라인 관리
- 각 단계에서 사용자 승인 받기
- YAGNI 원칙 강제
- 기존 패턴 우선 순위 유지

**복잡도별 접근**:

**Simple (UI 변경, 작은 기능)**:
- 기존 컴포넌트/패턴 사용
- 핵심 기능 위주 최소 테스트
- 새 아키텍처 생성 금지

**Moderate (새 컴포넌트, API 통합)**:
- 가능한 기존 패턴 확장
- 확립된 규칙으로 최소 코드 작성
- 과도한 엣지 케이스 테스트 금지

**Complex (새 시스템, 주요 기능)**:
- 전체 TDD 사이클 실행
- 새 아키텍처 패턴 가능 (정당화 필요)
- 복잡도에 맞는 광범위 테스트

**유연한 진입점**:
- **새 기능**: PRE-STAGE → STAGE 1부터 시작
- **기존 코드 개선**: STAGE 5 (리팩터링)부터 시작
- **레거시 리팩터링**: 테스트 있으면 STAGE 5 적용 가능

## TDD 철학 참조

### Kent Beck TDD 핵심 원칙

**1. Red-Green-Refactor 사이클**:
- **Red**: 실패하는 테스트 먼저 작성
- **Green**: 테스트 통과시키는 최소 코드 작성
- **Refactor**: 코드 개선하되 테스트는 계속 통과

**2. "Clean Code that Works" 철학**:
- 먼저 동작하게 만들고, 그 다음에 깔끔하게
- 작은 단위로 진행하여 안전한 상태 유지
- 테스트를 통한 지속적 피드백

**3. FIRST 원칙**:
- **Fast**: 빠르게 실행
- **Independent**: 독립적 (테스트 간 의존성 없음)
- **Repeatable**: 반복 가능 (언제 어디서든 동일 결과)
- **Self-Validating**: 자체 검증 (Pass/Fail 명확)
- **Timely**: 적시에 작성 (코드 작성 전에)

**4. 좋은 테스트의 특징**:
- 명확한 의도 표현
- 하나의 개념만 테스트
- 살아있는 문서 역할
- 실패 시 명확한 진단

**5. AAA 패턴** (Arrange-Act-Assert):
```javascript
// Arrange: 테스트 환경 설정
const user = createUser({ name: 'John' });

// Act: 테스트할 동작 실행
const result = authenticateUser(user.email, 'password123');

// Assert: 결과 검증
expect(result).toBe(true);
```

### React Testing Library 핵심 규칙

**1. 테스트 설명**:
- 구체적이고 명확한 설명
- 사용자 관점에서 기술
- Given-When-Then 패턴

**2. 테스트 독립성**:
- 각 테스트는 완전히 독립적
- 공유 상태 금지
- beforeEach에서 초기화

**3. 쿼리 우선순위**:
사용자 접근 가능한 쿼리 우선:
1. getByRole (접근성)
2. getByLabelText (폼)
3. getByPlaceholderText
4. getByText
5. getByTestId (최후 수단)

**4. 비동기 처리**:
- waitFor 사용
- findBy 쿼리 활용
- useFakeTimers 적극 활용

**5. userEvent 사용**:
- userEvent.setup() 활용
- fireEvent 사용 금지
- 키보드 네비게이션 테스트

**6. 모킹 최소화**:
- 외부 의존성만 모킹
- MSW 활용 (API)
- 내부 로직은 실제 동작 테스트

**7. assertion**:
```javascript
// ❌ 잘못된 assertion
expect(button.disabled).toBe(true);

// ✅ 올바른 assertion (jest-dom)
expect(button).toBeDisabled();
```

**8. 안티패턴 회피**:
- 스냅샷 테스트 금지
- 구현 세부사항 테스트 금지
- fragile 테스트 금지

## 실전 사용 예시

### 시나리오 1: 드래그 앤 드롭 기능 추가

```bash
# 사용자: 드래그 앤 드롭으로 일정 이동 기능을 추가하고 싶어요

# 1. tdd-orchestrator 호출
/tdd-orchestrator "캘린더 일정을 드래그 앤 드롭으로 다른 날짜로 이동하는 기능"

# PRE-STAGE: 코드베이스 분석
# → 기존 컴포넌트, 훅, MUI 라이브러리 확인

# STAGE 1: spec-writer가 질문
# Q1: 일정을 드롭할 때 날짜만 변경되나요, 시간도 변경되나요?
# Q2: 드래그 중 시각적 피드백은 어떤 형태인가요?
# Q3: 드롭이 불가능한 영역도 있나요?
# → 답변 후 specs/drag-and-drop.md 생성

# STAGE 2: test-design-strategist가 테스트 설계
# → 기존 테스트 패턴 분석 후 최소 테스트 케이스 설계
# → 사용자 승인 후 커밋

# STAGE 3: test-code-generator가 RED 테스트 생성
# → 기존 테스트 유틸리티 재사용
# → 실패하는 테스트 생성
# → 사용자 승인 후 커밋

# STAGE 4: tdd-implementation-agent가 구현
# → MUI, 기존 훅 활용하여 최소 구현
# → 테스트 GREEN 확인
# → 사용자 승인 후 커밋

# STAGE 5: tdd-refactor-agent가 리팩터링
# → 보수적 개선 (필요 시만)
# → 매 변경마다 테스트 GREEN 확인
# → 사용자 승인 후 커밋
```

### 시나리오 2: 기존 코드 리팩터링

```bash
# 사용자: useEventOperations 훅의 코드가 복잡해서 개선하고 싶어요

# STAGE 5 진입 (이미 테스트가 있는 코드)
/tdd-refactor-agent "src/hooks/useEventOperations.ts 리팩터링"

# 1. 모든 테스트 GREEN 확인
# 2. 명확화 질문
#    - 어떤 부분이 가장 복잡하다고 느끼시나요?
#    - 우선적으로 개선하고 싶은 부분이 있나요?
# 3. 보수적 리팩터링 계획
# 4. 한 번에 하나씩 개선
# 5. 매 변경마다 테스트 실행
# 6. 승인 후 커밋
```

### 시나리오 3: 반복 일정 버그 수정

```bash
# 사용자: 반복 일정이 윤년에 제대로 생성 안 돼요

# 1. 먼저 버그 재현 테스트 작성
/test-design-strategist "윤년 반복 일정 생성 버그 테스트 설계"

# 2. 테스트 코드 생성
/test-code-generator "윤년 반복 일정 테스트 구현"
# → RED 상태 확인 (버그 재현)

# 3. 버그 수정 구현
/tdd-implementation-agent "윤년 처리 로직 수정"
# → src/utils/generateRepeatEvents.ts 수정
# → 테스트 GREEN 확인

# 4. 필요 시 리팩터링
/tdd-refactor-agent "generateRepeatEvents 함수 정리"
```

## 중요 규칙 요약

### 모든 에이전트 공통 규칙

1. **한글 사용**: 모든 질문, 답변, 문서는 한글로 작성
2. **질문 우선**: 작업 전 반드시 명확화 질문하기
3. **specs/ 참조**: 모든 TDD 작업은 `specs/` 명세서 기반
4. **기존 패턴 우선**: 새로운 것 만들기 전에 기존 것 활용
5. **YAGNI**: 명시적으로 요청된 것만 구현
6. **테스트 불변**: 절대 테스트 파일 수정 금지 (리팩터링 시)

### 에이전트별 핵심 원칙

**spec-writer**:
- 최소 3-5개 질문 필수
- 기능 확장 금지
- `specs/[feature-name].md`에 저장

**test-design-strategist**:
- Kent Beck TDD 철학 따르기
- FIRST 원칙 준수
- 최소 테스트만 설계

**test-code-generator**:
- 기존 테스트 패턴 분석 먼저
- 새 유틸리티 생성 금지
- RTL 규칙 준수

**tdd-implementation-agent**:
- package.json 확인 먼저
- 기존 라이브러리 우선
- 최소 코드로 GREEN

**tdd-refactor-agent**:
- 보수적 접근
- 한 번에 하나씩
- 매번 GREEN 확인
- 테스트 절대 수정 금지

## 참고 자료

- `.claude/docs/kent-beck-tdd-philosophy.md`: TDD 철학 상세
- `.claude/docs/rtl-test-rules.md`: RTL 규칙 상세
- `.claude/agents/`: 각 에이전트 상세 명세
- `CLAUDE.md`: 프로젝트 구조 및 개발 가이드
