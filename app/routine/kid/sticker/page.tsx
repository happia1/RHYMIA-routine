'use client'

/**
 * 칭찬 스티커 탭 — 여행 지도 / 스티커함 / 마일스톤 미리보기
 * 비개발자: 아이가 "칭찬 스티커" 메뉴에 들어오면 현재 위치, 여행 지도, 받은 스티커함, 마일스톤 목록을 볼 수 있어요.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Map, Star, Trophy } from 'lucide-react'
import { useStickerStore } from '@/lib/stores/stickerStore'
import { useMilestoneStore } from '@/lib/stores/milestoneStore'
import { useProfileStore } from '@/lib/stores/profileStore'
import { StickerMap } from '@/components/sticker/StickerMap'
import { MAP_TILES } from '@/types/sticker'

type Tab = 'map' | 'stickers' | 'milestone'

export default function StickerPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('map')
  const { inbox, currentMapPosition, achievedCheckpoints } = useStickerStore()
  const { getMilestones } = useMilestoneStore()
  const activeProfile = useProfileStore((s) => s.getActiveProfile())
  const profileId = activeProfile?.id ?? null

  // 마일스톤은 부모가 "칭찬 스티커 주기" 마일스톤 탭에서 풀을 보고 추가한 것만 표시됩니다 (자동 전체 초기화 없음).
  const milestones = getMilestones(profileId)
  const unplacedCount = inbox.length
  const achievedMilestones = milestones.filter((m) => m.isAchieved).length
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
          {
            key: 'milestone',
            icon: Trophy,
            label: `마일스톤 ${achievedMilestones}/${milestones.length}`,
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
        {tab === 'map' && <StickerMap />}

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

        {tab === 'milestone' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-400">
                도전해볼 미션이에요! 해내면 스티커를 받아요 🏆
              </p>
              <button
                onClick={() => router.push('/routine/kid/milestone')}
                className="text-xs font-black text-[#FF8FAB] bg-[#FFF0F5] px-2.5 py-1 rounded-full"
              >
                전체보기
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {milestones.slice(0, 5).map((ms) => (
                <div
                  key={ms.id}
                  className={`flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border-2 ${
                    ms.isAchieved
                      ? 'border-[#A8E6CF] opacity-60'
                      : 'border-gray-100'
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#FFF9F0] flex items-center justify-center flex-shrink-0">
                    {ms.imagePath ? (
                      <img
                        src={ms.imagePath}
                        alt={ms.title}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <span className="text-2xl">🎯</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-black text-gray-700 ${ms.isAchieved ? 'line-through' : ''}`}
                    >
                      {ms.title}
                    </p>
                    <p className="text-xs text-gray-400">{ms.description}</p>
                  </div>
                  {ms.isAchieved ? (
                    <span className="text-2xl">✅</span>
                  ) : (
                    <span className="text-xl text-gray-200">○</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
