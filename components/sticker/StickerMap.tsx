'use client'

/**
 * 여행 지도 — 20칸 그리드, 스티커 붙이기, 체크포인트 축하
 * 비개발자: 아이가 받은 스티커를 다음 칸에 붙이면 한 칸씩 진행하고, 5·10·15·19번 칸에 도착하면 축하 화면이 떠요.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MAP_TILES } from '@/types/sticker'
import { useStickerStore } from '@/lib/stores/stickerStore'

/** profileId: 현재 자녀(프로필) ID — 프로필별로 스티커·지도가 분리됨 */
interface StickerMapProps {
  profileId: string
}

export function StickerMap({ profileId }: StickerMapProps) {
  const getStateForProfile = useStickerStore((s) => s.getStateForProfile)
  const placeSticker = useStickerStore((s) => s.placeSticker)
  const { currentMapPosition, placed, inbox } = getStateForProfile(profileId)
  const [showStickerBox, setShowStickerBox] = useState(false)
  const [checkpointCelebration, setCheckpointCelebration] = useState<
    number | null
  >(null)
  const unplaced = inbox.filter((s) => !s.isPlaced)

  const handleTilePress = (pos: number) => {
    if (pos !== currentMapPosition + 1) return
    if (unplaced.length === 0) return
    setShowStickerBox(true)
  }

  const handlePlaceSticker = (stickerId: string) => {
    placeSticker(profileId, stickerId)
    setShowStickerBox(false)
    const newPos = currentMapPosition + 1
    if ([5, 10, 15, 19].includes(newPos)) {
      setTimeout(() => setCheckpointCelebration(newPos), 400)
      setTimeout(() => setCheckpointCelebration(null), 3000)
    }
  }

  const getGridPos = (pos: number) => {
    const row = Math.floor(pos / 4)
    const col = row % 2 === 0 ? pos % 4 : 3 - (pos % 4)
    return { row, col }
  }

  return (
    <div className="relative">
      <AnimatePresence>
        {checkpointCelebration !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 rounded-3xl"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6 }}
              className="text-7xl mb-3"
            >
              {MAP_TILES[checkpointCelebration]?.rewardEmoji}
            </motion.div>
            <p className="text-2xl font-black text-gray-700">
              {MAP_TILES[checkpointCelebration]?.label} 도착!
            </p>
            <p className="text-gray-400 mt-1">체크포인트 달성 🎉</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="grid gap-2 p-4 bg-gradient-to-b from-[#E8F5E9] to-[#E3F2FD] rounded-3xl"
        style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
      >
        {MAP_TILES.map((tile) => {
          const { row, col } = getGridPos(tile.position)
          const isReached = tile.position <= currentMapPosition
          const isNext = tile.position === currentMapPosition + 1
          const isCurrent = tile.position === currentMapPosition
          const placedHere = placed.find((s) => s.mapPosition === tile.position)

          return (
            <motion.button
              key={tile.position}
              style={{ gridRow: row + 1, gridColumn: col + 1 }}
              whileTap={isNext && unplaced.length > 0 ? { scale: 0.9 } : {}}
              onClick={() => handleTilePress(tile.position)}
              className={`
                relative flex flex-col items-center justify-center
                w-full aspect-square rounded-2xl border-2 transition-all
                ${isReached ? 'bg-white shadow-sm' : 'bg-white/40'}
                ${isNext && unplaced.length > 0 ? 'border-[#FF8FAB] animate-pulse shadow-pink-100 shadow-md' : 'border-white/60'}
                ${tile.isCheckpoint ? 'ring-2 ring-[#FFD93D] ring-offset-1' : ''}
              `}
            >
              <span
                className={`text-2xl ${!isReached ? 'opacity-30' : ''}`}
              >
                {tile.emoji}
              </span>
              {placedHere && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 text-base"
                >
                  {placedHere.emoji}
                </motion.span>
              )}
              {isCurrent && (
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute -top-3 text-xl"
                >
                  🧒
                </motion.div>
              )}
              {tile.isCheckpoint && isReached && (
                <span className="absolute -bottom-1 text-xs">👑</span>
              )}
              <p
                className={`text-[9px] font-bold mt-0.5 ${isReached ? 'text-gray-500' : 'text-gray-300'}`}
              >
                {tile.label}
              </p>
            </motion.button>
          )
        })}
      </div>

      {/* 스티커 붙이기 팝업: pb-24로 하단 내비게이션 바 위에 올려서 스티커가 잘리지 않게 표시 */}
      <AnimatePresence>
        {showStickerBox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 flex items-end pb-24"
            onClick={() => setShowStickerBox(false)}
          >
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full bg-white rounded-t-3xl p-6 pb-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
              <p className="font-black text-gray-700 text-lg mb-1">
                스티커를 붙여요! ⭐
              </p>
              <p className="text-sm text-gray-400 mb-5">
                {MAP_TILES[currentMapPosition + 1]?.label}(으)로 이동해요
              </p>
              <div className="flex gap-3 flex-wrap justify-center">
                {unplaced.map((sticker) => (
                  <motion.button
                    key={sticker.id}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => handlePlaceSticker(sticker.id)}
                    className="flex flex-col items-center gap-1.5 w-20 py-4 bg-[#FFF9F0] rounded-2xl border-2 border-[#FFD93D]"
                  >
                    <span className="text-4xl">{sticker.emoji}</span>
                    <p className="text-[10px] text-gray-500 text-center leading-tight">
                      {sticker.label}
                    </p>
                    <p className="text-[9px] text-gray-300">
                      from {sticker.fromName}
                    </p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {unplaced.length > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mt-4 flex justify-center"
        >
          <div className="flex items-center gap-2 bg-[#FFF0F5] px-4 py-2.5 rounded-full border border-pink-100">
            <span className="text-xl">⭐</span>
            <p className="font-black text-[#FF8FAB] text-sm">
              붙일 수 있는 스티커 {unplaced.length}개!
            </p>
            <span className="text-sm">→ 다음 칸을 눌러요</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
