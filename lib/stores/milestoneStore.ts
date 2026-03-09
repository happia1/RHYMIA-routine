/**
 * 마일스톤(도장깨기) 전역 상태 — 기본·커스텀 미션, 달성 처리
 * 비개발자: 미취학/학령기 기본 마일스톤 목록과 엄마가 추가한 특별 미션을 저장하고, 달성하면 스티커를 받아요.
 * 자녀별로 마일스톤 목록을 관리하며(byProfile), 부모가 "칭찬 스티커 주기"에서 풀에서 골라 추가할 수 있어요.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Milestone {
  id: string
  title: string
  description: string
  imagePath: string | null
  imageKey: string
  category: 'self-care' | 'home' | 'learning' | 'social' | 'custom'
  targetAge: 'preschool' | 'school' | 'both'
  isAchieved: boolean
  achievedAt?: string
  isCustom: boolean
  stickerEmoji?: string
}

/** 풀에서 하나를 골라 추가할 때 쓰는 템플릿 타입 (id·달성 여부 없음) */
export type MilestoneTemplate = Omit<
  Milestone,
  'id' | 'isAchieved' | 'achievedAt' | 'isCustom'
>

export const DEFAULT_PRESCHOOL_MILESTONES: Omit<
  Milestone,
  'id' | 'isAchieved' | 'achievedAt' | 'isCustom'
>[] = [
  {
    title: '혼자 양치했어요',
    description: '치약 짜고 2분 양치 스스로!',
    imagePath: '/milestone-icons/self-brush.png',
    imageKey: 'self-brush',
    category: 'self-care',
    targetAge: 'preschool',
    stickerEmoji: '⭐',
  },
  {
    title: '단추를 잠갔어요',
    description: '혼자서 단추를 끼웠어요',
    imagePath: '/milestone-icons/button.png',
    imageKey: 'button',
    category: 'self-care',
    targetAge: 'preschool',
    stickerEmoji: '💫',
  },
  {
    title: '신발을 신었어요',
    description: '혼자서 신발을 신고 끈을 맸어요',
    imagePath: '/milestone-icons/shoes.png',
    imageKey: 'shoes',
    category: 'self-care',
    targetAge: 'preschool',
    stickerEmoji: '⭐',
  },
  {
    title: '손을 깨끗이 씻었어요',
    description: '비누로 30초 손씻기',
    imagePath: '/milestone-icons/handwash.png',
    imageKey: 'handwash',
    category: 'self-care',
    targetAge: 'both',
    stickerEmoji: '⭐',
  },
  {
    title: '이불을 개었어요',
    description: '일어나서 이불을 혼자 개었어요',
    imagePath: '/milestone-icons/make-bed-ms.png',
    imageKey: 'make-bed-ms',
    category: 'self-care',
    targetAge: 'preschool',
    stickerEmoji: '🌟',
  },
  {
    title: '식탁 정리를 도왔어요',
    description: '밥 먹고 수저를 치웠어요',
    imagePath: '/milestone-icons/table-clean.png',
    imageKey: 'table-clean',
    category: 'home',
    targetAge: 'both',
    stickerEmoji: '🌟',
  },
  {
    title: '식사 준비를 도왔어요',
    description: '수저 놓기, 물 따르기를 도왔어요',
    imagePath: '/milestone-icons/meal-help.png',
    imageKey: 'meal-help',
    category: 'home',
    targetAge: 'both',
    stickerEmoji: '🌟',
  },
  {
    title: '장난감을 정리했어요',
    description: '놀고 난 뒤 스스로 정리했어요',
    imagePath: '/milestone-icons/tidy-toys.png',
    imageKey: 'tidy-toys',
    category: 'home',
    targetAge: 'preschool',
    stickerEmoji: '⭐',
  },
  {
    title: '쓰레기를 버렸어요',
    description: '쓰레기를 제자리에 버렸어요',
    imagePath: '/milestone-icons/trash.png',
    imageKey: 'trash',
    category: 'home',
    targetAge: 'both',
    stickerEmoji: '⭐',
  },
  {
    title: '빨래 개기를 도왔어요',
    description: '수건이나 양말을 개었어요',
    imagePath: '/milestone-icons/laundry.png',
    imageKey: 'laundry',
    category: 'home',
    targetAge: 'both',
    stickerEmoji: '💫',
  },
  {
    title: '책을 3권 읽었어요',
    description: '스스로 그림책 3권을 읽었어요',
    imagePath: '/milestone-icons/book3.png',
    imageKey: 'book3',
    category: 'learning',
    targetAge: 'preschool',
    stickerEmoji: '🌟',
  },
  {
    title: '책을 10권 읽었어요',
    description: '혼자서 책 10권 달성!',
    imagePath: '/milestone-icons/book10.png',
    imageKey: 'book10',
    category: 'learning',
    targetAge: 'both',
    stickerEmoji: '🏆',
  },
  {
    title: '숫자를 1~10 셌어요',
    description: '손가락으로 숫자 세기 성공',
    imagePath: '/milestone-icons/count10.png',
    imageKey: 'count10',
    category: 'learning',
    targetAge: 'preschool',
    stickerEmoji: '⭐',
  },
  {
    title: '내 이름을 썼어요',
    description: '연필로 내 이름을 혼자 썼어요',
    imagePath: '/milestone-icons/write-name.png',
    imageKey: 'write-name',
    category: 'learning',
    targetAge: 'preschool',
    stickerEmoji: '🌟',
  },
  {
    title: '일기를 썼어요',
    description: '오늘 하루를 일기로 남겼어요',
    imagePath: '/milestone-icons/diary.png',
    imageKey: 'diary',
    category: 'learning',
    targetAge: 'school',
    stickerEmoji: '🌟',
  },
  {
    title: '먼저 인사했어요',
    description: '어른께 먼저 인사를 했어요',
    imagePath: '/milestone-icons/greet.png',
    imageKey: 'greet',
    category: 'social',
    targetAge: 'both',
    stickerEmoji: '❤️',
  },
  {
    title: '친구와 사이좋게 놀았어요',
    description: '양보하고 나누며 놀았어요',
    imagePath: '/milestone-icons/friends.png',
    imageKey: 'friends',
    category: 'social',
    targetAge: 'preschool',
    stickerEmoji: '❤️',
  },
  {
    title: '감사 인사를 했어요',
    description: '"감사합니다"를 스스로 말했어요',
    imagePath: '/milestone-icons/thankyou.png',
    imageKey: 'thankyou',
    category: 'social',
    targetAge: 'both',
    stickerEmoji: '❤️',
  },
]

