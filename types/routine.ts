// RHYMIA Routine - Core Type Definitions
// 루틴 관련 핵심 타입 정의 (비개발자: 앱에서 쓰는 데이터 형태를 정의한 파일)

/** 루틴 모드: 아이용 / 부모용 / 개인용 */
export type RoutineMode = 'kid' | 'parent' | 'personal'

/** 루틴 종류: 아침 / 평일오후 / 저녁 / 주말 / 특별 */
export type RoutineType = 'morning' | 'afternoon' | 'evening' | 'weekend' | 'special'

/** 반려동물 종류 */
export type PetSpecies = 'dog' | 'cat' | 'rabbit' | 'hamster'

/** 식물 종류 */
export type PlantSpecies = 'sunflower' | 'cactus' | 'tulip' | 'tree'

/** 성장 단계 (0~4, 숫자가 클수록 성장) */
export type GrowthStage = 0 | 1 | 2 | 3 | 4

/** 성장 단계별 라벨 (캐릭터 위젯 등에서 사용) */
export const GROWTH_STAGE_LABELS: Record<GrowthStage, string> = {
  0: '알',
  1: '아기',
  2: '소년',
  3: '청년',
  4: '어른',
}

/** 루틴 항목 분류 (진행률/필터 등에 활용, routineData·개인 루틴에서 사용) */
export type RoutineItemCategory =
  | 'other'
  | 'hygiene'
  | 'meal'
  | 'study'
  | 'exercise'

/** 루틴 한 항목 (예: "이불 개기", "양치하기") */
export interface RoutineItem {
  id: string
  label: string          // 표시 텍스트 (예: "이불 개기")
  icon: string           // 이모지 또는 아이콘 경로 (예: "🛏️" 또는 "/routine-icons/...")
  ttsText?: string       // TTS 읽어줄 문장 (비어 있으면 음성 없음)
  order: number
  /** 미션별 제한 시간 (초). 0이면 타이머 없음 */
  timerSeconds: number
  /** 타이머 사용 여부 (true일 때만 카드에 타이머 표시) */
  timerEnabled?: boolean
  /** 이미지 키 (ROUTINE_IMAGES 맵용) */
  imageKey?: string
  /** 이미지 경로 (public/routine-icons 기준) */
  imagePath?: string | null
  isCompleted?: boolean
  /** 항목 분류 (필터·통계용, 없으면 기본 'other') */
  category?: RoutineItemCategory
  /** true면 자녀 루틴 실행 화면에 표시하지 않음 (편집에서 숨김 처리) */
  hidden?: boolean
}

/** 루틴 템플릿 (아침 루틴, 저녁 루틴 등 전체 묶음) */
export interface RoutineTemplate {
  id: string
  userId?: string
  mode: RoutineMode
  type: RoutineType
  title: string
  items: RoutineItem[]
  schedule?: {
    days: number[]       // 0=일, 1=월, ..., 6=토
    time: string         // "07:00"
    alarmEnabled?: boolean  // 알람 사용 여부 (routineData 등에서 사용)
  }
  isActive: boolean
  createdAt: string
}

/** 루틴 수행 기록 (언제 어떤 항목을 완료했는지) */
export interface RoutineLog {
  id: string
  routineId: string
  userId: string
  date: string           // "YYYY-MM-DD"
  completedItems: string[] // item id[]
  /** 완료 요청됐지만 부모 미승인 항목 id[] (아이 화면에서 "확인 중" 상태) */
  pendingConfirmItems?: string[]
  isFullyCompleted: boolean
  pointsEarned: number
  parentConfirmed: boolean
  createdAt: string
}

/**
 * 보상 포인트 정보 (총 포인트, 연속 일수, 별 스티커, 다이아몬드)
 * 비개발자: 별 스티커 5개 모으면 자동으로 다이아몬드 1개로 바뀝니다.
 */
export interface RewardPoints {
  userId: string
  totalPoints: number
  streakDays: number
  lastCompletedDate: string | null
  /** 별 스티커 개수 (마일스톤 달성 시 +1) */
  starStickers?: number
  /** 다이아몬드 개수 (스티커 5개 수집 시 5개 소모 후 +1) */
  diamonds?: number
}

/** 가상 동반자 (펫 또는 식물) */
export interface VirtualCompanion {
  id: string
  userId: string
  type: 'pet' | 'plant'
  species: PetSpecies | PlantSpecies
  name: string
  growthStage: GrowthStage
  happiness: number      // 0~100
  hunger: number         // 0~100
  affection: number      // 0~100
  totalExp: number
  lastUpdated: string
}

/** 칭찬 스티커 (부모가 자녀에게 보내는 스티커) */
export interface PraiseSticker {
  id: string
  fromUserId: string     // 부모
  toUserId: string       // 자녀
  stickerType: StickerType
  message?: string
  routineLogId?: string
  createdAt: string
}

/** 스티커 종류 */
export type StickerType =
  | 'star'        // ⭐ 별스티커
  | 'shining'     // 🌟 반짝별
  | 'heart'       // ❤️ 하트
  | 'trophy'      // 🏆 트로피
  | 'lion'        // 🦁 용감한 사자
  | 'rainbow'     // 🌈 무지개
  | 'party'       // 🎉 파티

/** 스티커 타입별 이모지·라벨 메타 정보 */
export const STICKER_META: Record<StickerType, { emoji: string; label: string }> = {
  star:    { emoji: '⭐', label: '별스티커' },
  shining: { emoji: '🌟', label: '훌륭해요!' },
  heart:   { emoji: '❤️', label: '사랑해!' },
  trophy:  { emoji: '🏆', label: '최고야!' },
  lion:    { emoji: '🦁', label: '잘했어!' },
  rainbow: { emoji: '🌈', label: '완벽해!' },
  party:   { emoji: '🎉', label: '대성공!' },
}

/** 포인트 규칙 (항목 완료, 전부 완료, 연속 일수 등) */
export const POINT_RULES = {
  itemComplete: 10,
  allComplete: 50,
  streak3: 30,
  streak7: 100,
  parentSticker: 20,
  parentSnackConfirm: 30,
  parentComment: 10,
} as const
