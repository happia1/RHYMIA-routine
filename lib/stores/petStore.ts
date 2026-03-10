/**
 * 캐릭터(펫) 전역 상태 — 프로필별로 분리
 * 비개발자: 자녀(프로필)마다 펫·먹이·성장 단계가 따로 저장돼요. 아린이 펫과 정원이 펫이 서로 섞이지 않아요.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PetSpecies, GrowthStage, PET_META, EXP_PER_STAGE } from '@/types/pet'

// 기존 컴포넌트 호환용 re-export
export { PET_META, EXP_PER_STAGE } from '@/types/pet'
export type { PetSpecies, GrowthStage } from '@/types/pet'

/** 한 프로필(자녀)당 펫 상태 */
interface PetProfileState {
  species: PetSpecies | null
  name: string
  stage: GrowthStage
  totalFed: number
  pendingFood: number
  isEating: boolean
}

function defaultProfileState(): PetProfileState {
  return {
    species: null,
    name: '',
    stage: 0,
    totalFed: 0,
    pendingFood: 0,
    isEating: false,
  }
}

/** 구독 셀렉터용 안정 참조 (getSnapshot 무한루프 방지) */
export const DEFAULT_PET_STATE: PetProfileState = defaultProfileState()

interface PetState {
  /** 프로필 ID별 펫 상태 (아린/정원이 등 각각 따로) */
  byProfile: Record<string, PetProfileState>

  selectPet: (profileId: string, species: PetSpecies) => void
  addFood: (profileId: string, count?: number) => void
  feedPet: (profileId: string) => void
  getEmoji: (profileId: string) => string
  getProgress: (profileId: string) => number
  getNextStageExp: (profileId: string) => number
  /** 해당 프로필의 펫 상태 일부 반환 (카드/페이지에서 사용) */
  getStateForProfile: (profileId: string) => PetProfileState
}

export const usePetStore = create<PetState>()(
  persist(
    (set, get) => ({
      byProfile: {},

      selectPet: (profileId, species) => {
        set((s) => ({
          byProfile: {
            ...s.byProfile,
            [profileId]: {
              ...(s.byProfile[profileId] ?? defaultProfileState()),
              species,
              stage: 0,
              totalFed: 0,
              pendingFood: 0,
            },
          },
        }))
      },

      addFood: (profileId, count = 1) => {
        set((s) => {
          const current = s.byProfile[profileId] ?? defaultProfileState()
          return {
            byProfile: {
              ...s.byProfile,
              [profileId]: {
                ...current,
                pendingFood: current.pendingFood + count,
              },
            },
          }
        })
      },

      feedPet: (profileId) => {
        const s = get()
        const current = s.byProfile[profileId] ?? defaultProfileState()
        const { pendingFood, totalFed, stage, isEating } = current
        if (pendingFood <= 0 || isEating) return

        set((state) => ({
          byProfile: {
            ...state.byProfile,
            [profileId]: {
              ...(state.byProfile[profileId] ?? defaultProfileState()),
              isEating: true,
            },
          },
        }))

        setTimeout(() => {
          const now = get().byProfile[profileId] ?? current
          const newTotal = now.totalFed + now.pendingFood
          let newStage = now.stage
          for (let i = EXP_PER_STAGE.length - 1; i >= 0; i--) {
            if (newTotal >= EXP_PER_STAGE[i]) {
              newStage = i as GrowthStage
              break
            }
          }
          set((state) => ({
            byProfile: {
              ...state.byProfile,
              [profileId]: {
                ...(state.byProfile[profileId] ?? defaultProfileState()),
                totalFed: newTotal,
                pendingFood: 0,
                stage: newStage,
                isEating: false,
              },
            },
          }))
        }, 1800)
      },

      getEmoji: (profileId) => {
        const current = get().byProfile[profileId] ?? defaultProfileState()
        const { species, stage } = current
        return species ? PET_META[species].stages[stage] : '🥚'
      },

      getProgress: (profileId) => {
        const current = get().byProfile[profileId] ?? defaultProfileState()
        const { totalFed, stage } = current
        if (stage >= 4) return 1
        const cur = EXP_PER_STAGE[stage]
        const next = EXP_PER_STAGE[stage + 1]
        return Math.min(1, (totalFed - cur) / (next - cur))
      },

      getNextStageExp: (profileId) => {
        const current = get().byProfile[profileId] ?? defaultProfileState()
        const { stage } = current
        return stage >= 4 ? EXP_PER_STAGE[4] : EXP_PER_STAGE[stage + 1]
      },

      getStateForProfile: (profileId) => {
        return get().byProfile[profileId] ?? defaultProfileState()
      },
    }),
    { name: 'rhymia-pet' }
  )
)
