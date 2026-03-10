'use client'

/**
 * 칭찬 스티커 — 여행 지도 / 스티커함
 * 비개발자: 아이가 "칭찬 스티커" 메뉴에 들어오면 현재 위치, 여행 지도, 받은 스티커함을 볼 수 있어요. 마일스톤은 루틴 페이지의 마일스톤 블록에서 들어가요.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Map, Star } from 'lucide-react'
import { useStickerStore } from '@/lib/stores/stickerStore'
import { useProfileStore } from '@/lib/stores/profileStore'
import { StickerMap } from '@/components/sticker/StickerMap'
import { MAP_TILES } from '@/types/sticker'

type Tab = 'map' | 'stickers'

export default function StickerPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('map')
  const activeProfile = useProfileStore((s) => s.getActiveProfile())
  const profileId = activeProfile?.id ?? ''
  // 현재 선택된 자녀(프로필) 기준으로 스티커함·지도 상태 표시 (프로필별 분리)
  const getStateForProfile = useStickerStore((s) => s.getStateForProfile)
  const { inbox, currentMapPosition, achievedCheckpoints } = getStateForProfile(profileId)
  const unplacedCount = inbox.length
  const currentTile = MAP_TILES[currentMapPosition]

  return (
    <div className="min-h-screen bg-[#FFF9F0] pb-24">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-black text-gray-700">칭찬 스티커</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl px-4 py-3 flex items-center gap-4 shadow-sm"
        >
          <span className="text-4xl">{currentTile?.emoji}</span>
          <div className="flex-1">
            <p className="font-black text-gray-700">{currentTile?.label}</p>
            <p className="text-xs text-gray-400">
              {currentMapPosition} / 19 단계 · 체크포인트{' '}
              {achievedCheckpoints.length}개
            </p>
            <div className="h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#FFD93D] to-[#FF8FAB] rounded-full"
                animate={{ width: `${(currentMapPosition / 19) * 100}%` }}
                transition={{ type: 'spring', stiffness: 80 }}
              />
            </div>
          </div>
          {unplacedCount > 0 && (
            <div className="flex flex-col items-center">
              <span className="text-2xl">⭐</span>
              <span className="text-xs font-black text-[#FFD93D]">
                ×{unplacedCount}
              </span>
            </div>
          )}
        </motion.div>
      </div>

      <div className="flex gap-2 px-5 mb-4">
        {[
          { key: 'map', icon: Map, label: '여행 지도' },
          {
            key: 'stickers',
            icon: Star,
            label:
              `스티커함${unplacedCount > 0 ? ` (${unplacedCount})` : ''}`,
          },
        ].map(({ key, icon: Icon, label }) => (
          <motion.button
            key={key}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTab(key as Tab)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-black transition-all ${
              tab === key
                ? 'bg-[#FF8FAB] text-white shadow-md'
                : 'bg-white text-gray-500 shadow-sm'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </motion.button>
        ))}
      </div>

      <div className="px-5">
        {tab === 'map' && <StickerMap profileId={profileId} />}

        {tab === 'stickers' && (
          <div>
            <p className="text-sm text-gray-400 mb-3">
              엄마/아빠에게 받은 스티커예요! 지도 탭에서 붙여봐요 🗺️
            </p>
            {inbox.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">📭</div>
                <p className="text-gray-400">아직 받은 스티커가 없어요</p>
                <p className="text-gray-300 text-sm mt-1">
                  루틴을 완료하면 스티커를 받을 수 있어요!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {inbox.map((sticker) => (
                  <motion.div
                    key={sticker.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex flex-col items-center bg-white rounded-2xl p-3 shadow-sm border border-[#FFD93D]/30"
                  >
                    <span className="text-4xl">{sticker.emoji}</span>
                    <p className="text-[9px] text-gray-500 text-center mt-1 leading-tight">
                      {sticker.label}
                    </p>
                    <p className="text-[8px] text-gray-300">
                      from {sticker.fromName}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
