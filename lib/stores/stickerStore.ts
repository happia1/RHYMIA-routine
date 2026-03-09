/**
 * 칭찬 스티커 전역 상태 — 스티커함·지도 배치·체크포인트
 * 비개발자: 엄마가 스티커를 주면 아이 스티커함에 쌓이고, 아이가 지도에서 다음 칸을 눌러 스티커를 붙이면 한 칸씩 진행해요. 5·10·15·19칸은 체크포인트예요.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Sticker, StickerEmoji } from '@/types/sticker'

interface StickerState {
  inbox: Sticker[]
  placed: Sticker[]
  currentMapPosition: number
  achievedCheckpoints: number[]

  giveSticker: (emoji: StickerEmoji, fromName: string, label?: string) => void
  placeSticker: (stickerId: string) => void
  getUnplacedCount: () => number
}

export const useStickerStore = create<StickerState>()(
  persist(
    (set, get) => ({
      inbox: [],
      placed: [],
      currentMapPosition: 0,
      achievedCheckpoints: [],

      giveSticker: (emoji, fromName, label) => {
        const newSticker: Sticker = {
          id: crypto.randomUUID(),
          emoji,
          label: label ?? '칭찬 스티커',
          fromName,
          receivedAt: new Date().toISOString(),
          isPlaced: false,
        }
        set((s) => ({ inbox: [...s.inbox, newSticker] }))
      },

      placeSticker: (stickerId) => {
        const { inbox, placed, currentMapPosition, achievedCheckpoints } =
          get()
        const sticker = inbox.find((s) => s.id === stickerId)
        if (!sticker) return

        const newPos = Math.min(19, currentMapPosition + 1)
        const updatedSticker: Sticker = {
          ...sticker,
          isPlaced: true,
          mapPosition: newPos,
        }

        const isCheckpoint = [5, 10, 15, 19].includes(newPos)
        const newCheckpoints =
          isCheckpoint && !achievedCheckpoints.includes(newPos)
            ? [...achievedCheckpoints, newPos]
            : achievedCheckpoints

        set({
          inbox: inbox.filter((s) => s.id !== stickerId),
          placed: [...placed, updatedSticker],
          currentMapPosition: newPos,
          achievedCheckpoints: newCheckpoints,
        })
      },

      getUnplacedCount: () => get().inbox.length,
    }),
    { name: 'rhymia-stickers' }
  )
)
