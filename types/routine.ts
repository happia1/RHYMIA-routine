// types/routine.ts

export type RoutineMode = 'kid' | 'parent' | 'personal';
export type RoutineType = 'morning' | 'evening' | 'weekend' | 'special';
export type PetSpecies = 'dog' | 'cat' | 'rabbit' | 'hamster';
export type PlantSpecies = 'sunflower' | 'cactus' | 'tulip' | 'tree';
export type CompanionType = 'pet' | 'plant';
export type GrowthStage = 0 | 1 | 2 | 3 | 4; // 알→아기→어린이→청소년→어른

// ──────────────────────────────────────────────
// 루틴 항목
// ──────────────────────────────────────────────
export interface RoutineItem {
  id: string;
  label: string;          // 표시 텍스트
  icon: string;           // 이모지 또는 이미지 경로
  ttsText: string;        // 음성 안내 텍스트
  category: 'hygiene' | 'meal' | 'study' | 'exercise' | 'social' | 'other';
  order: number;
  isCompleted?: boolean;
}

// ──────────────────────────────────────────────
// 루틴 템플릿
// ──────────────────────────────────────────────
export interface RoutineTemplate {
  id: string;
  userId: string;
  mode: RoutineMode;
  type: RoutineType;
  title: string;
  items: RoutineItem[];
  schedule?: {
    days: number[];       // 0=일, 1=월, ..., 6=토
    time: string;         // "07:00"
    alarmEnabled: boolean;
  };
  isActive: boolean;
  createdAt: string;
}

// ──────────────────────────────────────────────
// 일별 완료 기록
// ──────────────────────────────────────────────
export interface RoutineLog {
  id: string;
  routineId: string;
  userId: string;
  date: string;           // "YYYY-MM-DD"
  completedItems: string[];
  isFullyCompleted: boolean;
  pointsEarned: number;
  parentConfirmed: boolean;
  createdAt: string;
}

// ──────────────────────────────────────────────
// 포인트 / 스트릭
// ──────────────────────────────────────────────
export interface RewardPoints {
  userId: string;
  totalPoints: number;
  streakDays: number;
  lastCompletedDate: string | null;
}

// ──────────────────────────────────────────────
// 가상 펫 / 식물
// ──────────────────────────────────────────────
export interface VirtualCompanion {
  id: string;
  userId: string;
  type: CompanionType;
  species: PetSpecies | PlantSpecies;
  name: string;
  growthStage: GrowthStage;
  // 펫 전용
  happiness: number;      // 0~100
  hunger: number;         // 0~100
  affection: number;      // 0~100
  // 공통
  totalExp: number;
  lastUpdated: string;
}

// 성장 단계 라벨
export const GROWTH_STAGE_LABELS: Record<GrowthStage, string> = {
  0: '알',
  1: '아기',
  2: '어린이',
  3: '청소년',
  4: '어른',
};

export const GROWTH_EXP_THRESHOLDS: Record<GrowthStage, number> = {
  0: 0,
  1: 100,
  2: 300,
  3: 600,
  4: 1000,
};

// ──────────────────────────────────────────────
// 칭찬 스티커
// ──────────────────────────────────────────────
export type StickerType = 'star' | 'sparkle' | 'heart' | 'trophy' | 'lion' | 'rainbow' | 'party';

export interface PraiseSticker {
  id: string;
  fromUserId: string;     // 부모
  toUserId: string;       // 자녀
  stickerType: StickerType;
  message?: string;
  routineLogId?: string;
  createdAt: string;
}

export const STICKER_META: Record<StickerType, { emoji: string; label: string }> = {
  star:    { emoji: '⭐', label: '별스티커' },
  sparkle: { emoji: '🌟', label: '반짝별' },
  heart:   { emoji: '❤️', label: '하트' },
  trophy:  { emoji: '🏆', label: '트로피' },
  lion:    { emoji: '🦁', label: '용감한 사자' },
  rainbow: { emoji: '🌈', label: '무지개' },
  party:   { emoji: '🎉', label: '파티' },
};

// ──────────────────────────────────────────────
// 포인트 이벤트
// ──────────────────────────────────────────────
export const POINT_EVENTS = {
  ITEM_COMPLETE: 10,
  FULLY_COMPLETE: 50,
  STREAK_3: 30,
  STREAK_7: 100,
  PARENT_STICKER: 20,
  PARENT_SNACK: 30,
} as const;
