/**
 * 가족 프로필 전역 상태 (Zustand + persist)
 * 비개발자: "누가 쓰는지" 프로필 목록과 지금 선택된 프로필을 저장하고, 추가/수정/삭제/전환을 처리해요.
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
        set((state) => ({ profiles: [...state.profiles, newProfile] }))
        return newProfile
      },

      updateProfile: (id, updates) => {
        set((state) => ({
          profiles: state.profiles.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }))
      },

      deleteProfile: (id) => {
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
          activeProfileId: state.activeProfileId === id ? null : state.activeProfileId,
        }))
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
    }),
    { name: 'rhymia-profiles' }
  )
)
