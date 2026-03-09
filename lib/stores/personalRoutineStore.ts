/**
 * 부모 루틴 전용 스토어 — 자유 시간 슬롯 (24h 도넛 차트)
 * 비개발자: 엄마/아빠가 원하는 시간대에 루틴을 추가하고, 기상/취침은 기본으로 들어가요. 완료 체크와 삭제(고정 제외)가 가능해요.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** 시간대 구간 (홈 카드 등 표시용) */
export type TimeBlock = 'morning' | 'afternoon' | 'evening' | 'night'

/** 시간대별 메타 (라벨, 이모지, 색, 시간 범위) — FamilyParentCard·RoutineTimeSlot에서 사용 */
export const TIME_BLOCK_META: Record<
  TimeBlock,
  { label: string; emoji: string; color: string; hours: [number, number] }
> = {
  morning: { label: '아침', emoji: '☀️', color: '#FFD93D', hours: [6, 12] },
  afternoon: { label: '오후', emoji: '🌤', color: '#A8E6CF', hours: [12, 18] },
  evening: { label: '저녁', emoji: '🌆', color: '#FF8FAB', hours: [18, 22] },
  night: { label: '밤', emoji: '🌙', color: '#B8A9E3', hours: [22, 6] },
}

/** 자유 루틴 슬롯 (시작·종료 시/분, 제목, 상세, 완료 여부, 고정 여부) */
export interface FreeRoutineSlot {
  id: string
  startHour: number
  startMin: number
  endHour: number
  endMin: number
  title: string
  detail: string
  isCompleted: boolean
  /** true면 기상/취침 등 삭제 불가 */
  isFixed: boolean
}

/** 기본값: 기상(07:00) + 취침(23:00) */
const DEFAULT_SLOTS: FreeRoutineSlot[] = [
  {
    id: 'fixed-wake',
    startHour: 7,
    startMin: 0,
    endHour: 8,
    endMin: 0,
    title: '기상 ☀️',
    detail: '하루를 시작해요',
    isCompleted: false,
    isFixed: true,
  },
  {
    id: 'fixed-sleep',
    startHour: 23,
    startMin: 0,
    endHour: 24,
    endMin: 0,
    title: '취침 🌙',
    detail: '오늘도 수고했어요',
    isCompleted: false,
    isFixed: true,
  },
]

interface PersonalRoutineState {
  slots: FreeRoutineSlot[]
  streakDays: number
  addSlot: (
    slot: Omit<FreeRoutineSlot, 'id' | 'isCompleted' | 'isFixed'>
  ) => void
  updateSlot: (id: string, updates: Partial<FreeRoutineSlot>) => void
  deleteSlot: (id: string) => void
  toggleComplete: (id: string) => void
  getSortedSlots: () => FreeRoutineSlot[]
  /** 시간대별 슬롯 (홈 카드용: 아침 6–12, 오후 12–18, 저녁 18–22, 밤 22–6) */
  getSlotsByBlock: (block: TimeBlock) => FreeRoutineSlot[]
}

export const usePersonalRoutineStore = create<PersonalRoutineState>()(
  persist(
    (set, get) => ({
      slots: DEFAULT_SLOTS,
      streakDays: 0,

      addSlot: (slotData) => {
        const newSlot: FreeRoutineSlot = {
          ...slotData,
          id: crypto.randomUUID(),
          isCompleted: false,
          isFixed: false,
        }
        set((s) => ({ slots: [...s.slots, newSlot] }))
      },

      updateSlot: (id, updates) =>
        set((s) => ({
          slots: s.slots.map((sl) =>
            sl.id === id ? { ...sl, ...updates } : sl
          ),
        })),

      deleteSlot: (id) =>
        set((s) => ({
          slots: s.slots.filter((sl) => sl.id !== id || sl.isFixed),
        })),

      toggleComplete: (id) =>
        set((s) => ({
          slots: s.slots.map((sl) =>
            sl.id === id ? { ...sl, isCompleted: !sl.isCompleted } : sl
          ),
        })),

      getSortedSlots: () => {
        return [...get().slots].sort(
          (a, b) =>
            a.startHour * 60 +
            a.startMin -
            (b.startHour * 60 + b.startMin)
        )
      },

      getSlotsByBlock: (block) => {
        const slots = get().slots
        const ranges: Record<TimeBlock, [number, number]> = {
          morning: [6, 12],
          afternoon: [12, 18],
          evening: [18, 22],
          night: [22, 30], // 22~24, 0~6
        }
        const [start, end] = ranges[block]
        return slots.filter((s) => {
          const slotStart = s.startHour + s.startMin / 60
          if (end > 24) {
            return slotStart >= 22 || slotStart < 6
          }
          return slotStart >= start && slotStart < end
        })
      },
    }),
    { name: 'rhymia-personal-routine' }
  )
)
