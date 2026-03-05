// lib/stores/kidRoutineStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RoutineTemplate, RoutineItem, VirtualCompanion, RewardPoints, POINT_EVENTS } from '@/types/routine';

interface KidRoutineState {
  // 루틴 데이터
  routines: RoutineTemplate[];
  activeRoutineId: string | null;
  completedItemIds: Record<string, string[]>; // routineId → 완료된 item id[]

  // 포인트/보상
  points: RewardPoints;

  // 펫/식물
  companion: VirtualCompanion | null;

  // 오늘 완료 여부 (루틴별)
  fullyCompletedToday: Record<string, boolean>;

  // 액션
  setRoutines: (routines: RoutineTemplate[]) => void;
  setActiveRoutine: (id: string) => void;
  completeItem: (routineId: string, itemId: string) => void;
  uncompleteItem: (routineId: string, itemId: string) => void;
  completeRoutine: (routineId: string) => void;
  addRoutineItem: (routineId: string, item: RoutineItem) => void;
  removeRoutineItem: (routineId: string, itemId: string) => void;
  reorderItems: (routineId: string, items: RoutineItem[]) => void;
  setCompanion: (companion: VirtualCompanion) => void;
  feedCompanion: (amount: number) => void;
  addPoints: (amount: number) => void;
  resetDailyProgress: () => void;
}

export const useKidRoutineStore = create<KidRoutineState>()(
  persist(
    (set, get) => ({
      routines: [],
      activeRoutineId: null,
      completedItemIds: {},
      points: {
        userId: '',
        totalPoints: 0,
        streakDays: 0,
        lastCompletedDate: null,
      },
      companion: null,
      fullyCompletedToday: {},

      setRoutines: (routines) => set({ routines }),

      setActiveRoutine: (id) => set({ activeRoutineId: id }),

      completeItem: (routineId, itemId) => {
        const { completedItemIds, routines } = get();
        const current = completedItemIds[routineId] ?? [];
        if (current.includes(itemId)) return;

        const updated = { ...completedItemIds, [routineId]: [...current, itemId] };
        set({ completedItemIds: updated });

        // 포인트 지급
        get().addPoints(POINT_EVENTS.ITEM_COMPLETE);

        // 전체 완료 체크
        const routine = routines.find((r) => r.id === routineId);
        if (routine && updated[routineId].length === routine.items.length) {
          get().completeRoutine(routineId);
        }
      },

      uncompleteItem: (routineId, itemId) => {
        const { completedItemIds } = get();
        const current = completedItemIds[routineId] ?? [];
        set({
          completedItemIds: {
            ...completedItemIds,
            [routineId]: current.filter((id) => id !== itemId),
          },
          fullyCompletedToday: {
            ...get().fullyCompletedToday,
            [routineId]: false,
          },
        });
      },

      completeRoutine: (routineId) => {
        const { points, fullyCompletedToday } = get();
        const today = new Date().toISOString().split('T')[0];

        // 스트릭 계산
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const isStreak = points.lastCompletedDate === yesterdayStr;
        const newStreak = isStreak ? points.streakDays + 1 : 1;

        // 스트릭 보너스
        let bonusPoints = POINT_EVENTS.FULLY_COMPLETE;
        if (newStreak >= 7) bonusPoints += POINT_EVENTS.STREAK_7;
        else if (newStreak >= 3) bonusPoints += POINT_EVENTS.STREAK_3;

        set({
          fullyCompletedToday: { ...fullyCompletedToday, [routineId]: true },
          points: {
            ...points,
            totalPoints: points.totalPoints + bonusPoints,
            streakDays: newStreak,
            lastCompletedDate: today,
          },
        });

        // 펫 행복도 증가
        get().feedCompanion(15);
      },

      addRoutineItem: (routineId, item) => {
        set((state) => ({
          routines: state.routines.map((r) =>
            r.id === routineId ? { ...r, items: [...r.items, item] } : r
          ),
        }));
      },

      removeRoutineItem: (routineId, itemId) => {
        set((state) => ({
          routines: state.routines.map((r) =>
            r.id === routineId
              ? { ...r, items: r.items.filter((i) => i.id !== itemId) }
              : r
          ),
        }));
      },

      reorderItems: (routineId, items) => {
        set((state) => ({
          routines: state.routines.map((r) =>
            r.id === routineId ? { ...r, items } : r
          ),
        }));
      },

      setCompanion: (companion) => set({ companion }),

      feedCompanion: (amount) => {
        const { companion } = get();
        if (!companion) return;
        const newHappiness = Math.min(100, companion.happiness + amount);
        const newExp = companion.totalExp + amount;

        // 성장 단계 업데이트
        let newStage = companion.growthStage;
        const thresholds = [0, 100, 300, 600, 1000];
        for (let i = 4; i >= 0; i--) {
          if (newExp >= thresholds[i]) {
            newStage = i as 0 | 1 | 2 | 3 | 4;
            break;
          }
        }

        set({
          companion: {
            ...companion,
            happiness: newHappiness,
            totalExp: newExp,
            growthStage: newStage,
            lastUpdated: new Date().toISOString(),
          },
        });
      },

      addPoints: (amount) => {
        set((state) => ({
          points: {
            ...state.points,
            totalPoints: state.points.totalPoints + amount,
          },
        }));
      },

      resetDailyProgress: () => {
        // 자정에 호출: 완료 항목 초기화 (스트릭은 유지)
        set({ completedItemIds: {}, fullyCompletedToday: {} });
        // 펫 행복도 자연 감소
        const { companion } = get();
        if (companion) {
          set({
            companion: {
              ...companion,
              happiness: Math.max(0, companion.happiness - 5),
              hunger: Math.max(0, companion.hunger - 10),
            },
          });
        }
      },
    }),
    {
      name: 'kid-routine-store',
      partialize: (state) => ({
        routines: state.routines,
        completedItemIds: state.completedItemIds,
        points: state.points,
        companion: state.companion,
        fullyCompletedToday: state.fullyCompletedToday,
      }),
    }
  )
);
