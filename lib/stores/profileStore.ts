/**
 * 가족 프로필 전역 상태 (Zustand + persist)
 * 비개발자: "누가 쓰는지" 프로필 목록과 지금 선택된 프로필을 저장하고, 추가/수정/삭제/전환을 처리해요.
 *
 * [버그 수정 2024]
 * - activeProfileId가 null인데 profiles가 있을 때 → 첫 번째 프로필을 자동으로 활성화
 * - 앱 재진입 시 onboarding 반복 문제 해결
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FamilyProfile, ProfileRole } from '@/types/profile'

interface ProfileState {
  profiles: FamilyProfile[]
  activeProfileId: string | null

  addProfile: (profile: Omit<FamilyProfile, 'id' | 'createdAt'>) => FamilyProfile
  updateProfile: (id: string, updates: Partial<FamilyProfile>) => void
  deleteProfile: (id: string) => void
  setActiveProfile: (id: string) => void
  getActiveProfile: () => FamilyProfile | null
  getProfile: (id: string) => FamilyProfile | undefined
  getChildProfiles: () => FamilyProfile[]
  getParentProfiles: () => FamilyProfile[]
  ensureActiveProfile: () => void  // ← 추가: 앱 진입 시 activeProfileId 자동복구
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeProfileId: null,

      addProfile: (profileData) => {
        const newProfile: FamilyProfile = {
          ...profileData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }
        set((state) => {
          // 첫 번째 프로필이면 자동으로 activeProfileId 설정
          const isFirst = state.profiles.length === 0
          return {
            profiles: [...state.profiles, newProfile],
            activeProfileId: isFirst ? newProfile.id : state.activeProfileId,
          }
        })
        return newProfile
      },

      updateProfile: (id, updates) => {
        set((state) => ({
          profiles: state.profiles.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }))
      },

      deleteProfile: (id) => {
        set((state) => {
          const remaining = state.profiles.filter((p) => p.id !== id)
          const newActiveId =
            state.activeProfileId === id
              ? (remaining[0]?.id ?? null)  // 삭제된 프로필이 활성이면 다음 프로필로
              : state.activeProfileId
          return {
            profiles: remaining,
            activeProfileId: newActiveId,
          }
        })
      },

      setActiveProfile: (id) => set({ activeProfileId: id }),

      getActiveProfile: () => {
        const { profiles, activeProfileId } = get()
        return profiles.find((p) => p.id === activeProfileId) ?? null
      },

      getProfile: (id) => {
        return get().profiles.find((p) => p.id === id)
      },

      getChildProfiles: () => {
        return get().profiles.filter((p) =>
          p.role === 'child_preschool' || p.role === 'child_school'
        )
      },

      getParentProfiles: () => {
        return get().profiles.filter((p) =>
          p.role === 'mom' || p.role === 'dad'
        )
      },

      /**
       * 앱 진입 시 호출: activeProfileId가 없거나 유효하지 않으면 첫 번째 프로필로 복구
       * AppShell의 hydration 완료 후 한 번 호출해요.
       */
      ensureActiveProfile: () => {
        const { profiles, activeProfileId } = get()
        if (profiles.length === 0) return

        const isValid = profiles.some((p) => p.id === activeProfileId)
        if (!isValid) {
          // activeProfileId가 null이거나 이미 삭제된 id면 첫 번째 프로필로 복구
          set({ activeProfileId: profiles[0].id })
        }
      },
    }),
    { name: 'rhymia-profiles' }
  )
)