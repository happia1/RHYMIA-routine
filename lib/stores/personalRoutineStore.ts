/**
 * personalRoutineStore.ts
 * 개인 프로필별 루틴·완료·스트릭·포인트. kidRoutineStore와 구조를 맞춤.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RoutineItem } from '@/types/routine';

/** 개인 루틴 시간대 */
export type PersonalSlot = 'morning' | 'afternoon' | 'evening' | 'night';

export interface PersonalRoutineState {
  /** 시간대별 루틴 항목 */
  itemsBySlot: Record<PersonalSlot, RoutineItem[]>;
  /** 시간대별 오늘 완료된 항목 id[] */
  completedItemIds: Record<PersonalSlot, string[]>;
  totalPoints: number;
  streakDays: number;
  lastCompletedDate: string | null;
  /** 게이미피케이션 ON일 때 경험치 등 (간단히 exp만) */
  exp: number;
}

const defaultSlotItems = (): Record<PersonalSlot, RoutineItem[]> => ({
  morning: [],
  afternoon: [],
  evening: [],
  night: [],
});

const defaultState = (profileId: string): PersonalRoutineState => ({
  itemsBySlot: defaultSlotItems(),
  completedItemIds: { morning: [], afternoon: [], evening: [], night: [] },
  totalPoints: 0,
  streakDays: 0,
  lastCompletedDate: null,
  exp: 0,
});

interface PersonalRoutineStoreState {
  byProfile: Record<string, PersonalRoutineState>;
  getState: (profileId: string) => PersonalRoutineState;
  ensureProfile: (profileId: string) => void;
  setItemsForSlot: (profileId: string, slot: PersonalSlot, items: RoutineItem[]) => void;
  completeItem: (profileId: string, slot: PersonalSlot, itemId: string) => void;
  uncompleteItem: (profileId: string, slot: PersonalSlot, itemId: string) => void;
  addItem: (profileId: string, slot: PersonalSlot, item: RoutineItem) => void;
  removeItem: (profileId: string, slot: PersonalSlot, itemId: string) => void;
  addPoints: (profileId: string, amount: number) => void;
  addExp: (profileId: string, amount: number) => void;
  resetDailyProgress: (profileId: string) => void;
}

export const usePersonalRoutineStore = create<PersonalRoutineStoreState>()(
  persist(
    (set, get) => {
      const ensureProfile = (profileId: string) => {
        const { byProfile } = get();
        if (byProfile[profileId]) return;
        set({ byProfile: { ...byProfile, [profileId]: defaultState(profileId) } });
      };

      return {
        byProfile: {},

        getState: (profileId) => {
          ensureProfile(profileId);
          return get().byProfile[profileId] ?? defaultState(profileId);
        },

        ensureProfile,

        setItemsForSlot: (profileId, slot, items) => {
          ensureProfile(profileId);
          set((s) => ({
            byProfile: {
              ...s.byProfile,
              [profileId]: {
                ...s.byProfile[profileId],
                itemsBySlot: {
                  ...s.byProfile[profileId].itemsBySlot,
                  [slot]: items,
                },
              },
            },
          }));
        },

        completeItem: (profileId, slot, itemId) => {
          ensureProfile(profileId);
          const state = get().byProfile[profileId];
          const current = state.completedItemIds[slot] ?? [];
          if (current.includes(itemId)) return;
          const updated = { ...state.completedItemIds, [slot]: [...current, itemId] };
          set((s) => ({
            byProfile: {
              ...s.byProfile,
              [profileId]: {
                ...s.byProfile[profileId],
                completedItemIds: updated,
                totalPoints: s.byProfile[profileId].totalPoints + 10,
              },
            },
          }));
          get().addExp(profileId, 10);
        },

        uncompleteItem: (profileId, slot, itemId) => {
          ensureProfile(profileId);
          const state = get().byProfile[profileId];
          const current = state.completedItemIds[slot] ?? [];
          set((s) => ({
            byProfile: {
              ...s.byProfile,
              [profileId]: {
                ...s.byProfile[profileId],
                completedItemIds: {
                  ...s.byProfile[profileId].completedItemIds,
                  [slot]: current.filter((id) => id !== itemId),
                },
                totalPoints: Math.max(0, s.byProfile[profileId].totalPoints - 10),
              },
            },
          }));
        },

        addItem: (profileId, slot, item) => {
          ensureProfile(profileId);
          set((s) => {
            const items = [...(s.byProfile[profileId].itemsBySlot[slot] ?? []), item];
            return {
              byProfile: {
                ...s.byProfile,
                [profileId]: {
                  ...s.byProfile[profileId],
                  itemsBySlot: {
                    ...s.byProfile[profileId].itemsBySlot,
                    [slot]: items,
                  },
                },
              },
            };
          });
        },

        removeItem: (profileId, slot, itemId) => {
          ensureProfile(profileId);
          set((s) => ({
            byProfile: {
              ...s.byProfile,
              [profileId]: {
                ...s.byProfile[profileId],
                itemsBySlot: {
                  ...s.byProfile[profileId].itemsBySlot,
                  [slot]: (s.byProfile[profileId].itemsBySlot[slot] ?? []).filter(
                    (i) => i.id !== itemId
                  ),
                },
              },
            },
          }));
        },

        addPoints: (profileId, amount) => {
          ensureProfile(profileId);
          set((s) => ({
            byProfile: {
              ...s.byProfile,
              [profileId]: {
                ...s.byProfile[profileId],
                totalPoints: s.byProfile[profileId].totalPoints + amount,
              },
            },
          }));
        },

        addExp: (profileId, amount) => {
          ensureProfile(profileId);
          set((s) => ({
            byProfile: {
              ...s.byProfile,
              [profileId]: {
                ...s.byProfile[profileId],
                exp: s.byProfile[profileId].exp + amount,
              },
            },
          }));
        },

        resetDailyProgress: (profileId) => {
          ensureProfile(profileId);
          set((s) => ({
            byProfile: {
              ...s.byProfile,
              [profileId]: {
                ...s.byProfile[profileId],
                completedItemIds: {
                  morning: [],
                  afternoon: [],
                  evening: [],
                  night: [],
                },
              },
            },
          }));
        },
      };
    },
    { name: 'personal-routine-store' }
  )
);

