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
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [
        {
          id: '1',
          fromName: '아린',
          fromEmoji: '🧒',
          content: '양치하기 완료했어요! 확인해주세요 🦷',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          isRead: false,
          type: 'child_mission',
          childProfileId: 'child-1',
        },
        {
          id: '2',
          fromName: 'RHYMIA',
          fromEmoji: '🤖',
          content: '아린이 오늘 아침 루틴 3/6 완료했어요!',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          isRead: false,
          type: 'system',
        },
      ],
      unreadCount: 2,

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
    }),
    { name: 'rhymia-notifications' }
  )
)
