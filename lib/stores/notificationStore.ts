/**
 * 알림 전역 상태 (메시지 → 알림)
 * 비개발자: 자녀 미션 완료·시스템·칭찬 알림을 저장하고, 읽음 처리·클릭해서 삭제할 수 있어요.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type NotificationType = 'child_mission' | 'system' | 'praise'

export interface Notification {
  id: string
  fromName: string
  fromEmoji: string
  content: string
  timestamp: string
  isRead: boolean
  type: NotificationType
  childProfileId?: string
  /** 마일스톤 확인 알림일 때: 부모가 "확인" 시 달성 처리 + 펫 먹이 지급에 사용 */
  milestoneId?: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  addNotification: (
    n: Omit<Notification, 'id' | 'timestamp' | 'isRead'>
  ) => void
  markRead: (id: string) => void
  deleteNotification: (id: string) => void
  markAllRead: () => void
  /** 전체 알림 삭제 — '알림 모두 확인' 버튼으로 목록을 비울 때 사용 */
  clearAllNotifications: () => void
}

/** 알림 초기값: 임시 데이터 없이 빈 배열. 실제 알림은 자녀가 루틴 완료 시 추가됨 */
export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (data) =>
        set((s) => ({
          notifications: [
            {
              ...data,
              id: crypto.randomUUID(),
              timestamp: new Date().toISOString(),
              isRead: false,
            },
            ...s.notifications,
          ],
          unreadCount: s.unreadCount + 1,
        })),

      markRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, s.unreadCount - 1),
        })),

      deleteNotification: (id) =>
        set((s) => {
          const target = s.notifications.find((n) => n.id === id)
          return {
            notifications: s.notifications.filter((n) => n.id !== id),
            unreadCount:
              target && !target.isRead
                ? Math.max(0, s.unreadCount - 1)
                : s.unreadCount,
          }
        }),

      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        })),

      /** 전체 알림을 목록에서 제거 (알림 모두 확인 시 화면에서 사라지게) */
      clearAllNotifications: () =>
        set({ notifications: [], unreadCount: 0 }),
    }),
    {
      name: 'rhymia-notifications',
      version: 1,
      migrate: (persisted: unknown) => {
        const raw = persisted as { notifications?: Notification[]; unreadCount?: number } | undefined
        const prev = Array.isArray(raw?.notifications) ? raw.notifications : []
        const list = prev.filter((n) => n.id !== '1' && n.id !== '2')
        const unread = list.filter((n) => !n.isRead).length
        return { notifications: list, unreadCount: raw?.unreadCount ?? unread }
      },
    }
  )
)
