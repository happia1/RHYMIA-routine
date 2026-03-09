/**
 * 부모(엄마/아빠) 프로필 카드 (홈 대시보드용)
 * 비개발자: 한 명의 부모에 대해 아바타, 연속 달성일, 현재 시간대의 "지금 할 루틴"을 보여주고,
 * 탭하면 나의 루틴 화면(/routine/personal)으로 이동해요.
 * 연속 달성일은 현재 kidRoutineStore의 streakDays를 재활용합니다 (추후 personal 전용 streak 추가 권장).
 */

'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronRight, Flame } from 'lucide-react'
import { FamilyProfile, getProfileImageSrc } from '@/types/profile'
import { usePersonalRoutineStore, TIME_BLOCK_META, type TimeBlock } from '@/lib/stores/personalRoutineStore'
import { useKidRoutineStore, selectRewardPoints } from '@/lib/stores/kidRoutineStore'
import { useProfileStore } from '@/lib/stores/profileStore'

interface Props {
  profile: FamilyProfile
  currentBlock: TimeBlock
}

export function FamilyParentCard({ profile, currentBlock }: Props) {
  const router = useRouter()
  const setActiveProfile = useProfileStore((s) => s.setActiveProfile)
  const { slots, getSlotsByBlock } = usePersonalRoutineStore()
  const rewardPoints = useKidRoutineStore(selectRewardPoints)

  const blockMeta = TIME_BLOCK_META[currentBlock]
  const currentSlots = getSlotsByBlock(currentBlock)
  // 현재 시간대에서 아직 완료하지 않은 첫 번째 루틴 (시작 시간 순)
  const currentRoutine = [...currentSlots]
    .sort((a, b) => a.startHour - b.startHour)
    .find((s) => !s.isCompleted)
  const completedToday = slots.filter((s) => s.isCompleted).length
  const totalToday = slots.length

  const streak = rewardPoints.streakDays
  const isMom = profile.role === 'mom'
  const accentColor = isMom ? '#FF8FAB' : '#7EB8D4'

  const handleClick = () => {
    setActiveProfile(profile.id)
    router.push('/routine/personal')
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="w-full bg-white rounded-3xl p-5 shadow-sm border border-gray-100 text-left"
    >
      <div className="flex items-center gap-4">
        {/* 아바타: 커스텀 이미지 또는 이모지 */}
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
              style={{ backgroundColor: accentColor + '22', color: accentColor }}
            >
              {profile.role === 'mom' ? '엄마' : '아빠'}
            </span>
          </div>

          {/* 연속 달성일 (kid 스토어 값 재활용) */}
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-sm font-black text-gray-700">{streak}일 연속</span>
            </div>
            {totalToday > 0 && (
              <span className="text-xs text-gray-400">
                오늘 {completedToday}/{totalToday} 완료
              </span>
            )}
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
      </div>

      {/* 지금 할 루틴 (현재 시간대) */}
      <div className="mt-4 pt-4 border-t border-gray-50">
        <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
          <span>{blockMeta.emoji}</span>
          <span>지금은 {blockMeta.label} 시간이에요</span>
        </p>

        {currentRoutine ? (
          <div
            className="flex items-center gap-3 rounded-2xl px-3 py-2.5"
            style={{ backgroundColor: blockMeta.color + '22' }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: blockMeta.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-black text-gray-700 text-sm truncate">{currentRoutine.title}</p>
              {currentRoutine.detail && (
                <p className="text-xs text-gray-400 truncate">{currentRoutine.detail}</p>
              )}
            </div>
            <p className="text-xs font-bold flex-shrink-0" style={{ color: blockMeta.color }}>
              {currentRoutine.startHour}:00
            </p>
          </div>
        ) : totalToday === 0 ? (
          <p className="text-sm text-gray-300 font-semibold">루틴을 추가해보세요 →</p>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#A8E6CF]" />
            <p className="text-sm text-gray-400 font-semibold">이 시간대 루틴 모두 완료! ✅</p>
          </div>
        )}
      </div>
    </motion.button>
  )
}
