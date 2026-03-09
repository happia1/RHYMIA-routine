/**
 * 메시지 전역 상태 (자녀→부모, 시스템 알림)
 * 비개발자: 부모가 보는 메시지함에 자녀 칭찬·리마인더·시스템 메시지를 저장하고, 읽음 개수를 뱃지로 써요.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Message {
  id: string
  fromName: string
  fromEmoji: string
  content: string
  timestamp: string
  isRead: boolean
  type: 'praise' | 'reminder' | 'system'
}

interface MessageState {
  messages: Message[]
  unreadCount: number
  addMessage: (msg: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => void
  markAllRead: () => void
  markRead: (id: string) => void
}

export const useMessageStore = create<MessageState>()(
  persist(
    (set, get) => ({
      messages: [
        {
          id: '1',
          fromName: '지수',
          fromEmoji: '🧒',
          content: '엄마! 오늘 양치 다 했어요! 🦷',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          isRead: false,
          type: 'praise' as const,
        },
        {
          id: '2',
          fromName: 'RHYMIA',
          fromEmoji: '🤖',
          content: '지수가 오늘 아침 루틴 4/6 완료했어요!',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          isRead: false,
          type: 'system' as const,
        },
      ],
      unreadCount: 2,

      addMessage: (msgData) => {
        const newMsg: Message = {
          ...msgData,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          isRead: false,
        }
        set((s) => ({
          messages: [newMsg, ...s.messages],
          unreadCount: s.unreadCount + 1,
        }))
      },

      markAllRead: () => set((s) => ({
        messages: s.messages.map((m) => ({ ...m, isRead: true })),
        unreadCount: 0,
      })),

      markRead: (id) => set((s) => ({
        messages: s.messages.map((m) => m.id === id ? { ...m, isRead: true } : m),
        unreadCount: Math.max(0, s.unreadCount - 1),
      })),
    }),
    { name: 'rhymia-messages' }
  )
)
