'use client'

/**
 * 캐릭터 위젯 (먹이 → 성장)
 * 비개발자: 펫 이모지, 이름, 성장 단계, 성장 바를 보여주고, pendingFood가 있으면 "먹이 주기" 버튼으로 한 번에 먹여요.
 * 프로필별로 펫이 분리되어 있어서 profileId를 받거나, 없으면 활성 프로필을 사용해요.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { usePetStore, PET_META, DEFAULT_PET_STATE } from '@/lib/stores/petStore'
import { useProfileStore } from '@/lib/stores/profileStore'

interface PetWidgetProps {
  showFeedButton?: boolean
  /** 표시할 자녀 프로필 ID (없으면 활성 프로필 사용) */
  profileId?: string | null
}

const STAGE_LABELS = ['알', '아기', '소년', '청년', '어른']

export function PetWidget({ showFeedButton = false, profileId: profileIdProp }: PetWidgetProps) {
  const activeProfileId = useProfileStore((s) => s.activeProfileId)
  const profileId = profileIdProp ?? activeProfileId

  const { species, name, stage, pendingFood, isEating, totalFed } = usePetStore((s) =>
    profileId ? (s.byProfile[profileId] ?? DEFAULT_PET_STATE) : DEFAULT_PET_STATE
  )
  const feedPet = usePetStore((s) => s.feedPet)
  const getEmoji = usePetStore((s) => s.getEmoji)
  const getProgress = usePetStore((s) => s.getProgress)
  const getNextStageExp = usePetStore((s) => s.getNextStageExp)

  if (!profileId) return null

  const emoji = getEmoji(profileId)
  const progress = getProgress(profileId)
  const nextExp = getNextStageExp(profileId)
  const stageLabel = STAGE_LABELS[stage]

  if (!species) return null

  return (
    <div className="flex flex-col items-center">
      {/* 캐릭터 이모지 (먹는 중일 때 튀는 애니메이션) */}
      <motion.div
        className="relative"
        animate={isEating ? {
          y: [0, -12, 0, -8, 0],
          scale: [1, 1.15, 1, 1.08, 1],
        } : {
          y: [0, -4, 0],
        }}
        transition={isEating ? {
          duration: 1.8, ease: 'easeInOut'
        } : {
          repeat: Infinity, duration: 3, ease: 'easeInOut'
        }}
      >
        <span className="text-7xl">{emoji}</span>

        <AnimatePresence>
          {isEating && (
            <>
              {['✨', '💫', '⭐'].map((s, i) => (
                <motion.span
                  key={i}
                  className="absolute text-xl"
                  style={{ left: (i - 1) * 28, top: -16 }}
                  initial={{ opacity: 0, y: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], y: -30, scale: [0, 1.3, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.15, duration: 0.8 }}
                >
                  {s}
                </motion.span>
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="text-center mt-2">
        <p className="font-black text-gray-700 text-base">
          {name || (species ? PET_META[species].label : '')}
        </p>
        <p className="text-xs text-gray-400">{stageLabel} 단계</p>
      </div>

      {/* 성장 바 (totalFed / nextExp) */}
      <div className="w-32 mt-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>성장</span>
          <span>{totalFed} / {nextExp}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#FF8FAB] to-[#FFD93D] rounded-full"
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: 'spring', stiffness: 80 }}
          />
        </div>
        {stage >= 4 && (
          <p className="text-xs text-center text-[#FF8FAB] font-black mt-1">✨ 최고 성장!</p>
        )}
      </div>

      {/* 먹이 주기 버튼 (보상 화면 등에서 사용) */}
      {showFeedButton && pendingFood > 0 && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileTap={{ scale: 0.93 }}
          onClick={() => feedPet(profileId)}
          disabled={isEating}
          className="mt-4 bg-gradient-to-r from-[#FF8FAB] to-[#FFD93D] text-white font-black px-6 py-3 rounded-2xl shadow-lg disabled:opacity-50 flex items-center gap-2"
        >
          <span className="text-xl">🍖</span>
          먹이 주기 ×{pendingFood}
        </motion.button>
      )}
    </div>
  )
}