export const DEFAULT_SCHOOL_MILESTONES: Omit<
  Milestone,
  'id' | 'isAchieved' | 'achievedAt' | 'isCustom'
>[] = [
  {
    title: '숙제를 스스로 했어요',
    description: '도움 없이 혼자 숙제 완료!',
    imagePath: '/milestone-icons/homework-ms.png',
    imageKey: 'homework-ms',
    category: 'learning',
    targetAge: 'school',
    stickerEmoji: '🌟',
  },
  {
    title: '30분 공부했어요',
    description: '집중해서 30분 공부했어요',
    imagePath: '/milestone-icons/study30.png',
    imageKey: 'study30',
    category: 'learning',
    targetAge: 'school',
    stickerEmoji: '⭐',
  },
  {
    title: '책을 20권 읽었어요',
    description: '책 20권 독서 달성!',
    imagePath: '/milestone-icons/book20.png',
    imageKey: 'book20',
    category: 'learning',
    targetAge: 'school',
    stickerEmoji: '🏆',
  },
  {
    title: '혼자 학교에 갔어요',
    description: '혼자 등교 성공!',
    imagePath: '/milestone-icons/school-alone.png',
    imageKey: 'school-alone',
    category: 'social',
    targetAge: 'school',
    stickerEmoji: '🎖️',
  },
]

interface MilestoneState {
  /** 레거시: 프로필 지정 없을 때 쓰는 단일 목록 */
  milestones: Milestone[]
  /** 자녀(프로필)별 마일스톤 목록 — 부모가 풀에서 추가한 것 + 커스텀 */
  byProfile: Record<string, Milestone[]>

  getMilestones: (profileId: string | null) => Milestone[]
  initializeMilestones: (profileId: string | null, targetAge: 'preschool' | 'school') => void
  /** 풀에서 마일스톤 하나를 이 자녀 목록에 추가 (이미 있으면 무시) */
  addMilestoneFromPool: (profileId: string, template: MilestoneTemplate) => void
  achieveMilestone: (profileId: string | null, id: string) => void
  addCustomMilestone: (profileId: string | null, data: {
    title: string
    description: string
    imagePath: string | null
    targetAge: 'preschool' | 'school' | 'both'
    stickerEmoji: string
  }) => void
  deleteCustomMilestone: (profileId: string | null, id: string) => void
}

