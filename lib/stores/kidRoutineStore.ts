/**
 * 아이(Kid) 루틴 전용 전역 상태 저장소 (프로필별 분리)
 * 비개발자: 프로필마다 루틴·완료 기록·포인트가 따로 저장되고, 지금 선택된 프로필 것만 보여줍니다.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { RoutineTemplate, RoutineLog, RewardPoints, POINT_RULES, type RoutineItem } from '@/types/routine'
import { ALL_DEFAULT_KID_ROUTINES, ROUTINE_IMAGES, LABEL_TO_IMAGE_KEY } from '@/lib/utils/defaultRoutines'
import type { ProfileRole } from '@/types/profile'
import { usePetStore } from '@/lib/stores/petStore'

/** 탭 키 (프로필 기반 페이지에서 아침/저녁/주말 구분용) */
export type RoutineTabType = 'morning' | 'evening' | 'weekend'

/** 프로필 하나의 루틴 데이터 (프로필별로 따로 저장) */
export interface ProfileRoutineData {
  routines: RoutineTemplate[]
  logs: RoutineLog[]
  rewardPoints: RewardPoints
  rewardShownDates: string[]
  wakeAlarmTime: string
  alarmEnabled: boolean
  lastAlarmDismissedDate: string | null
}

/** 프로필별 훅이 반환하는 완료 현황 */
export interface CompletedItemIdsByTab {
  morning: string[]
  evening: string[]
  weekend: string[]
}

/** 프로필별 훅이 반환하는 포인트 정보 */
export interface KidPoints {
  totalPoints: number
  streakDays: number
}

/** 프로필별 훅 반환 타입 */
export interface UseKidRoutineForProfileReturn {
  routines: RoutineTemplate[]
  setRoutines: (templates: RoutineTemplate[]) => void
  completedItemIds: CompletedItemIdsByTab
  fullyCompletedToday: Record<RoutineTabType, boolean>
  points: KidPoints
  companion: import('@/types/routine').VirtualCompanion | null
  setCompanion: (c: import('@/types/routine').VirtualCompanion | null) => void
  completeItem: (routineId: string, itemId: string) => void
}

const defaultRewardPoints: RewardPoints = {
  userId: 'local-kid',
  totalPoints: 0,
  streakDays: 0,
  lastCompletedDate: null,
}

function defaultProfileData(): ProfileRoutineData {
  return {
    routines: [],
    logs: [],
    rewardPoints: { ...defaultRewardPoints },
    rewardShownDates: [],
    wakeAlarmTime: '07:00',
    alarmEnabled: true,
    lastAlarmDismissedDate: null,
  }
}

/** 아이 루틴 상태 (프로필별 데이터 + 현재 프로필 + 세션) */
interface KidRoutineState {
  currentProfileId: string | null
  byProfile: Record<string, ProfileRoutineData>
  activeRoutineId: string | null
  sessionCompletedItems: string[]
  pendingConfirmItems: string[]

  setCurrentProfileId: (id: string | null) => void
  /** 역할 없으면 미취학 기본 루틴, child_school이면 학령기 기본 루틴 사용 */
  initRoutines: (role?: ProfileRole) => void
  setActiveRoutine: (routineId: string) => void
  completeItem: (itemId: string) => void
  completeItemForRoutine: (routineId: string, itemId: string) => void
  setRoutines: (templates: RoutineTemplate[], forProfileId?: string) => void
  requestConfirm: (itemId: string) => void
  parentApprove: (itemId: string) => void
  parentApproveForRoutine: (routineId: string, itemId: string) => void
  parentReject: (itemId: string) => void
  resetSession: () => void
  markRewardShown: (routineId: string) => void
  hasShownReward: (routineId: string) => boolean
  confirmRoutineComplete: () => void
  addPoints: (points: number) => void
  getTodayLog: (routineId: string) => RoutineLog | undefined
  getTodayLogForProfile: (profileId: string, routineId: string) => RoutineLog | undefined
  getActiveRoutine: () => RoutineTemplate | undefined
  getCompletionRate: (routineId: string) => number
  getCompletionRateForProfile: (profileId: string, routineId: string) => number
  applyTimerSettings: (timers: Record<string, number>) => void
  checkAndReset: () => void
  setWakeAlarmTime: (time: string) => void
  setAlarmEnabled: (enabled: boolean) => void
  dismissAlarm: () => void
}

const today = () => new Date().toISOString().split('T')[0]

