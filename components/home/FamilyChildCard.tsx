/**
 * 자녀 프로필 카드 (홈 대시보드용)
 * 비개발자: 한 명의 자녀에 대해 아바타, 오늘 루틴 진행률, 캐릭터(펫) 성장 현황을 보여주고,
 * 탭하면 아이 루틴 화면(/routine/kid)으로 이동해요.
 */

'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { FamilyProfile, ROLE_META, getProfileImageSrc } from '@/types/profile'
import { useKidRoutineStore, useKidRoutineForProfile } from '@/lib/stores/kidRoutineStore'
import { usePetStore, PET_META } from '@/lib/stores/petStore'
import { useProfileStore } from '@/lib/stores/profileStore'

/** 캐릭터 성장 단계 표시 라벨 (알→어른) */
const STAGE_LABELS = ['알', '아기', '소년', '청년', '어른']

interface Props {
  profile: FamilyProfile
}

export function FamilyChildCard({ profile }: Props) {
  const router = useRouter()
  const setActiveProfile = useProfileStore((s) => s.setActiveProfile)
  const setCurrentProfileId = useKidRoutineStore((s) => s.setCurrentProfileId)
  const { routines, completedItemIds } = useKidRoutineForProfile(profile.id)
  const { species, stage, totalFed, getNextStageExp, pendingFood, getEmoji } = usePetStore()

  // 오늘 아침 루틴 기준 진행률 (해당 프로필의 완료 개수 / 전체 항목 수)
  const todayRoutine = routines.find((r) => r.type === 'morning')
  const totalItems = todayRoutine?.items.length ?? 0
  const completedItems = completedItemIds.morning.length
  const progressRate = totalItems > 0 ? completedItems / totalItems : 0

  // 캐릭터(펫) 정보
  const petEmoji = getEmoji()
  const petName = species ? PET_META[species].label : null
  const stageLabel = STAGE_LABELS[stage]
  const nextExp = getNextStageExp()
  const petProgress = nextExp > 0 ? Math.min(1, totalFed / nextExp) : 0

  const roleMeta = ROLE_META[profile.role]

  const handleClick = () => {
    setActiveProfile(profile.id)
    setCurrentProfileId(profile.id)
    router.push('/routine/kid')
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="w-full bg-white rounded-3xl p-5 shadow-sm border border-gray-100 text-left"
    >
      <div className="flex items-center gap-4">
        {/* 아바타: 커스텀/기본 이미지 또는 이모지 */}
        <div
          className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm"
          style={{ backgroundColor: profile.avatarColor + '33' }}
        >
          {getProfileImageSrc(profile) ? (
            <img
              src={getProfileImageSrc(profile)!}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl">{profile.avatarEmoji}</span>
          )}
        </div>

        {/* 메인 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-black text-gray-800 text-lg">{profile.name}</p>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: roleMeta.color + '22', color: roleMeta.color }}
            >
              {roleMeta.label}
            </span>
          </div>

          {/* 오늘 루틴 진행률 */}
          <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs text-gray-400">오늘 루틴</p>
              <p className="text-xs font-black text-gray-600">
                {completedItems}/{totalItems}
                {pendingFood > 0 && (
                  <span className="text-[#FF8FAB] ml-1">🍖×{pendingFood}</span>
                )}
              </p>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#FF8FAB] to-[#FFD93D] rounded-full"
                animate={{ width: `${progressRate * 100}%` }}
                transition={{ type: 'spring', stiffness: 80 }}
              />
            </div>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
      </div>

      {/* 캐릭터 성장 섹션 (펫이 선택된 경우만) */}
      {species && (
        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-4">
          <motion.div
            className="text-4xl"
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          >
            {petEmoji}
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-black text-gray-700">
                {petName} · {stageLabel} 단계
              </p>
              {stage >= 4 && <span className="text-xs text-[#FFD93D] font-black">✨ MAX</span>}
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #FFD93D, #FF8FAB)' }}
                animate={{ width: `${petProgress * 100}%` }}
                transition={{ type: 'spring', stiffness: 60 }}
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">
              먹이 {totalFed} / {nextExp} (다음 단계까지)
            </p>
          </div>
        </div>
      )}
    </motion.button>
  )
}
