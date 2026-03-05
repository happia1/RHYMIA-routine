/**
 * kidRoutineStore.ts
 * 아이 프로필별 루틴·완료·포인트·캐릭터 상태.
 * profileId별로 분리 저장해 여러 자녀를 지원합니다.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  RoutineTemplate,
  RoutineItem,
  VirtualCompanion,
  RewardPoints,
  POINT_EVENTS,
} from '@/types/routine';

/** 프로필 하나당 루틴 상태 */
export interface KidProfileRoutineState {
  routines: RoutineTemplate[];
  completedItemIds: Record<string, string[]>;
  points: RewardPoints;
  companion: VirtualCompanion | null;
  fullyCompletedToday: Record<string, boolean>;
}

const defaultProfileState = (profileId: string): KidProfileRoutineState => ({
  routines: [],
  completedItemIds: {},
  points: {
    userId: profileId,
    totalPoints: 0,
    streakDays: 0,
    lastCompletedDate: null,
  },
  companion: null,
  fullyCompletedToday: {},
});

interface KidRoutineState {
  /** profileId → 해당 아이의 루틴 상태 */
  byProfile: Record<string, KidProfileRoutineState>;

  getState: (profileId: string) => KidProfileRoutineState;
  ensureProfile: (profileId: string) => void;
  setRoutines: (profileId: string, routines: RoutineTemplate[]) => void;
  completeItem: (profileId: string, routineId: string, itemId: string) => void;
  uncompleteItem: (profileId: string, routineId: string, itemId: string) => void;
  completeRoutine: (profileId: string, routineId: string) => void;
  addRoutineItem: (profileId: string, routineId: string, item: RoutineItem) => void;
  removeRoutineItem: (profileId: string, routineId: string, itemId: string) => void;
  reorderItems: (profileId: string, routineId: string, items: RoutineItem[]) => void;
  setCompanion: (profileId: string, companion: VirtualCompanion) => void;
  feedCompanion: (profileId: string, amount: number) => void;
  addPoints: (profileId: string, amount: number) => void;
  resetDailyProgress: (profileId: string) => void;
}

