# RHYMIA-routine
루틴 & 습관 형성 기능

RHYMIA의 루틴 기능 레포지토리입니다. 미취학 아동, 부모, 개인(학생/성인)을 위한 습관 형성 서비스입니다.

## 📁 프로젝트 구조

```
rhymia-routine/
├── app/
│   └── routine/
│       ├── page.tsx          # 모드 선택 진입점
│       ├── kid/page.tsx      # 아이 루틴 메인
│       ├── parent/page.tsx   # 부모 대시보드
│       └── personal/page.tsx # 개인 루틴
├── components/
│   ├── kid/                  # 아이 모드 컴포넌트
│   ├── parent/               # 부모 모드 컴포넌트
│   ├── personal/             # 개인 루틴 컴포넌트
│   └── shared/               # 공통 컴포넌트
├── lib/
│   ├── stores/               # Zustand 상태관리
│   ├── hooks/                # 커스텀 훅
│   └── utils/                # 유틸리티
├── types/
│   └── routine.ts            # TypeScript 타입 정의
└── docs/
    └── PRD.md                # 기획서
```

## 🚀 시작하기

```bash
# 설치
npm install

# 개발 서버
npm run dev

# 빌드
npm run build
```

## 📦 필요한 패키지 설치

```bash
# 핵심 의존성
npm install zustand framer-motion

# Supabase (DB 연동 시)
npm install @supabase/supabase-js @supabase/ssr

# PWA 알람 (Phase 2)
npm install next-pwa
```

## 🌿 브랜치 전략 (Git Flow)

```
main          ← 배포 브랜치
  └── dev     ← 개발 통합 브랜치
        ├── feature/kid-routine-ui
        ├── feature/pet-system
        ├── feature/parent-mode
        └── feature/personal-mode
```

### 커밋 컨벤션
```
feat: 새 기능 추가
fix: 버그 수정
ui: UI/스타일 변경
refactor: 리팩토링
docs: 문서 수정
chore: 설정, 패키지 변경
```

### 예시
```bash
git commit -m "feat: 아이 루틴 카드 체크 완료 애니메이션 추가"
git commit -m "feat: TTS 음성 안내 훅 구현"
git commit -m "ui: 보상 화면 파티클 이펙트 개선"
git commit -m "feat: 칭찬 스티커 픽커 컴포넌트 구현"
```

## 🎯 개발 우선순위 (Phase 1 - MVP)

- [ ] Next.js 프로젝트 셋업 + 패키지 설치
- [ ] `types/routine.ts` 타입 정의
- [ ] `lib/stores/kidRoutineStore.ts` Zustand 스토어
- [ ] `lib/hooks/useTTS.ts` Web Speech API 훅
- [ ] `lib/utils/defaultRoutines.ts` 기본 루틴 데이터
- [ ] `components/kid/RoutineCard.tsx` 루틴 카드
- [ ] `components/kid/PetWidget.tsx` 펫 위젯
- [ ] `app/routine/kid/page.tsx` 아이 루틴 메인
- [ ] `components/parent/StickerPicker.tsx` 칭찬 스티커
- [ ] `app/routine/parent/page.tsx` 부모 대시보드

## 🔗 RHYMIA 메인 연동

메인 RHYMIA 레포에서 루틴 아이콘 클릭 시:
```typescript
// navigation에 추가
<Link href="/routine">
  <NavIcon icon={<RoutineIcon />} label="루틴" />
</Link>
```

## 📚 참고 문서

- [PRD (기획서)](./docs/PRD.md)
- [행동심리학 보상 설계](./docs/PRD.md#3-보상-시스템-설계-행동심리학-기반)
- [Supabase 스키마](./docs/PRD.md#5-데이터-모델-supabase-schema)
