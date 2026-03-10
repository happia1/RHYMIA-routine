'use client'

/**
 * 자녀용 마일스톤 전용 페이지 (루틴 페이지와 분리해 바로 진입 가능)
 * 비개발자: 루틴 페이지의 "마일스톤" 블록이나 칭찬 스티커 탭에서 들어와, 부모가 추가한 마일스톤을
 * 루틴 미션처럼 큰 이미지·카드 형태로 한눈에 볼 수 있어요. 달성 여부는 부모가 스티커로 인정해 줘요.
 */

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useProfileStore } from '@/lib/stores/profileStore'
import { useMilestoneStore } from '@/lib/stores/milestoneStore'
import type { Milestone } from '@/lib/stores/milestoneStore'

/** 스토어 구독 시 빈 배열 안정 참조 (getSnapshot 무한루프 방지) */
const EMPTY_MILESTONES: Milestone[] = []
const EMPTY_PENDING_IDS: string[] = []

export default function KidMilestonePage() {
  const router = useRouter()
  const activeProfile = useProfileStore((s) => s.getActiveProfile())
  const profileId = activeProfile?.id ?? null
  const milestones = useMilestoneStore((s) =>
    profileId ? (s.byProfile[profileId] ?? EMPTY_MILESTONES) : EMPTY_MILESTONES
  )
  const pendingIds = useMilestoneStore((s) =>
    profileId ? (s.pendingMilestoneIds[profileId] ?? EMPTY_PENDING_IDS) : EMPTY_PENDING_IDS
  )
  const requestMilestoneConfirm = useMilestoneStore((s) => s.requestMilestoneConfirm)
  const achievedCount = milestones.filter((m) => m.isAchieved).length

  return (
    <div className="min-h-screen bg-[#FFF9F0] pb-24">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center flex-shrink-0"
            aria-label="뒤로"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-gray-700">마일스톤</h1>
            <p className="text-xs text-gray-400">
              도전해볼 미션이에요! 해내면 스티커를 받아요 🏆
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-white rounded-xl px-2.5 py-1.5 shadow-sm border border-gray-100 flex-shrink-0">
            <span className="text-lg">🏆</span>
            <span className="text-sm font-black text-gray-700">
              {achievedCount}/{milestones.length}
            </span>
          </div>
        </div>
      </div>

      <div className="px-5">
        {milestones.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-3xl border-2 border-gray-100"
          >
            <div className="text-6xl mb-3">🎯</div>
            <p className="text-gray-600 font-semibold">아직 마일스톤이 없어요</p>
            <p className="text-sm text-gray-400 mt-1">
              엄마/아빠가 칭찬 스티커 주기에서 마일스톤을 추가해 주면 여기에 나타나요!
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {milestones.map((ms, idx) => {
              const isPending = pendingIds.includes(ms.id)
              const canTap = profileId && !ms.isAchieved && !isPending
              return (
                <motion.button
                  key={ms.id}
                  type="button"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileTap={canTap ? { scale: 0.97 } : {}}
                  onClick={() => canTap && requestMilestoneConfirm(profileId!, ms.id)}
                  disabled={!canTap}
                  className={`
                    flex flex-col rounded-3xl overflow-hidden text-left w-full
                    bg-white shadow-lg border-2
                    ${ms.isAchieved ? 'border-[#A8E6CF] opacity-85 cursor-default' : ''}
                    ${isPending ? 'border-amber-200 bg-amber-50/50 cursor-not-allowed' : ''}
                    ${canTap ? 'border-pink-50 shadow-pink-100 cursor-pointer' : ''}
                  `}
                >
                  {/* 이미지 영역: 루틴 미션 카드처럼 크게 (한눈에 들어오도록) */}
                  <div className={`w-full aspect-square max-h-[160px] rounded-t-2xl flex items-center justify-center overflow-hidden flex-shrink-0 ${isPending ? 'opacity-75' : ''}`} style={{ backgroundColor: isPending ? '#FFF8E7' : '#FFF0F5' }}>
                    {ms.imagePath ? (
                      <img
                        src={ms.imagePath}
                        alt={ms.title}
                        className="w-full h-full object-contain p-3"
                      />
                    ) : (
                      <span className="text-5xl">{ms.stickerEmoji ?? '🎯'}</span>
                    )}
                  </div>
                  {/* 텍스트 영역 */}
                  <div className="flex flex-col flex-1 p-3 min-w-0">
                    <p
                      className={`text-sm font-black leading-tight line-clamp-2 ${
                        ms.isAchieved ? 'text-gray-500 line-through' : isPending ? 'text-gray-500' : 'text-gray-700'
                      }`}
                    >
                      {ms.title}
                    </p>
                    {isPending ? (
                      <p className="text-xs text-amber-600 font-semibold mt-0.5 flex items-center gap-1">
                        ⏳ 확인 중...
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                        {ms.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-end">
                      {ms.isAchieved ? (
                        <span className="text-2xl" aria-hidden>✅</span>
                      ) : isPending ? (
                        <span className="text-lg" aria-hidden>⏳</span>
                      ) : (
                        <span className="text-xl text-gray-200" aria-hidden>○</span>
                      )}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
