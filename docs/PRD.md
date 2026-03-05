# RHYMIA 루틴(Routine) 기능 기획서 (PRD)

**버전:** v1.0  
**작성일:** 2026-03-05  
**작성자:** RHYMIA 팀  
**대상 레포지토리:** rhymia-routine

---

## 1. 개요 (Overview)

### 1.1 배경
RHYMIA의 핵심 미션은 맞벌이 가정의 "계획 노동(Planning Labor)"을 자동화하는 것이다. 루틴 기능은 그 연장선에서 자녀의 습관 형성과 부모/성인의 자기 관리를 돕는 기능으로, RHYMIA 대시보드의 **루틴 아이콘**을 클릭하면 실행된다.

### 1.2 목표
- 미취학 아동이 스스로 루틴을 수행할 수 있도록 직관적인 UI/UX 제공
- 행동심리학 기반의 보상 시스템으로 습관 형성 지속성 확보
- 부모가 자녀 루틴을 관리·확인·칭찬할 수 있는 부모 모드 제공
- 학생/성인을 위한 텍스트 기반 개인 루틴 관리 제공

### 1.3 사용자 모드 구분

| 모드 | 대상 | 진입 방법 |
|------|------|-----------|
| `KID` | 미취학 아동 (3~7세) | 자녀 프로필 선택 후 진입 |
| `PARENT` | 부모 | 부모 프로필에서 자녀 루틴 탭 |
| `PERSONAL` | 학생/성인 | 개인 프로필에서 루틴 탭 |

---

## 2. 사용자 모드별 기능 정의

---

### 2.1 KID 모드 (미취학 아동)

#### 핵심 원칙
- **이미지 우선**: 텍스트 최소화, 대형 일러스트/이모지 카드
- **직관성**: 탭/체크 한 번으로 완료 처리
- **즉각 피드백**: 완료 시 사운드 효과 + 애니메이션 즉시 발생
- **음성 안내**: Web Speech API TTS로 각 루틴 항목을 읽어줌
- **알람**: 루틴 시작 시간 알림 (PWA Push / 브라우저 알림)

#### 2.1.1 루틴 유형
```
아침 루틴 (Morning) - 평일/주말 별도 설정 가능
저녁 루틴 (Evening)
주말 루틴 (Weekend) - 별도 커스텀
특별 루틴 (Special) - 부모가 생성
```

#### 2.1.2 기본 루틴 항목 예시 (아이콘 + TTS 텍스트)

**아침 루틴:**
- 🛏️ 이불 개기 "이불을 예쁘게 개어볼까요?"
- 🪥 양치하기 "이를 닦아요!"  
- 👗 옷 입기 "오늘 입을 옷을 골라요!"
- 🍳 아침 먹기 "맛있는 아침을 먹어요!"
- 👜 가방 챙기기 "가방을 챙겼나요?"
- 🤗 인사하기 "안녕히 다녀오겠습니다!"

**저녁 루틴:**
- 🧴 손 씻기 "손을 깨끗이 씻어요!"
- 📚 책가방 정리 "내일 준비물 챙겼나요?"
- 🛁 목욕하기 "깨끗하게 씻어요!"
- 📖 책 읽기 "오늘의 책을 읽어볼까요?"
- 😴 잠자리 준비 "잘 준비를 해요!"

#### 2.1.3 루틴 완료 플로우
```
루틴 항목 탭 → 체크 애니메이션 + 효과음 → 
별/하트 파티클 효과 → 다음 항목으로 포커스 이동 →
전체 완료 시 → 보상 화면 (펫/식물 성장 + 칭찬 메시지)
```

#### 2.1.4 음성 안내 기능
- 화면 진입 시: "오늘도 잘 할 수 있어요! 시작해볼까요?" (TTS)
- 각 항목 탭 시: 해당 미션 텍스트 TTS 재생
- 완료 시: "대단해요! 모두 다 했어요! 칭찬 스티커 받았어요!" (TTS)
- 알람 설정 시간에: 루틴 시작 알림음 + "아침 루틴 시간이에요!"

---

### 2.2 PARENT 모드 (부모)

#### 핵심 기능
- **자녀 루틴 현황 확인**: 오늘 몇 개 완료했는지 실시간 확인
- **컨펌(승인)**: 아이가 완료 표시한 항목을 부모가 최종 확인
- **칭찬 스티커 부여**: 완료 시 다양한 스티커 선물
- **루틴 편집**: 자녀의 루틴 항목 추가/수정/삭제
- **주간 리포트**: 완료율, 연속 달성일 등 요약

