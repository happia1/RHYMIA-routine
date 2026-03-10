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
import { useProfileStore } from '@/lib/stores/profileStore'
import { useNotificationStore } from '@/lib/stores/notificationStore'

/** 탭 키 (프로필 기반 페이지에서 아침/저녁/주말 구분용) */
export type RoutineTabType = 'morning' | 'evening' | 'weekend'

/** 확인 대기 중인 항목 (루틴별·항목별) — 접속해도 유지되도록 프로필에 저장 */
export interface PendingConfirmEntry {
  routineId: string
  itemId: string
}

/** 프로필 하나의 루틴 데이터 (프로필별로 따로 저장) */
export interface ProfileRoutineData {
  routines: RoutineTemplate[]
  logs: RoutineLog[]
  pendingConfirms: PendingConfirmEntry[]
  rewardPoints: RewardPoints
  rewardShownDates: string[]
  wakeAlarmTime: string
  alarmEnabled: boolean
  lastAlarmDismissedDate: string | null
  /** 루틴별로 삭제된 항목 템플릿 (항목 추가 시 다시 넣을 수 있도록) routineId -> RoutineItem[] */
  deletedItemTemplates?: Record<string, RoutineItem[]>
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
    pendingConfirms: [],
    rewardPoints: { ...defaultRewardPoints },
    rewardShownDates: [],
    wakeAlarmTime: '07:00',
    alarmEnabled: true,
    lastAlarmDismissedDate: null,
    deletedItemTemplates: {},
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
  getPendingConfirmItemsForProfile: (profileId: string) => string[]
  applyTimerSettings: (timers: Record<string, number>) => void
  checkAndReset: () => void
  setWakeAlarmTime: (time: string) => void
  /** 지정한 프로필의 기상 알람 시간만 변경 (자녀 프로필 수정 시 사용) */
  setWakeAlarmTimeForProfile: (profileId: string, time: string) => void
  setAlarmEnabled: (enabled: boolean) => void
  dismissAlarm: () => void
  /** 삭제한 항목을 해당 루틴의 "항목 추가" 풀에 넣어서 나중에 다시 추가 가능하게 */
  addDeletedItemTemplate: (profileId: string, routineId: string, item: RoutineItem) => void
  /** 루틴별 삭제 풀에 있는 템플릿 목록 (항목 추가 시트에 표시) */
  getDeletedItemTemplates: (profileId: string, routineId: string) => RoutineItem[]
  /** 항목 추가로 다시 넣었을 때 삭제 풀에서 하나 제거 (같은 라벨) */
  removeDeletedItemTemplate: (profileId: string, routineId: string, label: string) => void
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
        setWakeAlarmTimeForProfile: (profileId, time) => {
          const by = { ...get().byProfile }
          const current = by[profileId] ?? defaultProfileData()
          by[profileId] = { ...current, wakeAlarmTime: time }
          set({ byProfile: by })
        },
        setAlarmEnabled: (enabled) => {
          setProfileData((p) => ({ ...p, alarmEnabled: enabled }))
        },
        dismissAlarm: () => {
          setProfileData((p) => ({ ...p, lastAlarmDismissedDate: today() }))
        },

        addDeletedItemTemplate: (profileId, routineId, item) => {
          const by = { ...get().byProfile }
          const current = by[profileId] ?? defaultProfileData()
          const templates = { ...(current.deletedItemTemplates ?? {}) }
          const list = [...(templates[routineId] ?? [])]
          const template = { ...item, id: '', order: 0 }
          list.push(template)
          templates[routineId] = list
          by[profileId] = { ...current, deletedItemTemplates: templates }
          set({ byProfile: by })
        },

        getDeletedItemTemplates: (profileId, routineId) => {
          const current = get().byProfile[profileId] ?? defaultProfileData()
          return current.deletedItemTemplates?.[routineId] ?? []
        },

