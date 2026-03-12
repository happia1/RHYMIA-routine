/**
 * 캐릭터(펫) 타입 정의 — 3종 캐릭터 선택 및 성장 단계
 * 비개발자: 아이가 키울 캐릭터 종류(강아지/토끼/오리)와,
 * 성장 단계(알·아기·청소년·청년·어른)별 이모지·먹이 정보를 정의해요.
 */

/** 선택 가능한 캐릭터 3종: 강아지, 토끼, 오리 */
export type PetSpecies = 'dog' | 'rabbit' | 'duck'

/** 성장 단계 (0=알/씨앗 ~ 4=어른) */
export type GrowthStage = 0 | 1 | 2 | 3 | 4

/**
 * 캐릭터별 메타 정보 (라벨, 이모지, 단계별 이모지·이미지 경로, 먹이, 카드용 이미지)
 * 비개발자: public/routine-icons/pet 폴더의 단계별 이미지로 성장 모습을 보여줘요.
 */
export const PET_META: Record<
  PetSpecies,
  {
    label: string
    emoji: string
    stages: string[]
    /** 성장 단계(0~4)별 이미지 경로 — 홈/루틴에서 캐릭터 표시용 */
    stageImages: string[]
    feedLabel: string
    feedEmoji: string
    imagePath: string
  }
> = {
  dog: {
    label: '강아지',
    emoji: '🐶',
    stages: ['🥚', '🐶', '🐕', '🦮', '🐕‍🦺'],
    stageImages: [
      '/routine-icons/pet/puppy/puppy.png',
      '/routine-icons/pet/puppy/cute-puppy.png',
      '/routine-icons/pet/puppy/play-puppy.png',
      '/routine-icons/pet/puppy/run-puppy.png',
      '/routine-icons/pet/puppy/mom-dog.png',
    ],
    feedLabel: '간식',
    feedEmoji: '🦴',
    imagePath: '/routine-icons/pet/puppy/cute-puppy.png',
  },
  rabbit: {
    label: '토끼',
    emoji: '🐰',
    stages: ['🥚', '🐰', '🐇', '🐇', '🐇'],
    stageImages: [
      '/routine-icons/pet/rabbit/baby-rabbit.png',
      '/routine-icons/pet/rabbit/cute-rabbit.png',
      '/routine-icons/pet/rabbit/run-rabbit.png',
      '/routine-icons/pet/rabbit/rabbit.png',
      '/routine-icons/pet/rabbit/mom-rabbit.png',
    ],
    feedLabel: '당근',
    feedEmoji: '🥕',
    imagePath: '/routine-icons/pet/rabbit/rabbit.png',
  },
  duck: {
    label: '오리',
    emoji: '🦆',
    stages: ['🥚', '🐣', '🦆', '🦆', '🦆'],
    stageImages: [
      '/routine-icons/pet/ducky/egg.png',
      '/routine-icons/pet/ducky/duckling.png',
      '/routine-icons/pet/ducky/walking-ducky.png',
      '/routine-icons/pet/ducky/swimming-ducky.png',
      '/routine-icons/pet/ducky/mom-duck.png',
    ],
    feedLabel: '씨앗',
    feedEmoji: '🌾',
    imagePath: '/routine-icons/pet/ducky/ducky.png',
  },
}

/** 각 성장 단계 진입에 필요한 누적 EXP (30 EXP당 레벨 1 상승) */
export const EXP_PER_STAGE = [0, 30, 60, 90, 120]

/** 성장 단계 라벨 (알/씨앗, 아기, 청소년, 청년, 어른) */
export const STAGE_LABELS = ['알/씨앗', '아기', '청소년', '청년', '어른']
