'use client'

/**
 * 나의 펫 페이지 — 캐릭터 선택·상태·먹이·마일스톤 뱃지
 * 비개발자: 미션(루틴) 완료 시 먹이가 쌓이고, 먹이 주기로 펫이 성장해요. 마일스톤 달성 뱃지로 부모님께 선물을 받아요.
 */

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Gift, Award } from 'lucide-react'
import { usePetStore, DEFAULT_PET_STATE } from '@/lib/stores/petStore'
import { useProfileStore } from '@/lib/stores/profileStore'
import { useMilestoneStore } from '@/lib/stores/milestoneStore'
import type { Milestone } from '@/lib/stores/milestoneStore'
import { PET_META } from '@/types/pet'
import type { PetSpecies } from '@/types/pet'

const EMPTY_MILESTONES: Milestone[] = []

const SPECIES_LIST: PetSpecies[] = [
  'penguin',
  'bluebird',
  'dog',
  'cat',
  'plant',
]

/** 마일스톤 달성 뱃지 기준 개수 및 보상 설명 */
const MILESTONE_BADGES: { count: number; reward: string }[] = [
  { count: 1, reward: '부모님께 스티커 선물 받기' },
  { count: 3, reward: '부모님과 함께 간식 타임' },
  { count: 5, reward: '부모님께 작은 선물 받기' },
  { count: 10, reward: '부모님과 소원 하나 들어주기' },
  { count: 15, reward: '부모님과 놀이공원 가기' },
  { count: 20, reward: '부모님께 특별 선물 받기' },
  { count: 25, reward: '부모님과 영화 보기' },
  { count: 30, reward: '부모님과 맛있는 식사' },
  { count: 35, reward: '부모님께 원하는 장난감 하나' },
  { count: 40, reward: '부모님과 캠핑 가기' },
  { count: 45, reward: '부모님과 테마파크' },
  { count: 50, reward: '부모님께 대형 선물 받기' },
  { count: 60, reward: '부모님과 여행 가기' },
  { count: 70, reward: '부모님과 특별한 날' },
  { count: 80, reward: '부모님께 소원 두 개 들어주기' },
  { count: 90, reward: '부모님과 꿈의 경험' },
  { count: 100, reward: '부모님께 100개 달성 대형 보상!' },
]

export default function KidPetPage() {
  const router = useRouter()
  const activeProfile = useProfileStore((s) => s.getActiveProfile())
  const profileId = activeProfile?.id ?? ''

  // 캐릭터 선택 시 즉시 화면 전환: 스토어의 해당 프로필 상태를 구독 (getStateForProfile은 구독이 아님)
  const profileState = usePetStore((s) =>
    profileId ? (s.byProfile[profileId] ?? DEFAULT_PET_STATE) : DEFAULT_PET_STATE
  )
  const { species, pendingFood, totalFed, stage, isEating } = profileState
  const selectPet = usePetStore((s) => s.selectPet)
  const feedPet = usePetStore((s) => s.feedPet)
  const getEmoji = usePetStore((s) => s.getEmoji)
  const getProgress = usePetStore((s) => s.getProgress)
  const getNextStageExp = usePetStore((s) => s.getNextStageExp)

  // 마일스톤 달성 개수 (뱃지 섹션용)
  const milestones = useMilestoneStore((s) =>
    profileId ? (s.byProfile[profileId] ?? EMPTY_MILESTONES) : EMPTY_MILESTONES
  )
  const achievedCount = milestones.filter((m) => m.isAchieved).length

  const meta = species ? PET_META[species] : null
  const progress = getProgress(profileId)
  const nextExp = getNextStageExp(profileId)

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
          <h1 className="text-2xl font-black text-gray-700">나의 펫</h1>
        </div>

        {!species ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 mb-4">
              키울 친구를 골라봐요! 미션을 완료하면 먹이가 쌓여요 🍽️
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {SPECIES_LIST.map((s) => (
                <motion.button
                  key={s}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => profileId && selectPet(profileId, s)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-gray-100 hover:border-[#A8E6CF]"
                >
                  <span className="text-4xl">{PET_META[s].emoji}</span>
                  <span className="text-xs font-bold text-gray-600">
                    {PET_META[s].label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <motion.div
              layout
              className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center"
            >
              <motion.span
                key={stage}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-7xl mb-2"
              >
                {getEmoji(profileId)}
              </motion.span>
              <p className="font-black text-gray-700">{meta?.label}</p>
              <p className="text-xs text-gray-400 mt-1">
                레벨 {stage + 1} · 먹이 {totalFed}개
              </p>
              <div className="w-full h-2 bg-gray-100 rounded-full mt-3 overflow-hidden">
                <motion.div
                  className="h-full bg-[#A8E6CF] rounded-full"
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ type: 'spring', stiffness: 80 }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                다음 단계까지 {nextExp - totalFed}개
              </p>
            </motion.div>

            {/* 먹이 블록: 미션 완료 시 먹이가 쌓임 */}
            <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
              <p className="text-sm font-black text-gray-700 mb-2">
                {meta?.feedEmoji} 먹이 {pendingFood}개
              </p>
              <p className="text-xs text-gray-400 mb-4">
                미션(루틴) 완료 시 먹이가 쌓여요!
              </p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => feedPet(profileId)}
                disabled={pendingFood <= 0 || isEating}
                className="w-full py-4 rounded-2xl font-black text-white bg-[#A8E6CF] disabled:opacity-40"
              >
                {isEating
                  ? '맛있게 먹는 중...'
                  : `먹이 주기 ${pendingFood > 0 ? `(${pendingFood})` : ''}`}
              </motion.button>
            </div>

            {/* 마일스톤 달성 뱃지 — 달성 시 부모님께 보상 받기 */}
            <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-[#FF8FAB]" />
                <p className="text-sm font-black text-gray-700">마일스톤 뱃지</p>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                마일스톤을 달성할 때마다 뱃지를 받고, 부모님께 선물을 받을 수 있어요!
              </p>
              <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto">
                {MILESTONE_BADGES.map((badge) => {
                  const unlocked = achievedCount >= badge.count
                  return (
                    <div
                      key={badge.count}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 ${
                        unlocked
                          ? 'border-[#FF8FAB] bg-[#FFF0F5]'
                          : 'border-gray-100 bg-gray-50'
                      }`}
                    >
                      <span className="text-2xl flex-shrink-0">
                        {unlocked ? '🏆' : '🔒'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-black ${unlocked ? 'text-gray-800' : 'text-gray-400'}`}>
                          {badge.count}개 달성 뱃지
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Gift className="w-3 h-3" />
                          {badge.reward}
                        </p>
                      </div>
                      {unlocked && <span className="text-lg">✅</span>}
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">
                현재 {achievedCount}개 달성 중
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
