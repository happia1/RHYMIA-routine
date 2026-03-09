/**
 * 온보딩 플로우 전용 상태 (자녀 나이대·성별 등)
 * 비개발자: "우리아이 루틴" 선택 후 미취학/학령기 → 여아/남아 선택한 값을 저장하고,
 * 프로필 설정 화면에서 기본 이미지·역할에 사용해요.
 */

import { create } from 'zustand'
import type { ProfileRole, ChildGender } from '@/types/profile'

interface OnboardingState {
  childRole: ProfileRole | null
  childGender: ChildGender
  setChildRole: (role: ProfileRole) => void
  setChildGender: (gender: ChildGender) => void
  reset: () => void
}

export const useOnboardingStore = create<OnboardingState>()((set) => ({
  childRole: null,
  childGender: null,
  setChildRole: (role) => set({ childRole: role }),
  setChildGender: (gender) => set({ childGender: gender }),
  reset: () => set({ childRole: null, childGender: null }),
}))
