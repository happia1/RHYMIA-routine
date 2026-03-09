/**
 * 캐릭터(펫) 타입 정의 — 5종 캐릭터 선택 및 성장 단계
 * 비개발자: 아이가 키울 캐릭터 종류(펭귄/파랑새/강아지/고양이/식물)와,
 * 성장 단계(알·아기·청소년·청년·어른)별 이모지·먹이 정보를 정의해요.
 */

/** 선택 가능한 캐릭터 5종 */
export type PetSpecies = 'penguin' | 'bluebird' | 'dog' | 'cat' | 'plant'

/** 성장 단계 (0=알/씨앗 ~ 4=어른) */
export type GrowthStage = 0 | 1 | 2 | 3 | 4

/** 캐릭터별 메타 정보 (라벨, 선택 화면 이모지, 단계별 이모지, 먹이 이름/이모지) */
export const PET_META: Record<
  PetSpecies,
  {
    label: string
    emoji: string
    stages: string[]
    feedLabel: string
    feedEmoji: string
  }
> = {
  penguin: {
    label: '펭귄',
    emoji: '🐧',
    stages: ['🥚', '🐧', '🐧', '🫧', '🐧'],
    feedLabel: '생선',
    feedEmoji: '🐟',
  },
  bluebird: {
    label: '파랑새',
    emoji: '🐦‍⬛',
    stages: ['🥚', '🐣', '🐦', '🐦‍⬛', '🦅'],
    feedLabel: '씨앗',
    feedEmoji: '🌾',
  },
  dog: {
    label: '강아지',
    emoji: '🐶',
    stages: ['🥚', '🐶', '🐕', '🦮', '🐕‍🦺'],
    feedLabel: '간식',
    feedEmoji: '🦴',
  },
  cat: {
    label: '고양이',
    emoji: '🐱',
    stages: ['🥚', '🐱', '🐈', '🐈‍⬛', '😺'],
    feedLabel: '참치',
    feedEmoji: '🐠',
  },
  plant: {
    label: '식물',
    emoji: '🌱',
    stages: ['🌰', '🌱', '🌿', '🌳', '🍎'],
    feedLabel: '물',
    feedEmoji: '💧',
  },
}

/** 각 성장 단계 진입에 필요한 누적 먹이(경험치) 수 */
export const EXP_PER_STAGE = [0, 3, 8, 15, 25]

/** 성장 단계 라벨 (알/씨앗, 아기, 청소년, 청년, 어른) */
export const STAGE_LABELS = ['알/씨앗', '아기', '청소년', '청년', '어른']
