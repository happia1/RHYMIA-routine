/**
 * 캐릭터(펫) 전역 상태 — 먹이 → 성장 단계
 * 비개발자: 자녀가 루틴을 완료하면 부모가 "먹이"를 받고, 먹이를 주면 캐릭터가 성장해요.
 * 알→아기→소년→청년→어른 단계가 있으며, 5종 캐릭터(펭귄/파랑새/강아지/고양이/식물) 중 하나를 선택해 키워요.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PetSpecies, GrowthStage, PET_META, EXP_PER_STAGE } from '@/types/pet'

// 기존 컴포넌트 호환용 re-export
export { PET_META, EXP_PER_STAGE } from '@/types/pet'
export type { PetSpecies, GrowthStage } from '@/types/pet'

interface PetState {
  species: PetSpecies | null
  name: string
  stage: GrowthStage
  totalFed: number
  pendingFood: number
  isEating: boolean

  selectPet: (species: PetSpecies) => void
  addFood: (count?: number) => void
  feedPet: () => void
  getEmoji: () => string
  getProgress: () => number
  getNextStageExp: () => number
}

export const usePetStore = create<PetState>()(
  persist(
    (set, get) => ({
      species: null,
      name: '',
      stage: 0,
      totalFed: 0,
      pendingFood: 0,
      isEating: false,

      selectPet: (species) =>
        set({ species, stage: 0, totalFed: 0, pendingFood: 0 }),

      addFood: (count = 1) =>
        set((s) => ({ pendingFood: s.pendingFood + count })),

      feedPet: () => {
        const { pendingFood, totalFed, stage, isEating } = get()
        if (pendingFood <= 0 || isEating) return
        set({ isEating: true })
        setTimeout(() => {
          const newTotal = totalFed + pendingFood
          let newStage = stage
          for (let i = EXP_PER_STAGE.length - 1; i >= 0; i--) {
            if (newTotal >= EXP_PER_STAGE[i]) {
              newStage = i as GrowthStage
              break
            }
          }
          set({
            totalFed: newTotal,
            pendingFood: 0,
            stage: newStage,
            isEating: false,
          })
        }, 1800)
      },

      getEmoji: () => {
        const { species, stage } = get()
        return species ? PET_META[species].stages[stage] : '🥚'
      },

      getProgress: () => {
        const { totalFed, stage } = get()
        if (stage >= 4) return 1
        const cur = EXP_PER_STAGE[stage]
        const next = EXP_PER_STAGE[stage + 1]
        return Math.min(1, (totalFed - cur) / (next - cur))
      },

      getNextStageExp: () => {
        const { stage } = get()
        return stage >= 4 ? EXP_PER_STAGE[4] : EXP_PER_STAGE[stage + 1]
      },
    }),
    { name: 'rhymia-pet' }
  )
)
