/**
 * profileStore.ts
 * 프로필 목록·선택 상태. localStorage에 persist.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppProfile } from '@/types/profile';

export interface ProfileStoreState {
  profiles: AppProfile[];
  activeProfileId: string | null;
  addProfile: (profile: AppProfile) => void;
  removeProfile: (id: string) => void;
  updateProfile: (id: string, updates: Partial<Omit<AppProfile, 'id' | 'type' | 'createdAt'>>) => void;
  setActiveProfile: (id: string | null) => void;
  getProfile: (id: string) => AppProfile | undefined;
}

export const useProfileStore = create<ProfileStoreState>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeProfileId: null,

      addProfile: (profile) =>
        set((state) => ({
          profiles: [...state.profiles, profile],
        })),

      removeProfile: (id) =>
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
          activeProfileId: state.activeProfileId === id ? null : state.activeProfileId,
        })),

      updateProfile: (id, updates) =>
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      setActiveProfile: (id) => set({ activeProfileId: id }),

      getProfile: (id) => get().profiles.find((p) => p.id === id),
    }),
    { name: 'rhymia-profile-store' }
  )
);