#### 2.2.1 칭찬 스티커 시스템
```
스티커 종류:
⭐ 별스티커 (기본)
🌟 반짝별 (훌륭해요!)
❤️ 하트 (사랑해!)
🏆 트로피 (최고야!)
🦁 용감한 사자 (잘했어!)
🌈 무지개 (완벽해!)
🎉 파티 (대성공!)
```

#### 2.2.2 간식 보상 연동
- 부모가 "오늘 간식 보상" 미션 추가 가능
- 아이 화면에 "엄마/아빠가 간식을 줄 거에요 🍪" 표시
- 완료 후 부모가 오프라인 간식 전달 → 앱에서 확인 탭

---

### 2.3 PERSONAL 모드 (학생/성인)

#### 핵심 기능
- 텍스트 기반 루틴 카드 (간결, 현대적 UI)
- 시간대별 루틴 블록 (Morning / Afternoon / Evening / Night)
- 완료율 트래킹 및 스트릭(연속 달성일) 표시
- 주간/월간 완료 통계 차트
- 루틴 템플릿 제공 (아침 루틴, 공부 루틴, 운동 루틴 등)
- 카테고리 태그 (#건강, #공부, #자기관리 등)
- 리마인더 알림 설정

---

## 3. 보상 시스템 설계 (행동심리학 기반)

### 3.1 행동심리학 적용 원칙

| 원칙 | 적용 방법 |
|------|-----------|
| **즉각적 정적 강화** (Immediate Positive Reinforcement) | 항목 완료 즉시 사운드 + 파티클 애니메이션 |
| **가변 비율 강화** (Variable Ratio Reinforcement) | 랜덤 보너스 스티커, 깜짝 보상 |
| **사회적 강화** (Social Reinforcement) | 부모 칭찬 스티커, 확인 메시지 |
| **목표 진행 시각화** (Goal Progress Visualization) | 펫/식물 성장 단계 |
| **연속성 효과** (Streak Effect) | 연속 달성일 카운터, 끊기면 아쉬운 피드백 |
| **자율성 지원** (Autonomy Support) | 아이가 직접 루틴 꾸미기, 펫 이름 짓기 |

### 3.2 펫/식물 성장 시스템 (Kid 모드 핵심 보상)

#### 3.2.1 펫 시스템
```
펫 종류: 강아지 🐶 / 고양이 🐱 / 토끼 🐰 / 햄스터 🐹 (선택)

상태 지표:
- 행복도 (Happy): 루틴 완료 시 +10, 매일 0시에 -5
- 포만도 (Full): 부모 칭찬 스티커 받을 시 +15
- 청결도 (Clean): 위생 관련 루틴 완료 시 +10
- 애정도 (Love): 연속 달성 시 +5/day

성장 단계:
알 → 아기 → 어린이 → 청소년 → 어른
(각 단계 전환에 누적 포인트 필요)
```

#### 3.2.2 식물 시스템 (대안 선택)
```
식물 종류: 해바라기 🌻 / 선인장 🌵 / 튤립 🌷 / 나무 🌳

상태 지표:
- 물 주기: 아침 루틴 완료 시 +물
- 햇빛: 평일 루틴 완수 시 +햇빛
- 영양분: 부모 칭찬 스티커 = 비료

성장 단계:
씨앗 → 새싹 → 줄기 → 꽃봉오리 → 활짝 핀 꽃
```

#### 3.2.3 포인트 시스템
```
기본 포인트:
- 루틴 항목 1개 완료: +10P
- 오늘 루틴 전체 완료: +50P 보너스
- 연속 3일 완료: +30P 보너스
- 연속 7일 완료: +100P + 특별 아이템

부모 보너스:
- 칭찬 스티커 1개: +20P
- 간식 보상 확인: +30P
- 부모 코멘트 남기기: +10P

포인트 사용:
- 펫 먹이 구매
- 펫/식물 꾸미기 아이템
- 배경 테마 변경
```

---

## 4. 기술 스택 및 아키텍처

### 4.1 기술 스택

```
Frontend:
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion (애니메이션)
- Zustand (상태관리)

음성/알림:
- Web Speech API (TTS)
- Web Audio API (효과음)
- Next-PWA (푸시 알림)

데이터:
- Supabase (DB + Auth)
- Zustand Persist (로컬 캐시)

아이콘/이미지:
- Lucide React
- Lottie React (애니메이션 이모지)
```

### 4.2 디렉토리 구조

```
rhymia-routine/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── routine/
│   │   ├── page.tsx              # 모드 선택 진입점
│   │   ├── kid/
│   │   │   ├── page.tsx          # 아이 루틴 메인
│   │   │   ├── [routineType]/    # morning/evening/weekend
│   │   │   └── reward/           # 보상 화면
│   │   ├── parent/
│   │   │   ├── page.tsx          # 부모 대시보드
│   │   │   ├── confirm/          # 루틴 확인 화면
│   │   │   └── sticker/          # 스티커 부여 화면
│   │   └── personal/
│   │       ├── page.tsx          # 개인 루틴 메인
│   │       └── stats/            # 통계 화면
│   └── layout.tsx
│
├── components/
│   ├── kid/
│   │   ├── RoutineCard.tsx       # 루틴 항목 카드 (이미지+체크)
│   │   ├── PetWidget.tsx         # 펫 표시 위젯
│   │   ├── PlantWidget.tsx       # 식물 표시 위젯
│   │   ├── RewardScreen.tsx      # 완료 보상 화면
│   │   ├── StickerBoard.tsx      # 스티커 모음판
│   │   └── VoiceGuide.tsx        # TTS 음성 안내
│   ├── parent/
│   │   ├── ChildRoutineStatus.tsx
│   │   ├── StickerPicker.tsx
│   │   └── WeeklyReport.tsx
│   ├── personal/
│   │   ├── RoutineBlock.tsx
│   │   ├── StreakCounter.tsx
│   │   └── StatsChart.tsx
│   └── shared/
│       ├── ModeSelector.tsx
│       ├── AlarmSetter.tsx
│       └── RoutineEditor.tsx     # 루틴 추가/수정/삭제
│
├── lib/
│   ├── stores/
│   │   ├── kidRoutineStore.ts    # Zustand: 아이 루틴 상태
│   │   ├── petStore.ts           # Zustand: 펫/식물 상태
│   │   └── personalRoutineStore.ts
│   ├── hooks/
│   │   ├── useTTS.ts             # Web Speech API 훅
│   │   ├── useAlarm.ts           # 알람 훅
│   │   └── useRoutineCompletion.ts
│   ├── supabase/
│   │   ├── client.ts
│   │   └── types.ts
│   └── utils/
│       ├── petEngine.ts          # 펫 상태 계산 로직
│       ├── pointEngine.ts        # 포인트 계산
│       └── defaultRoutines.ts    # 기본 루틴 데이터
│
├── public/
│   ├── sounds/                   # 효과음 mp3
│   │   ├── complete.mp3
│   │   ├── reward.mp3
│   │   └── alarm.mp3
│   └── images/
│       ├── pets/                 # 펫 스프라이트
│       ├── plants/               # 식물 스프라이트
│       ├── stickers/             # 칭찬 스티커
│       └── routine-icons/        # 루틴 아이콘
│
├── types/
│   └── routine.ts               # 타입 정의
│
└── docs/
    └── PRD.md
```

---

## 5. 데이터 모델 (Supabase Schema)

```sql
-- 루틴 템플릿
CREATE TABLE routine_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  mode TEXT CHECK (mode IN ('kid', 'personal')),
  type TEXT CHECK (type IN ('morning', 'evening', 'weekend', 'special')),
  title TEXT NOT NULL,
  items JSONB NOT NULL, -- [{id, label, icon, tts_text, order}]
  schedule JSONB, -- {days: [1,2,3,4,5], time: "07:00"}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 루틴 일별 완료 기록
CREATE TABLE routine_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  routine_id UUID REFERENCES routine_templates,
  user_id UUID REFERENCES auth.users,
  date DATE NOT NULL,
  completed_items JSONB, -- [item_id, ...]
  is_fully_completed BOOLEAN DEFAULT false,
  points_earned INTEGER DEFAULT 0,
  parent_confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 포인트/보상
CREATE TABLE reward_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  total_points INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_completed_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 펫/식물 상태
CREATE TABLE virtual_companions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  type TEXT CHECK (type IN ('pet', 'plant')),
  species TEXT, -- 'dog', 'cat', 'sunflower', etc.
  name TEXT,
  growth_stage INTEGER DEFAULT 0, -- 0~4
  happiness INTEGER DEFAULT 50,
  hunger INTEGER DEFAULT 50,
  affection INTEGER DEFAULT 0,
  total_exp INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 칭찬 스티커
CREATE TABLE praise_stickers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES auth.users, -- 부모
  to_user_id UUID REFERENCES auth.users,   -- 자녀
  sticker_type TEXT NOT NULL,
  message TEXT,
  routine_log_id UUID REFERENCES routine_logs,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 6. 화면 흐름 (User Flow)

### 6.1 Kid 모드 플로우

```
[RHYMIA 메인] → [루틴 아이콘 클릭]
  → [프로필 선택: 어린이/어른]
  → [KID 메인 화면]
    ├── 오늘의 루틴 (아침/저녁/주말)
    ├── 펫/식물 위젯 (상단)
    └── [루틴 시작 버튼]
      → [루틴 실행 화면]
        ├── 대형 루틴 카드 (이미지 + 텍스트 + TTS 버튼)
        ├── 체크 → 완료 애니메이션
        ├── 진행 바 (하단)
        └── [전체 완료]
          → [보상 화면]
            ├── 펫 행복 증가 애니메이션
            ├── 포인트 획득 표시
            ├── "부모님께 확인받기" 버튼
            └── 스티커 보드 확인
```

### 6.2 Parent 모드 플로우

```
[부모 프로필]
  → [루틴 탭]
    ├── [자녀 루틴 현황 카드]
    │   ├── 오늘 완료: X/X개
    │   ├── 연속 달성: X일째
    │   └── [확인하기 버튼]
    │     → [루틴 상세 확인 화면]
    │       ├── 완료된 항목 체크 표시
    │       └── [칭찬 스티커 주기 버튼]
    │         → [스티커 선택 화면]
    │           └── 스티커 선택 + 한마디 입력
    │             → 자녀 화면에 알림 전송
    │
    └── [루틴 관리 버튼]
      → [루틴 편집 화면]
        ├── 항목 추가/삭제/순서 변경
        └── 알람 시간 설정
```

---

## 7. 개발 단계 (Milestone)

### Phase 1 - MVP (4주)
- [ ] 프로젝트 셋업 (Next.js + Supabase + Tailwind)
- [ ] 루틴 데이터 모델 + API
- [ ] KID 모드 루틴 실행 화면 (이미지 카드 + 체크)
- [ ] 기본 완료 애니메이션 + 효과음
- [ ] PARENT 모드 확인 화면
- [ ] 기본 포인트 시스템

### Phase 2 - 보상 시스템 (3주)
- [ ] 펫 시스템 구현 (상태 + 성장 단계)
- [ ] 칭찬 스티커 시스템
- [ ] TTS 음성 안내 (Web Speech API)
- [ ] 알람 시스템 (PWA)

### Phase 3 - PERSONAL 모드 + 통계 (2주)
- [ ] 개인 루틴 관리 화면
- [ ] 스트릭 카운터
- [ ] 주간/월간 통계 차트

### Phase 4 - 고도화 (2주)
- [ ] 루틴 커스터마이징 (추가/수정/삭제)
- [ ] 식물 시스템 (펫 대안)
- [ ] 주간 부모 리포트
- [ ] 루틴 템플릿 라이브러리

---

## 8. 브랜드/디자인 가이드라인

### KID 모드
```
색상: 밝고 생동감 있는 파스텔 팔레트
- Primary: #FF8FAB (핑크)
- Secondary: #A8E6CF (민트)
- Accent: #FFD93D (노랑)
- Background: #FFF9F0 (따뜻한 흰색)

폰트:
- 제목: 둥근 고딕 (Nanum Round, 36px+)
- 루틴 텍스트: 24px+ (가독성 최우선)

UI 원칙:
- 버튼 최소 80x80px (터치 타겟)
- 이미지 카드: 세로 스크롤
- 완료 시 풀스크린 파티클 효과
```

### PERSONAL 모드
```
색상: RHYMIA 기존 브랜드 (틸/핑크/민트 그라데이션)
UI: 기존 RHYMIA 대시보드와 일관성 유지
```

---

## 9. RHYMIA 메인과의 연동

```typescript
// RHYMIA 메인 대시보드에 추가할 루틴 아이콘 라우팅
// app/dashboard/page.tsx 또는 navigation 컴포넌트에 추가

<Link href="/routine">
  <NavIcon 
    icon={<RoutineIcon />} 
    label="루틴"
    badge={todayIncompleteCount} // 미완료 루틴 수 뱃지
  />
</Link>
```

---

## 10. 우선순위 결정 기준

MVP에서 반드시 구현해야 할 것:
1. **KID 모드 루틴 실행** - 핵심 기능
2. **완료 애니메이션 + 효과음** - 즉각 강화 없으면 지속성 없음
3. **PARENT 확인 화면** - 부모 참여 = 사회적 강화
4. **기본 포인트 시스템** - 진행감 제공

MVP 이후 추가:
- 펫/식물 시스템 (개발 리소스 큼)
- TTS 음성 안내
- PWA 알람

---

*이 문서는 개발 진행에 따라 지속 업데이트됩니다.*