function patchItemImage(item: RoutineItem): RoutineItem {
  const trimLabel = item.label?.trim() ?? ''
  const keyFromLabel = trimLabel ? LABEL_TO_IMAGE_KEY[trimLabel] : undefined
  const imageKey = keyFromLabel ?? item.imageKey
  const imagePath = imageKey ? (ROUTINE_IMAGES[imageKey] ?? null) : (item.imagePath ?? null)
  return { ...item, imageKey, imagePath }
}

export const useKidRoutineStore = create<KidRoutineState>()(
  persist(
    (set, get) => {
      function getProfileData(): ProfileRoutineData | null {
        const pid = get().currentProfileId
        if (!pid) return null
        const by = get().byProfile
        if (!by[pid]) return defaultProfileData()
        return by[pid]
      }

      function setProfileData(updater: (prev: ProfileRoutineData) => ProfileRoutineData) {
        const pid = get().currentProfileId
        if (!pid) return
        const by = { ...get().byProfile }
        by[pid] = updater(by[pid] ?? defaultProfileData())
        set({ byProfile: by })
      }

      return {
        currentProfileId: null,
        byProfile: {},
        activeRoutineId: null,
        sessionCompletedItems: [],
        pendingConfirmItems: [],

        setCurrentProfileId: (id) => {
          set({
            currentProfileId: id,
            activeRoutineId: null,
            sessionCompletedItems: [],
            pendingConfirmItems: [],
          })
        },

        setWakeAlarmTime: (time) => {
          setProfileData((p) => ({ ...p, wakeAlarmTime: time }))
        },
        setAlarmEnabled: (enabled) => {
          setProfileData((p) => ({ ...p, alarmEnabled: enabled }))
        },
        dismissAlarm: () => {
          setProfileData((p) => ({ ...p, lastAlarmDismissedDate: today() }))
        },

        initRoutines: (role) => {
          const pid = get().currentProfileId
          if (!pid) return
          const by = { ...get().byProfile }
          const current = by[pid] ?? defaultProfileData()
          let nextRoutines = current.routines
          const isOldSchoolDefaults =
            nextRoutines.length > 0 &&
            nextRoutines.some((r) => r.id === 'default-school-morning' || r.id === 'default-school-evening')
          // 미취학·학령기 동일한 루틴 보드(카드) 사용. 학령기 전용 수정은 이후 요청 반영.
          if (nextRoutines.length === 0 || (role === 'child_school' && isOldSchoolDefaults)) {
            nextRoutines = ALL_DEFAULT_KID_ROUTINES
          } else {
            nextRoutines = nextRoutines.map((r) => ({
              ...r,
              items: r.items.map((item) => patchItemImage(item)),
            }))
          }
          by[pid] = { ...current, routines: nextRoutines }
          set({ byProfile: by })
        },

        setActiveRoutine: (routineId) => {
          const log = get().getTodayLog(routineId)
          set({
            activeRoutineId: routineId,
            sessionCompletedItems: log?.completedItems ?? [],
          })
        },

        completeItem: (itemId) => {
          const { sessionCompletedItems, activeRoutineId, currentProfileId } = get()
          if (!currentProfileId) return
          if (sessionCompletedItems.includes(itemId)) return

          const data = get().byProfile[currentProfileId] ?? defaultProfileData()
          const routine = data.routines.find((r) => r.id === activeRoutineId)
          const newCompleted = [...sessionCompletedItems, itemId]
          const isFullyCompleted = routine ? newCompleted.length >= routine.items.length : false
          let earnedNow = POINT_RULES.itemComplete
          if (isFullyCompleted) earnedNow += POINT_RULES.allComplete

          const existingLogIdx = data.logs.findIndex((l) => l.routineId === activeRoutineId && l.date === today())
          const newLog: RoutineLog = {
            id: existingLogIdx >= 0 ? data.logs[existingLogIdx].id : crypto.randomUUID(),
            routineId: activeRoutineId ?? '',
            userId: 'local-kid',
            date: today(),
            completedItems: newCompleted,
            isFullyCompleted,
            pointsEarned: (existingLogIdx >= 0 ? data.logs[existingLogIdx].pointsEarned : 0) + earnedNow,
            parentConfirmed: false,
            createdAt: existingLogIdx >= 0 ? data.logs[existingLogIdx].createdAt : new Date().toISOString(),
          }
          const newLogs = [...data.logs]
          if (existingLogIdx >= 0) newLogs[existingLogIdx] = newLog
          else newLogs.push(newLog)

          const rp = data.rewardPoints
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const yesterdayStr = yesterday.toISOString().split('T')[0]
          const isStreak = rp.lastCompletedDate === yesterdayStr || rp.lastCompletedDate === today()
          const newStreak = isFullyCompleted ? (isStreak ? rp.streakDays + 1 : 1) : rp.streakDays

          const by = { ...get().byProfile }
          by[currentProfileId] = {
            ...data,
            logs: newLogs,
            rewardPoints: {
              ...rp,
              totalPoints: rp.totalPoints + earnedNow,
              streakDays: newStreak,
              lastCompletedDate: isFullyCompleted ? today() : rp.lastCompletedDate,
            },
          }
          set({
            byProfile: by,
            sessionCompletedItems: newCompleted,
          })
          // 미션 1개 완료 시 펫 먹이 1개 적립 (캐릭터 성장용)
          usePetStore.getState().addFood(1)
        },

        completeItemForRoutine: (routineId, itemId) => {
          const pid = get().currentProfileId
          if (!pid) return
          const data = get().byProfile[pid] ?? defaultProfileData()
          const todayLog = data.logs.find((l) => l.routineId === routineId && l.date === today())
          const currentCompleted = todayLog?.completedItems ?? []
          if (currentCompleted.includes(itemId)) return

          const routine = data.routines.find((r) => r.id === routineId)
          const newCompleted = [...currentCompleted, itemId]
          const isFullyCompleted = routine ? newCompleted.length >= routine.items.length : false
          let earnedNow = POINT_RULES.itemComplete
          if (isFullyCompleted) earnedNow += POINT_RULES.allComplete

          const existingLogIdx = data.logs.findIndex((l) => l.routineId === routineId && l.date === today())
          const newLog: RoutineLog = {
            id: existingLogIdx >= 0 ? data.logs[existingLogIdx].id : crypto.randomUUID(),
            routineId,
            userId: 'local-kid',
            date: today(),
            completedItems: newCompleted,
            isFullyCompleted,
            pointsEarned: (existingLogIdx >= 0 ? data.logs[existingLogIdx].pointsEarned : 0) + earnedNow,
            parentConfirmed: false,
            createdAt: existingLogIdx >= 0 ? data.logs[existingLogIdx].createdAt : new Date().toISOString(),
          }
          const newLogs = [...data.logs]
          if (existingLogIdx >= 0) newLogs[existingLogIdx] = newLog
          else newLogs.push(newLog)

          const rp = data.rewardPoints
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const yesterdayStr = yesterday.toISOString().split('T')[0]
          const isStreak = rp.lastCompletedDate === yesterdayStr || rp.lastCompletedDate === today()
          const newStreak = isFullyCompleted ? (isStreak ? rp.streakDays + 1 : 1) : rp.streakDays

          const by = { ...get().byProfile }
          by[pid] = {
            ...data,
            logs: newLogs,
            rewardPoints: {
              ...rp,
              totalPoints: rp.totalPoints + earnedNow,
              streakDays: newStreak,
              lastCompletedDate: isFullyCompleted ? today() : rp.lastCompletedDate,
            },
          }
          set({ byProfile: by })
          // 미션 1개 완료 시 펫 먹이 1개 적립 (캐릭터 성장용)
          usePetStore.getState().addFood(1)
        },

        setRoutines: (templates, forProfileId) => {
          const pid = forProfileId ?? get().currentProfileId
          if (!pid) return
          const by = { ...get().byProfile }
          const current = by[pid] ?? defaultProfileData()
          by[pid] = { ...current, routines: templates }
          set({ byProfile: by })
        },

        requestConfirm: (itemId) => {
          const { pendingConfirmItems } = get()
          if (pendingConfirmItems.includes(itemId)) return
          set({ pendingConfirmItems: [...pendingConfirmItems, itemId] })
        },

        parentApprove: (itemId) => {
          const { pendingConfirmItems } = get()
          get().completeItem(itemId)
          set({ pendingConfirmItems: pendingConfirmItems.filter((id) => id !== itemId) })
        },

        /** 부모 대시보드용: 루틴을 지정해 항목 승인 (activeRoutineId 없을 때 사용) */
        parentApproveForRoutine: (routineId, itemId) => {
          const { pendingConfirmItems } = get()
          get().completeItemForRoutine(routineId, itemId)
          set({ pendingConfirmItems: pendingConfirmItems.filter((id) => id !== itemId) })
        },

        parentReject: (itemId) => {
          set((s) => ({ pendingConfirmItems: s.pendingConfirmItems.filter((id) => id !== itemId) }))
        },

        resetSession: () => set({ activeRoutineId: null, sessionCompletedItems: [], pendingConfirmItems: [] }),

        markRewardShown: (routineId) => {
          const pid = get().currentProfileId
          if (!pid) return
          const key = `${routineId}_${today()}`
          const by = { ...get().byProfile }
          const current = by[pid] ?? defaultProfileData()
          if (!current.rewardShownDates.includes(key)) {
            by[pid] = { ...current, rewardShownDates: [...current.rewardShownDates, key] }
            set({ byProfile: by })
          }
        },

        hasShownReward: (routineId) => {
          const data = getProfileData()
          if (!data) return false
          const key = `${routineId}_${today()}`
          return data.rewardShownDates.includes(key)
        },

        confirmRoutineComplete: () => {
          const pid = get().currentProfileId
          const { activeRoutineId } = get()
          if (!pid || !activeRoutineId) return
          const by = { ...get().byProfile }
          const data = by[pid] ?? defaultProfileData()
          const idx = data.logs.findIndex((l) => l.routineId === activeRoutineId && l.date === today())
          if (idx < 0) return
          const newLogs = [...data.logs]
          newLogs[idx] = { ...newLogs[idx], parentConfirmed: true }
          by[pid] = { ...data, logs: newLogs }
          set({ byProfile: by })
        },

        addPoints: (points) => {
          setProfileData((p) => ({
            ...p,
            rewardPoints: { ...p.rewardPoints, totalPoints: p.rewardPoints.totalPoints + points },
          }))
        },

        getTodayLog: (routineId) => {
          const data = getProfileData()
          if (!data) return undefined
          return data.logs.find((l) => l.routineId === routineId && l.date === today())
        },

        getTodayLogForProfile: (profileId, routineId) => {
          const data = get().byProfile[profileId] ?? defaultProfileData()
          return data.logs.find((l) => l.routineId === routineId && l.date === today())
        },

        getActiveRoutine: () => {
          const data = getProfileData()
          const { activeRoutineId } = get()
          if (!data || !activeRoutineId) return undefined
          return data.routines.find((r) => r.id === activeRoutineId)
        },

        getCompletionRate: (routineId) => {
          const data = getProfileData()
          if (!data) return 0
          const routine = data.routines.find((r) => r.id === routineId)
          const log = data.logs.find((l) => l.routineId === routineId && l.date === today())
          if (!routine || routine.items.length === 0) return 0
          return (log?.completedItems.length ?? 0) / routine.items.length
        },

        getCompletionRateForProfile: (profileId, routineId) => {
          const data = get().byProfile[profileId] ?? defaultProfileData()
          const routine = data.routines.find((r) => r.id === routineId)
          const log = data.logs.find((l) => l.routineId === routineId && l.date === today())
          if (!routine || routine.items.length === 0) return 0
          return (log?.completedItems.length ?? 0) / routine.items.length
        },

        applyTimerSettings: (timers) => {
          const pid = get().currentProfileId
          if (!pid) return
          const by = { ...get().byProfile }
          const current = by[pid] ?? defaultProfileData()
          by[pid] = {
            ...current,
            routines: current.routines.map((routine) => ({
              ...routine,
              items: routine.items.map((item) => {
                const sec = timers[item.id] ?? 0
                return {
                  ...item,
                  timerEnabled: sec > 0,
                  timerSeconds: sec > 0 ? sec : item.timerSeconds,
                }
              }),
            })),
          }
          set({ byProfile: by })
        },

        checkAndReset: () => set({ activeRoutineId: null, sessionCompletedItems: [], pendingConfirmItems: [] }),
      }
    },
    {
      name: 'rhymia-kid-routine',
      // persist에는 byProfile, currentProfileId만 저장하고 나머지는 rehydrate 시 기본값 사용
      partialize: (state) =>
        ({ byProfile: state.byProfile, currentProfileId: state.currentProfileId }) as KidRoutineState,
      migrate: (persisted: unknown) => {
        const raw = persisted as Record<string, unknown> | undefined
        if (!raw) return { byProfile: {}, currentProfileId: null, activeRoutineId: null, sessionCompletedItems: [], pendingConfirmItems: [] } as unknown as KidRoutineState
        if (Array.isArray(raw.routines)) {
          const legacy: ProfileRoutineData = {
            routines: raw.routines as RoutineTemplate[],
            logs: (raw.logs as RoutineLog[]) ?? [],
            rewardPoints: (raw.rewardPoints as RewardPoints) ?? defaultRewardPoints,
            rewardShownDates: (raw.rewardShownDates as string[]) ?? [],
            wakeAlarmTime: (raw.wakeAlarmTime as string) ?? '07:00',
            alarmEnabled: raw.alarmEnabled !== false,
            lastAlarmDismissedDate: (raw.lastAlarmDismissedDate as string | null) ?? null,
          }
          return {
            byProfile: { default: legacy },
            currentProfileId: 'default',
            activeRoutineId: null,
            sessionCompletedItems: [],
            pendingConfirmItems: [],
          } as unknown as KidRoutineState
        }
        return {
          ...raw,
          activeRoutineId: null,
          sessionCompletedItems: [],
          pendingConfirmItems: [],
        } as unknown as KidRoutineState
      },
      version: 1,
    }
  )
)

