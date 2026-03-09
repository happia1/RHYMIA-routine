/**
 * 프로필별 개인 루틴 스토어 (/personal/[id] 체크리스트용)
 * 비개발자: 엄마/아빠·학령기 자녀의 "나의 루틴" 화면에서 시간대별 항목·완료·포인트를 프로필마다 따로 저장해요.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RoutineItem } from '@/types/routine'

/** 시간대 슬롯 (아침/오후/저녁/밤) */
export type PersonalSlot = 'morning' | 'afternoon' | 'evening' | 'night'

function emptyItemsBySlot(): Record<PersonalSlot, RoutineItem[]> {
  return { morning: [], afternoon: [], evening: [], night: [] }
}

function emptyCompletedIds(): Record<PersonalSlot, string[]> {
  return { morning: [], afternoon: [], evening: [], night: [] }
}

interface ProfileData {
  itemsBySlot: Record<PersonalSlot, RoutineItem[]>
  completedItemIds: Record<PersonalSlot, string[]>
  totalPoints: number
  streakDays: number
  lastCompletedDate: string | null
}

function defaultProfileData(): ProfileData {
  return {
    itemsBySlot: emptyItemsBySlot(),
    completedItemIds: emptyCompletedIds(),
    totalPoints: 0,
    streakDays: 0,
    lastCompletedDate: null,
  }
}

interface PersonalRoutineByProfileState {
  byProfile: Record<string, ProfileData>
  setItemsForSlot: (profileId: string, slot: PersonalSlot, items: RoutineItem[]) => void
  completeItem: (profileId: string, slot: PersonalSlot, itemId: string) => void
  uncompleteItem: (profileId: string, slot: PersonalSlot, itemId: string) => void
  addItem: (profileId: string, slot: PersonalSlot, item: RoutineItem) => void
  removeItem: (profileId: string, slot: PersonalSlot, itemId: string) => void
}

export const usePersonalRoutineByProfileStore = create<PersonalRoutineByProfileState>()(
  persist(
    (set, get) => ({
      byProfile: {},

      setItemsForSlot: (profileId, slot, items) => {
        set((s) => {
          const data = s.byProfile[profileId] ?? defaultProfileData()
          const next = { ...data, itemsBySlot: { ...data.itemsBySlot, [slot]: items } }
          return { byProfile: { ...s.byProfile, [profileId]: next } }
        })
      },

      completeItem: (profileId, slot, itemId) => {
        set((s) => {
          const data = s.byProfile[profileId] ?? defaultProfileData()
          const ids = data.completedItemIds[slot]
          if (ids.includes(itemId)) return s
          const nextIds = { ...data.completedItemIds, [slot]: [...ids, itemId] }
          const today = new Date().toISOString().split('T')[0]
          const last = data.lastCompletedDate
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const yesterdayStr = yesterday.toISOString().split('T')[0]
          const streakDays = last === yesterdayStr || last === today ? data.streakDays : data.streakDays + 1
          const next = {
            ...data,
            completedItemIds: nextIds,
            totalPoints: data.totalPoints + 10,
            lastCompletedDate: today,
            streakDays,
          }
          return { byProfile: { ...s.byProfile, [profileId]: next } }
        })
      },

      uncompleteItem: (profileId, slot, itemId) => {
        set((s) => {
          const data = s.byProfile[profileId] ?? defaultProfileData()
          const ids = data.completedItemIds[slot].filter((id) => id !== itemId)
          const next = { ...data, completedItemIds: { ...data.completedItemIds, [slot]: ids }, totalPoints: Math.max(0, data.totalPoints - 10) }
          return { byProfile: { ...s.byProfile, [profileId]: next } }
        })
      },

      addItem: (profileId, slot, item) => {
        set((s) => {
          const data = s.byProfile[profileId] ?? defaultProfileData()
          const list = [...(data.itemsBySlot[slot] ?? []), item]
          const next = { ...data, itemsBySlot: { ...data.itemsBySlot, [slot]: list } }
          return { byProfile: { ...s.byProfile, [profileId]: next } }
        })
      },

      removeItem: (profileId, slot, itemId) => {
        set((s) => {
          const data = s.byProfile[profileId] ?? defaultProfileData()
          const list = (data.itemsBySlot[slot] ?? []).filter((i) => i.id !== itemId)
          const ids = (data.completedItemIds[slot] ?? []).filter((id) => id !== itemId)
          const next = {
            ...data,
            itemsBySlot: { ...data.itemsBySlot, [slot]: list },
            completedItemIds: { ...data.completedItemIds, [slot]: ids },
          }
          return { byProfile: { ...s.byProfile, [profileId]: next } }
        })
      },
    }),
    { name: 'rhymia-personal-routine-by-profile' }
  )
)

/** 목표 키워드로 기본 루틴 항목 생성 (엄마/아빠 첫 진입 시 추천) */
export function getDefaultPersonalItems(goals: string[]): RoutineItem[] {
  if (goals.length === 0) return []
  return goals.slice(0, 6).map((label, i) => ({
    id: `goal-${Date.now()}-${i}`,
    label,
    icon: '✅',
    order: i + 1,
    timerSeconds: 180,
    category: 'other' as const,
  }))
}

/** 프로필별 개인 루틴 훅: itemsBySlot, completedItemIds, 포인트, 완료/추가/삭제 액션 */
export function usePersonalRoutineForProfile(profileId: string | undefined) {
  const byProfile = usePersonalRoutineByProfileStore((s) => s.byProfile)
  const setItemsForSlot = usePersonalRoutineByProfileStore((s) => s.setItemsForSlot)
  const completeItemFn = usePersonalRoutineByProfileStore((s) => s.completeItem)
  const uncompleteItemFn = usePersonalRoutineByProfileStore((s) => s.uncompleteItem)
  const addItemFn = usePersonalRoutineByProfileStore((s) => s.addItem)
  const removeItemFn = usePersonalRoutineByProfileStore((s) => s.removeItem)

  const data = profileId ? byProfile[profileId] ?? defaultProfileData() : defaultProfileData()
  const itemsBySlot = data.itemsBySlot
  const completedItemIds = data.completedItemIds
  const totalPoints = data.totalPoints
  const streakDays = data.streakDays
  const exp = totalPoints % 100

  return {
    itemsBySlot,
    completedItemIds,
    totalPoints,
    streakDays,
    exp,
    setItemsForSlot: (slot: PersonalSlot, items: RoutineItem[]) =>
      profileId && setItemsForSlot(profileId, slot, items),
    completeItem: (slot: PersonalSlot, itemId: string) =>
      profileId && completeItemFn(profileId, slot, itemId),
    uncompleteItem: (slot: PersonalSlot, itemId: string) =>
      profileId && uncompleteItemFn(profileId, slot, itemId),
    addItem: (slot: PersonalSlot, item: RoutineItem) =>
      profileId && addItemFn(profileId, slot, item),
    removeItem: (slot: PersonalSlot, itemId: string) =>
      profileId && removeItemFn(profileId, slot, itemId),
  }
}