export const useKidRoutineStore = create<KidRoutineState>()(
  persist(
    (set, get) => {
      const ensureProfile = (profileId: string) => {
        const { byProfile } = get();
        if (byProfile[profileId]) return;
        set({
          byProfile: { ...byProfile, [profileId]: defaultProfileState(profileId) },
        });
      };

      return {
        byProfile: {},

        getState: (profileId) => {
          ensureProfile(profileId);
          return get().byProfile[profileId] ?? defaultProfileState(profileId);
        },

        ensureProfile,

        setRoutines: (profileId, routines) => {
          ensureProfile(profileId);
          set((state) => ({
            byProfile: {
              ...state.byProfile,
              [profileId]: { ...state.byProfile[profileId], routines },
            },
          }));
        },

        completeItem: (profileId, routineId, itemId) => {
          ensureProfile(profileId);
          const state = get().byProfile[profileId];
          const current = state.completedItemIds[routineId] ?? [];
          if (current.includes(itemId)) return;
          const updated = { ...state.completedItemIds, [routineId]: [...current, itemId] };
          const routine = state.routines.find((r) => r.id === routineId);

          set((s) => ({
            byProfile: {
              ...s.byProfile,
              [profileId]: {
                ...s.byProfile[profileId],
                completedItemIds: updated,
                points: {
                  ...s.byProfile[profileId].points,
                  totalPoints:
                    s.byProfile[profileId].points.totalPoints + POINT_EVENTS.ITEM_COMPLETE,
                },
              },
            },
          }));

          if (routine && updated[routineId].length === routine.items.length) {
            get().completeRoutine(profileId, routineId);
          }
        },

        uncompleteItem: (profileId, routineId, itemId) => {
          ensureProfile(profileId);
          const state = get().byProfile[profileId];
          const current = state.completedItemIds[routineId] ?? [];
          set((s) => ({
            byProfile: {
              ...s.byProfile,
              [profileId]: {
                ...s.byProfile[profileId],
                completedItemIds: {
                  ...s.byProfile[profileId].completedItemIds,
                  [routineId]: current.filter((id) => id !== itemId),
                },
                fullyCompletedToday: {
                  ...s.byProfile[profileId].fullyCompletedToday,
                  [routineId]: false,
                },
              },
            },
          }));
        },

        completeRoutine: (profileId, routineId) => {
          ensureProfile(profileId);
          const state = get().byProfile[profileId];
          const points = state.points;
          const today = new Date().toISOString().split('T')[0];
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          const isStreak = points.lastCompletedDate === yesterdayStr;
          const newStreak = isStreak ? points.streakDays + 1 : 1;
          let bonusPoints = POINT_EVENTS.FULLY_COMPLETE;
          if (newStreak >= 7) bonusPoints += POINT_EVENTS.STREAK_7;
          else if (newStreak >= 3) bonusPoints += POINT_EVENTS.STREAK_3;

          set((s) => ({
            byProfile: {
              ...s.byProfile,
              [profileId]: {
                ...s.byProfile[profileId],
                fullyCompletedToday: {
                  ...s.byProfile[profileId].fullyCompletedToday,
                  [routineId]: true,
                },
                points: {
                  ...s.byProfile[profileId].points,
                  totalPoints: s.byProfile[profileId].points.totalPoints + bonusPoints,
                  streakDays: newStreak,
                  lastCompletedDate: today,
                },
              },
            },
          }));
          get().feedCompanion(profileId, 15);
        },

        addRoutineItem: (profileId, routineId, item) => {
          ensureProfile(profileId);
          set((s) => ({
            byProfile: {
              ...s.byProfile,
              [profileId]: {
                ...s.byProfile[profileId],
                routines: s.byProfile[profileId].routines.map((r) =>
                  r.id === routineId ? { ...r, items: [...r.items, item] } : r
                ),
              },
            },
          }));
        },

        removeRoutineItem: (profileId, routineId, itemId) => {
          ensureProfile(profileId);
          set((s) => ({
            byProfile: {
              ...s.byProfile,
              [profileId]: {
                ...s.byProfile[profileId],
                routines: s.byProfile[profileId].routines.map((r) =>
                  r.id === routineId
                    ? { ...r, items: r.items.filter((i) => i.id !== itemId) }
                    : r
                ),
              },
            },
          }));
        },

        reorderItems: (profileId, routineId, items) => {
          ensureProfile(profileId);
          set((s) => ({
            byProfile: {
              ...s.byProfile,
              [profileId]: {
                ...s.byProfile[profileId],
                routines: s.byProfile[profileId].routines.map((r) =>
                  r.id === routineId ? { ...r, items } : r
                ),
              },
            },
          }));
        },

        setCompanion: (profileId, companion) => {
          ensureProfile(profileId);
          set((s) => ({
            byProfile: {
              ...s.byProfile,
              [profileId]: { ...s.byProfile[profileId], companion },
            },
          }));
        },

        feedCompanion: (profileId, amount) => {
          ensureProfile(profileId);
          const state = get().byProfile[profileId];
          const companion = state.companion;
          if (!companion) return;
          const newHappiness = Math.min(100, companion.happiness + amount);
          const newExp = companion.totalExp + amount;
          const thresholds = [0, 100, 300, 600, 1000];
          let newStage = companion.growthStage;
          for (let i = 4; i >= 0; i--) {
            if (newExp >= thresholds[i]) {
              newStage = i as 0 | 1 | 2 | 3 | 4;
              break;
            }
          }
          set((s) => ({
            byProfile: {
              ...s.byProfile,
              [profileId]: {
                ...s.byProfile[profileId],
                companion: {
                  ...companion,
                  happiness: newHappiness,
                  totalExp: newExp,
                  growthStage: newStage,
                  lastUpdated: new Date().toISOString(),
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
                points: {
                  ...s.byProfile[profileId].points,
                  totalPoints: s.byProfile[profileId].points.totalPoints + amount,
                },
              },
            },
          }));
        },

        resetDailyProgress: (profileId) => {
          ensureProfile(profileId);
          set((s) => {
            const st = s.byProfile[profileId];
            const companion = st?.companion;
            return {
              byProfile: {
                ...s.byProfile,
                [profileId]: {
                  ...s.byProfile[profileId],
                  completedItemIds: {},
                  fullyCompletedToday: {},
                  ...(companion && {
                    companion: {
                      ...companion,
                      happiness: Math.max(0, companion.happiness - 5),
                      hunger: Math.max(0, (companion.hunger ?? 0) - 10),
                    },
                  }),
                },
              },
            };
          });
        },
      };
    },
    { name: 'kid-routine-store' }
  )
);

/**
 * 특정 아이 프로필의 루틴 상태·액션만 구독하는 훅.
 * kid/[id] 페이지에서 useKidRoutineForProfile(id) 형태로 사용.
 */
export function useKidRoutineForProfile(profileId: string | undefined) {
  const byProfile = useKidRoutineStore((s) => s.byProfile);
  const setRoutinesFn = useKidRoutineStore((s) => s.setRoutines);
  const completeItemFn = useKidRoutineStore((s) => s.completeItem);
  const uncompleteItemFn = useKidRoutineStore((s) => s.uncompleteItem);
  const completeRoutineFn = useKidRoutineStore((s) => s.completeRoutine);
  const setCompanionFn = useKidRoutineStore((s) => s.setCompanion);
  const feedCompanionFn = useKidRoutineStore((s) => s.feedCompanion);

  if (!profileId) {
    return {
      routines: [] as RoutineTemplate[],
      completedItemIds: {} as Record<string, string[]>,
      fullyCompletedToday: {} as Record<string, boolean>,
      points: { userId: '', totalPoints: 0, streakDays: 0, lastCompletedDate: null },
      companion: null as VirtualCompanion | null,
      setRoutines: (_: RoutineTemplate[]) => {},
      completeItem: (_: string, __: string) => {},
      uncompleteItem: (_: string, __: string) => {},
      completeRoutine: (_: string) => {},
      setCompanion: (_: VirtualCompanion) => {},
      feedCompanion: (_: number) => {},
    };
  }

  const state = byProfile[profileId] ?? defaultProfileState(profileId);

  return {
    ...state,
    setRoutines: (routines: RoutineTemplate[]) => setRoutinesFn(profileId, routines),
    completeItem: (routineId: string, itemId: string) =>
      completeItemFn(profileId, routineId, itemId),
    uncompleteItem: (routineId: string, itemId: string) =>
      uncompleteItemFn(profileId, routineId, itemId),
    completeRoutine: (routineId: string) => completeRoutineFn(profileId, routineId),
    setCompanion: (c: VirtualCompanion) => setCompanionFn(profileId, c),
    feedCompanion: (amount: number) => feedCompanionFn(profileId, amount),
  };
}