        removeDeletedItemTemplate: (profileId, routineId, label) => {
          const by = { ...get().byProfile }
          const current = by[profileId] ?? defaultProfileData()
          const templates = { ...(current.deletedItemTemplates ?? {}) }
          const list = templates[routineId] ?? []
          const idx = list.findIndex((t) => (t.label ?? '').trim() === (label ?? '').trim())
          if (idx >= 0) {
            const next = list.slice(0, idx).concat(list.slice(idx + 1))
            if (next.length) templates[routineId] = next
            else delete templates[routineId]
          }
          by[profileId] = { ...current, deletedItemTemplates: templates }
          set({ byProfile: by })
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
          const pid = get().currentProfileId
          const data = pid ? get().byProfile[pid] ?? defaultProfileData() : defaultProfileData()
          const pendingForRoutine = (data.pendingConfirms ?? [])
            .filter((p) => p.routineId === routineId)
            .map((p) => p.itemId)
          set({
            activeRoutineId: routineId,
            sessionCompletedItems: log?.completedItems ?? [],
            pendingConfirmItems: pendingForRoutine,
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
          // 미션 1개 완료 시 해당 프로필의 펫에게 먹이 1개 적립 (프로필별 분리)
          if (currentProfileId) usePetStore.getState().addFood(currentProfileId, 1)
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
          // 미션 1개 완료 시 해당 프로필의 펫에게 먹이 1개 적립 (프로필별 분리)
          if (pid) usePetStore.getState().addFood(pid, 1)
        },

        setRoutines: (templates, forProfileId) => {
          const pid = forProfileId ?? get().currentProfileId
          if (!pid) return
          const by = { ...get().byProfile }
          const current = by[pid] ?? defaultProfileData()
          by[pid] = { ...current, routines: templates }
          set({ byProfile: by })
        },

        /** 아이가 "했어요" 버튼을 눌렀을 때: 확인 대기를 프로필에 저장(접속해도 유지) + 부모 알림 추가 */
        requestConfirm: (itemId) => {
          const { pendingConfirmItems, currentProfileId, activeRoutineId } = get()
          if (pendingConfirmItems.includes(itemId)) return
          if (!currentProfileId || !activeRoutineId) return

          const by = { ...get().byProfile }
          const current = by[currentProfileId] ?? defaultProfileData()
          const pendingConfirms = [...(current.pendingConfirms ?? []), { routineId: activeRoutineId, itemId }]
          by[currentProfileId] = { ...current, pendingConfirms }
          set({ byProfile: by, pendingConfirmItems: [...pendingConfirmItems, itemId] })

          const routine = get().getActiveRoutine()
          const item = routine?.items.find((i) => i.id === itemId)
          const profile = useProfileStore.getState().getProfile(currentProfileId)
          const childName = profile?.name ?? '우리 아이'
          const childEmoji = profile?.avatarEmoji ?? '🧒'
          useNotificationStore.getState().addNotification({
            fromName: childName,
            fromEmoji: childEmoji,
            content: `${item?.label ?? '미션'} 완료했어요! 확인해주세요`,
            type: 'child_mission',
            childProfileId: currentProfileId,
          })
        },

        parentApprove: (itemId) => {
          const { pendingConfirmItems } = get()
          get().completeItem(itemId)
          set({ pendingConfirmItems: pendingConfirmItems.filter((id) => id !== itemId) })
        },

        /** 부모 대시보드용: 루틴을 지정해 항목 승인 후 완료 로그에 반영 (접속해도 유지) */
        parentApproveForRoutine: (routineId, itemId) => {
          const pid = get().currentProfileId
          if (pid) {
            const by = { ...get().byProfile }
            const current = by[pid] ?? defaultProfileData()
            const pendingConfirms = (current.pendingConfirms ?? []).filter(
              (p) => !(p.routineId === routineId && p.itemId === itemId)
            )
            by[pid] = { ...current, pendingConfirms }
            set({ byProfile: by })
          }
          get().completeItemForRoutine(routineId, itemId)
          set((s) => ({ pendingConfirmItems: s.pendingConfirmItems.filter((id) => id !== itemId) }))
        },

        parentReject: (itemId) => {
          const pid = get().currentProfileId
          if (pid) {
            const by = { ...get().byProfile }
            const current = by[pid] ?? defaultProfileData()
            const pendingConfirms = (current.pendingConfirms ?? []).filter((p) => p.itemId !== itemId)
            by[pid] = { ...current, pendingConfirms }
            set({ byProfile: by })
          }
          set((s) => ({ pendingConfirmItems: s.pendingConfirmItems.filter((id) => id !== itemId) }))
        },

        /** 해당 자녀의 확인 대기 항목 ID 목록 (부모 대시보드에서 persist 데이터로 표시) */
        getPendingConfirmItemsForProfile: (profileId) => {
          const data = get().byProfile[profileId] ?? defaultProfileData()
          return (data.pendingConfirms ?? []).map((p) => p.itemId)
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
            pendingConfirms: [],
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
        const by = (raw.byProfile ?? {}) as Record<string, ProfileRoutineData>
        for (const k of Object.keys(by)) {
          if (by[k] && !Array.isArray(by[k].pendingConfirms)) (by[k] as ProfileRoutineData).pendingConfirms = []
        }
        return {
          ...raw,
          byProfile: by,
          activeRoutineId: null,
          sessionCompletedItems: [],
          pendingConfirmItems: [],
        } as unknown as KidRoutineState
      },
      version: 1,
    }
  )
)

/** getServerSnapshot 무한루프 방지: 빈 배열은 항상 같은 참조 반환 */
const EMPTY_ROUTINES: RoutineTemplate[] = []

/** 확인 대기 항목 배열용 고정 참조 (셀렉터가 새 배열을 반환하지 않도록) */
export const EMPTY_PENDING_ENTRIES: PendingConfirmEntry[] = []

/** 현재 프로필의 routines (선택자) */
export function selectRoutines(state: KidRoutineState): RoutineTemplate[] {
  const pid = state.currentProfileId
  if (!pid || !state.byProfile[pid]) return EMPTY_ROUTINES
  return state.byProfile[pid].routines
}

/** 지정한 프로필(자녀)의 루틴 목록 — 부모 대시보드에서 childId로 조회 시 사용 (다음 접속 시에도 persist된 데이터 그대로 반영) */
export function selectRoutinesForProfile(profileId: string | null) {
  return (state: KidRoutineState): RoutineTemplate[] => {
    if (!profileId || !state.byProfile[profileId]) return EMPTY_ROUTINES
    return state.byProfile[profileId].routines
  }
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