/** 목표 기반 기본 루틴 항목 생성 (온보딩에서 선택한 goals 사용) */
export const DEFAULT_ITEMS_BY_GOAL: Record<string, RoutineItem[]> = {
  health: [
    { id: 'health-1', label: '물 마시기', icon: '💧', ttsText: '물 마시기', category: 'other', order: 1 },
    { id: 'health-2', label: '스트레칭', icon: '🧘', ttsText: '스트레칭', category: 'exercise', order: 2 },
  ],
  study: [
    { id: 'study-1', label: '독서 30분', icon: '📖', ttsText: '독서', category: 'study', order: 1 },
    { id: 'study-2', label: '오늘 할 일 정리', icon: '📋', ttsText: '할 일 정리', category: 'study', order: 2 },
  ],
  exercise: [
    { id: 'ex-1', label: '산책', icon: '🚶', ttsText: '산책', category: 'exercise', order: 1 },
    { id: 'ex-2', label: '운동', icon: '🏃', ttsText: '운동', category: 'exercise', order: 2 },
  ],
  mind: [
    { id: 'mind-1', label: '명상', icon: '🧘', ttsText: '명상', category: 'other', order: 1 },
    { id: 'mind-2', label: '일기쓰기', icon: '📔', ttsText: '일기', category: 'other', order: 2 },
  ],
  sleep: [
    { id: 'sleep-1', label: '핸드폰 끄기', icon: '📵', ttsText: '휴대폰 끄기', category: 'other', order: 1 },
    { id: 'sleep-2', label: '수면 준비', icon: '😴', ttsText: '수면 준비', category: 'other', order: 2 },
  ],
  growth: [
    { id: 'growth-1', label: '자기계발 30분', icon: '💼', ttsText: '자기계발', category: 'study', order: 1 },
  ],
};

export function getDefaultPersonalItems(goals: string[]): RoutineItem[] {
  const seen = new Set<string>();
  const result: RoutineItem[] = [];
  goals.forEach((g) => {
    const items = DEFAULT_ITEMS_BY_GOAL[g];
    if (items) {
      items.forEach((item) => {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          result.push({ ...item, order: result.length + 1 });
        }
      });
    }
  });
  return result.length ? result : [{ id: 'default-1', label: '루틴 추가하기', icon: '➕', ttsText: '루틴', category: 'other', order: 1 }];
}

/** 특정 개인 프로필의 루틴 상태·액션 훅 */
export function usePersonalRoutineForProfile(profileId: string | undefined) {
  const byProfile = usePersonalRoutineStore((s) => s.byProfile);
  const setItemsForSlot = usePersonalRoutineStore((s) => s.setItemsForSlot);
  const completeItemFn = usePersonalRoutineStore((s) => s.completeItem);
  const uncompleteItemFn = usePersonalRoutineStore((s) => s.uncompleteItem);
  const addItemFn = usePersonalRoutineStore((s) => s.addItem);
  const removeItemFn = usePersonalRoutineStore((s) => s.removeItem);

  if (!profileId) {
    return {
      itemsBySlot: defaultSlotItems(),
      completedItemIds: { morning: [], afternoon: [], evening: [], night: [] } as Record<PersonalSlot, string[]>,
      totalPoints: 0,
      streakDays: 0,
      lastCompletedDate: null,
      exp: 0,
      setItemsForSlot: (_: PersonalSlot, __: RoutineItem[]) => {},
      completeItem: (_: PersonalSlot, __: string) => {},
      uncompleteItem: (_: PersonalSlot, __: string) => {},
      addItem: (_: PersonalSlot, __: RoutineItem) => {},
      removeItem: (_: PersonalSlot, __: string) => {},
    };
  }

  const state = byProfile[profileId] ?? defaultState(profileId);
  return {
    ...state,
    setItemsForSlot: (slot: PersonalSlot, items: RoutineItem[]) =>
      setItemsForSlot(profileId, slot, items),
    completeItem: (slot: PersonalSlot, itemId: string) => completeItemFn(profileId, slot, itemId),
    uncompleteItem: (slot: PersonalSlot, itemId: string) =>
      uncompleteItemFn(profileId, slot, itemId),
    addItem: (slot: PersonalSlot, item: RoutineItem) => addItemFn(profileId, slot, item),
    removeItem: (slot: PersonalSlot, itemId: string) => removeItemFn(profileId, slot, itemId),
  };
}
