/**
 * 칭찬 스티커 전역 상태 — 프로필별로 분리
 * 비개발자: 자녀(프로필)마다 스티커함·지도 위치·체크포인트가 따로 저장돼요. 아린이 스티커와 정원이 스티커가 섞이지 않아요.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Sticker, StickerEmoji } from '@/types/sticker'

/** 한 프로필(자녀)당 스티커 상태 */
interface StickerProfileState {
  inbox: Sticker[]
  placed: Sticker[]
  currentMapPosition: number
  achievedCheckpoints: number[]
}

function defaultProfileState(): StickerProfileState {
  return {
    inbox: [],
    placed: [],
    currentMapPosition: 0,
    achievedCheckpoints: [],
  }
}

interface StickerState {
  /** 프로필 ID별 스티커 상태 */
  byProfile: Record<string, StickerProfileState>

  giveSticker: (profileId: string, emoji: StickerEmoji, fromName: string, label?: string) => void
  placeSticker: (profileId: string, stickerId: string) => void
  getUnplacedCount: (profileId: string) => number
  /** 해당 프로필의 스티커 상태 반환 (페이지/컴포넌트에서 사용) */
  getStateForProfile: (profileId: string) => StickerProfileState
}

export const useStickerStore = create<StickerState>()(
  persist(
    (set, get) => ({
      byProfile: {},

      giveSticker: (profileId, emoji, fromName, label) => {
        const newSticker: Sticker = {
          id: crypto.randomUUID(),
          emoji,
          label: label ?? '칭찬 스티커',
          fromName,
          receivedAt: new Date().toISOString(),
          isPlaced: false,
        }
        set((s) => {
          const current = s.byProfile[profileId] ?? defaultProfileState()
          return {
            byProfile: {
              ...s.byProfile,
              [profileId]: {
                ...current,
                inbox: [...current.inbox, newSticker],
              },
            },
          }
        })
      },

      placeSticker: (profileId, stickerId) => {
        const s = get()
        const current = s.byProfile[profileId] ?? defaultProfileState()
        const { inbox, placed, currentMapPosition, achievedCheckpoints } = current
        const sticker = inbox.find((st) => st.id === stickerId)
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

        set((state) => ({
          byProfile: {
            ...state.byProfile,
            [profileId]: {
              ...(state.byProfile[profileId] ?? defaultProfileState()),
              inbox: inbox.filter((st) => st.id !== stickerId),
              placed: [...placed, updatedSticker],
              currentMapPosition: newPos,
              achievedCheckpoints: newCheckpoints,
            },
          },
        }))
      },

      getUnplacedCount: (profileId) => {
        const current = get().byProfile[profileId] ?? defaultProfileState()
        return current.inbox.length
      },

      getStateForProfile: (profileId) => {
        return get().byProfile[profileId] ?? defaultProfileState()
      },
    }),
    { name: 'rhymia-stickers' }
  )
)
