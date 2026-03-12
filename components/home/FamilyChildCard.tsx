/**
 * 자녀 프로필 카드 (홈 대시보드용)
 * 비개발자: 아바타, 오늘 루틴 진행률, 시간대별 상태(등원 전/유치원 활동 중/잠자리까지),
 * 캐릭터 성장을 보여주고, 탭하면 아이 루틴 화면으로 이동해요.
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { FamilyProfile, ROLE_META, getProfileImageSrc } from '@/types/profile'
import { useKidRoutineStore, useKidRoutineForProfile } from '@/lib/stores/kidRoutineStore'
import { usePetStore, PET_META, DEFAULT_PET_STATE } from '@/lib/stores/petStore'
import { useProfileStore } from '@/lib/stores/profileStore'
import { getChildStatus } from '@/lib/utils/childStatus'

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
  // 프로필별 펫 상태 구독 — 온보딩에서 선택한 캐릭터가 petStore에 반영되면 즉시 반영돼 홈 카드에 표시됨
  const petState = usePetStore((s) => s.byProfile[profile.id] ?? DEFAULT_PET_STATE)
  const { species, stage, totalFed, pendingFood } = petState
  const getEmoji = usePetStore((s) => s.getEmoji)
  const getNextStageExp = usePetStore((s) => s.getNextStageExp)
  /** PET_META에 있는 종만 사용 (저장된 species가 옛 데이터면 undefined 방지) */
  const petMeta = species != null ? PET_META[species as keyof typeof PET_META] : undefined
  /** 단계별 이미지 경로 (petMeta 있을 때만 사용) */
  const stageImageSrc =
    petMeta != null && stage != null
      ? petMeta.stageImages[Math.min(stage, petMeta.stageImages.length - 1)]
      : null

  const [tick, setTick] = useState(0)
  const [stageImageError, setStageImageError] = useState(false)
  useEffect(() => {
    setStageImageError(false)
  }, [stageImageSrc])
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 60000)
    return () => clearInterval(id)
  }, [])

  const todayRoutine = routines.find((r) => r.type === 'morning')
  const totalItems = todayRoutine?.items.length ?? 0
  const completedItems = completedItemIds.morning.length
  const progressRate = totalItems > 0 ? completedItems / totalItems : 0

  const childStatus = getChildStatus(profile)

  const petEmoji = getEmoji(profile.id)
  const petName = petMeta?.label ?? null
  const stageLabel = STAGE_LABELS[stage]
  const nextExp = getNextStageExp(profile.id)
  const petProgress = nextExp > 0 ? Math.min(1, totalFed / nextExp) : 0

  const roleMeta = ROLE_META[profile.role]

  const goToRoutine = () => {
    setActiveProfile(profile.id)
    setCurrentProfileId(profile.id)
    router.push('/routine/kid?list=1')
  }
  const goToPet = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveProfile(profile.id)
    setCurrentProfileId(profile.id)
    router.push('/routine/kid/pet')
  }

  /* 프로필 수정/설정은 독바 프로필 탭 → 팝업에서 진행 (ProfileSwitchSheet) */
  const remainingToNext = nextExp > totalFed ? nextExp - totalFed : 0

  return (
    <div className="relative w-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden text-left flex">
      {/* 왼쪽 2: 프로필·루틴·상태 — 탭 시 오늘 루틴으로 */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={goToRoutine}
        className="flex-[2] min-w-0 p-4 flex flex-col gap-3 text-left cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm"
            style={{ backgroundColor: profile.avatarColor + '33' }}
          >
            {getProfileImageSrc(profile) ? (
              <img
                src={getProfileImageSrc(profile)!}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl">{profile.avatarEmoji}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-black text-gray-800 text-base">{profile.name}</p>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: roleMeta.color + '22', color: roleMeta.color }}
              >
                {roleMeta.label}
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs text-gray-400">오늘 루틴</p>
            <p className="text-xs font-black text-gray-600">{completedItems}/{totalItems}</p>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#FF8FAB] to-[#FFD93D] rounded-full"
              animate={{ width: `${progressRate * 100}%` }}
              transition={{ type: 'spring', stiffness: 80 }}
            />
          </div>
        </div>

        {childStatus && (
          <div
            className={`py-2 px-3 rounded-xl text-xs font-bold ${
              childStatus.type === 'at_institution'
                ? 'bg-[#A8E6CF]/30 text-[#2D6A4F]'
                : childStatus.type === 'departure'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-[#7EB8D4]/30 text-[#1B4965]'
            }`}
          >
            {childStatus.type === 'at_institution' && <span>🏫 {childStatus.label}</span>}
            {childStatus.type === 'departure' && <span>🚌 {childStatus.label}</span>}
            {childStatus.type === 'bedtime' && <span>😴 {childStatus.label}</span>}
          </div>
        )}
      </motion.button>

      {/* 오른쪽 1: 나의 펫 — 탭 시 나의 펫 페이지로 */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={goToPet}
        className="flex-1 min-w-0 flex flex-col items-center justify-center p-4 pr-10 border-l border-gray-100 bg-gray-50/50 cursor-pointer"
      >
        {species ? (
          <>
            <motion.div
              className="w-28 h-28 flex items-center justify-center"
              animate={{ y: [0, -2, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            >
              {stageImageSrc && !stageImageError ? (
                <img
                  src={stageImageSrc}
                  alt={petName ?? ''}
                  className="w-full h-full object-contain"
                  onError={() => setStageImageError(true)}
                />
              ) : (
                <span className="text-6xl">{petEmoji}</span>
              )}
            </motion.div>
            {pendingFood > 0 && (
              <p className="text-[10px] text-[#FF8FAB] font-semibold mt-0.5">🍖×{pendingFood}</p>
            )}
          </>
        ) : (
          <div className="text-center">
            <span className="text-3xl">🥚</span>
            <p className="text-[10px] text-gray-400 mt-1">펫 선택하기</p>
          </div>
        )}
        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 pointer-events-none" />
      </motion.button>
    </div>
  )
}
