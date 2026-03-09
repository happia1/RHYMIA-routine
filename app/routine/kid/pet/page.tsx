'use client'

/**
 * 우리 친구(펫) 페이지 — 캐릭터 상태·먹이·먹이주기
 * 비개발자: 미션을 완료할 때마다 먹이가 쌓이고, 이 화면에서 "먹이 주기"를 누르면 캐릭터가 성장해요.
 */

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { usePetStore } from '@/lib/stores/petStore'
import { PET_META } from '@/types/pet'
import type { PetSpecies } from '@/types/pet'

const SPECIES_LIST: PetSpecies[] = [
  'penguin',
  'bluebird',
  'dog',
  'cat',
  'plant',
]

export default function KidPetPage() {
  const router = useRouter()
  const {
    species,
    pendingFood,
    totalFed,
    stage,
    isEating,
    addFood,
    feedPet,
    selectPet,
    getEmoji,
    getProgress,
    getNextStageExp,
  } = usePetStore()

  const meta = species ? PET_META[species] : null
  const progress = getProgress()
  const nextExp = getNextStageExp()

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
          <h1 className="text-2xl font-black text-gray-700">우리 친구</h1>
        </div>

        {!species ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 mb-4">
              키울 친구를 골라봐요! 미션을 완료하면 먹이를 받아요 🍽️
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {SPECIES_LIST.map((s) => (
                <motion.button
                  key={s}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => selectPet(s)}
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
                {getEmoji()}
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

            <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
              <p className="text-sm font-black text-gray-700 mb-2">
                {meta?.feedEmoji} 먹이 {pendingFood}개
              </p>
              <p className="text-xs text-gray-400 mb-4">
                미션을 완료할 때마다 먹이가 쌓여요!
              </p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={feedPet}
                disabled={pendingFood <= 0 || isEating}
                className="w-full py-4 rounded-2xl font-black text-white bg-[#A8E6CF] disabled:opacity-40"
              >
                {isEating
                  ? '맛있게 먹는 중...'
                  : `먹이 주기 ${pendingFood > 0 ? `(${pendingFood})` : ''}`}
              </motion.button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