/** 현재 프로필의 routines (선택자) */
export function selectRoutines(state: KidRoutineState): RoutineTemplate[] {
  const pid = state.currentProfileId
  if (!pid || !state.byProfile[pid]) return []
  return state.byProfile[pid].routines
}

export function selectRewardPoints(state: KidRoutineState): RewardPoints {
  const pid = state.currentProfileId
  if (!pid || !state.byProfile[pid]) return defaultRewardPoints
  return state.byProfile[pid].rewardPoints
}

export function selectWakeAlarmTime(state: KidRoutineState): string {
  const pid = state.currentProfileId
  if (!pid || !state.byProfile[pid]) return '07:00'
  return state.byProfile[pid].wakeAlarmTime
}

export function selectAlarmEnabled(state: KidRoutineState): boolean {
  const pid = state.currentProfileId
  if (!pid || !state.byProfile[pid]) return true
  return state.byProfile[pid].alarmEnabled
}

export function selectLastAlarmDismissedDate(state: KidRoutineState): string | null {
  const pid = state.currentProfileId
  if (!pid || !state.byProfile[pid]) return null
  return state.byProfile[pid].lastAlarmDismissedDate
}

/**
 * 프로필별 아이 루틴 API (지정한 profileId 또는 현재 프로필 기준)
 */