/** 연령대별 마일스톤 풀 (부모가 "추가"할 수 있는 후보 목록). role은 child_preschool | child_school */
export function getPoolForAge(role: 'child_preschool' | 'child_school'): MilestoneTemplate[] {
  const age = role === 'child_school' ? 'school' : 'preschool'
  const defaults =
    age === 'preschool'
      ? DEFAULT_PRESCHOOL_MILESTONES
      : [...DEFAULT_PRESCHOOL_MILESTONES, ...DEFAULT_SCHOOL_MILESTONES]
  return defaults.filter((m) => m.targetAge === age || m.targetAge === 'both')
}

export const useMilestoneStore = create<MilestoneState>()(
  persist(
    (set, get) => ({
      milestones: [],
      byProfile: {},

      getMilestones: (profileId) => {
        if (profileId !== null && profileId !== undefined) {
          const list = get().byProfile[profileId]
          return list ?? []
        }
        return get().milestones
      },

      initializeMilestones: (profileId, targetAge) => {
        if (profileId) {
          const list = get().byProfile[profileId]
          if (list && list.length > 0) return
          const defaults =
            targetAge === 'preschool'
              ? DEFAULT_PRESCHOOL_MILESTONES
              : [...DEFAULT_PRESCHOOL_MILESTONES, ...DEFAULT_SCHOOL_MILESTONES]
          const initialized: Milestone[] = defaults
            .filter((m) => m.targetAge === targetAge || m.targetAge === 'both')
            .map((m) => ({
              ...m,
              id: m.imageKey,
              isAchieved: false,
              isCustom: false,
            }))
          set((s) => ({
            byProfile: { ...s.byProfile, [profileId]: initialized },
          }))
          return
        }
        if (get().milestones.length > 0) return
        const defaults =
          targetAge === 'preschool'
            ? DEFAULT_PRESCHOOL_MILESTONES
            : [...DEFAULT_PRESCHOOL_MILESTONES, ...DEFAULT_SCHOOL_MILESTONES]
        const initialized: Milestone[] = defaults
          .filter((m) => m.targetAge === targetAge || m.targetAge === 'both')
          .map((m) => ({
            ...m,
            id: crypto.randomUUID(),
            isAchieved: false,
            isCustom: false,
          }))
        set({ milestones: initialized })
      },

      addMilestoneFromPool: (profileId, template) => {
        const list = get().byProfile[profileId] ?? []
        if (list.some((m) => m.imageKey === template.imageKey)) return
        const newMilestone: Milestone = {
          ...template,
          id: template.imageKey,
          isAchieved: false,
          isCustom: false,
        }
        set((s) => ({
          byProfile: {
            ...s.byProfile,
            [profileId]: [...(s.byProfile[profileId] ?? []), newMilestone],
          },
        }))
      },

      achieveMilestone: (profileId, id) => {
        const at = new Date().toISOString()
        if (profileId) {
          set((s) => ({
            byProfile: {
              ...s.byProfile,
              [profileId]: (s.byProfile[profileId] ?? []).map((m) =>
                m.id === id ? { ...m, isAchieved: true, achievedAt: at } : m
              ),
            },
          }))
          return
        }
        set((s) => ({
          milestones: s.milestones.map((m) =>
            m.id === id ? { ...m, isAchieved: true, achievedAt: at } : m
          ),
        }))
      },

      addCustomMilestone: (profileId, data) => {
        const newMilestone: Milestone = {
          ...data,
          id: crypto.randomUUID(),
          imageKey: 'custom',
          category: 'custom',
          isAchieved: false,
          isCustom: true,
        }
        if (profileId) {
          set((s) => ({
            byProfile: {
              ...s.byProfile,
              [profileId]: [...(s.byProfile[profileId] ?? []), newMilestone],
            },
          }))
          return
        }
        set((s) => ({ milestones: [...s.milestones, newMilestone] }))
      },

      deleteCustomMilestone: (profileId, id) => {
        if (profileId) {
          set((s) => ({
            byProfile: {
              ...s.byProfile,
              [profileId]: (s.byProfile[profileId] ?? []).filter((m) => m.id !== id || !m.isCustom),
            },
          }))
          return
        }
        set((s) => ({
          milestones: s.milestones.filter((m) => m.id !== id || !m.isCustom),
        }))
      },
    }),
    { name: 'rhymia-milestones' }
  )
)
