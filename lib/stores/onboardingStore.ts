/**
 * 온보딩 플로우 전용 상태 (자녀 나이대·성별·선택한 펫 등)
 * 비개발자: "우리아이 루틴" 선택 후 미취학/학령기 → 여아/남아 → 펫 선택한 값을 저장하고,
 * 프로필 설정 화면에서 기본 이미지·역할·펫 연결에 사용해요.
 */

import { create } from 'zustand'
import type { ProfileRole, ChildGender } from '@/types/profile'
import type { PetSpecies } from '@/types/pet'

interface OnboardingState {
  childRole: ProfileRole | null
  childGender: ChildGender
  /** 자녀 온보딩에서 선택한 펫 종류 (profile-setup 완료 시 해당 프로필에 연결) */
  selectedPetSpecies: PetSpecies | null
  setChildRole: (role: ProfileRole) => void
  setChildGender: (gender: ChildGender) => void
  setSelectedPetSpecies: (species: PetSpecies | null) => void
  reset: () => void
}

export const useOnboardingStore = create<OnboardingState>()((set) => ({
  childRole: null,
  childGender: null,
  selectedPetSpecies: null,
  setChildRole: (role) => set({ childRole: role }),
  setChildGender: (gender) => set({ childGender: gender }),
  setSelectedPetSpecies: (species) => set({ selectedPetSpecies: species }),
  reset: () => set({ childRole: null, childGender: null, selectedPetSpecies: null }),
}))