export function useKidRoutineForProfile(profileId: string | undefined): UseKidRoutineForProfileReturn {
  const setCurrentProfileId = useKidRoutineStore((s) => s.setCurrentProfileId)
  const routines = useKidRoutineStore((s) => {
    const id = profileId ?? s.currentProfileId
    return id ? (s.byProfile[id]?.routines ?? []) : []
  })
  const getTodayLogForProfile = useKidRoutineStore((s) => s.getTodayLogForProfile)
  const getTodayLog = useKidRoutineStore((s) => s.getTodayLog)
  const setRoutinesRaw = useKidRoutineStore((s) => s.setRoutines)
  const setRoutines = (templates: RoutineTemplate[]) => setRoutinesRaw(templates, profileId ?? undefined)
  const completeItemForRoutine = useKidRoutineStore((s) => s.completeItemForRoutine)
  const rewardPoints = useKidRoutineStore((s) => {
    const id = profileId ?? s.currentProfileId
    return id && s.byProfile[id] ? s.byProfile[id].rewardPoints : defaultRewardPoints
  })

  const getLog = (rid: string) =>
    profileId ? getTodayLogForProfile(profileId, rid) : getTodayLog(rid)

  const completedItemIds: CompletedItemIdsByTab = {
    morning: getLog('default-kid-morning')?.completedItems ?? [],
    evening: getLog('default-kid-evening')?.completedItems ?? [],
    weekend: getLog('weekend')?.completedItems ?? [],
  }
  const fullyCompletedToday: Record<RoutineTabType, boolean> = {
    morning: getLog('default-kid-morning')?.isFullyCompleted ?? false,
    evening: getLog('default-kid-evening')?.isFullyCompleted ?? false,
    weekend: getLog('weekend')?.isFullyCompleted ?? false,
  }
  const points: KidPoints = {
    totalPoints: rewardPoints.totalPoints,
    streakDays: rewardPoints.streakDays,
  }

  return {
    routines,
    setRoutines,
    completedItemIds,
    fullyCompletedToday,
    points,
    companion: null,
    setCompanion: () => {},
    completeItem: completeItemForRoutine,
  }
}
