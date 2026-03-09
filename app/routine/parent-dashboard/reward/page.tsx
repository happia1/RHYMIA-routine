'use client'

/**
 * 전체 완료 보상 화면 — 캐릭터에게 먹이 주기
 * 비개발자: 자녀가 오늘 루틴을 다 완료하면 이 화면으로 넘어와서, 부모가 "먹이 주기"로 캐릭터를 성장시켜요.
 */

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { usePetStore } from '@/lib/stores/petStore'
import { PetWidget } from '@/components/pet/PetWidget'
import { useProfileStore } from '@/lib/stores/profileStore'

export default function RewardPage() {
  const router = useRouter()
  const { getChildProfiles } = useProfileStore()
  const childName = getChildProfiles()[0]?.name ?? '우리 아이'

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF0F5] to-[#F0FFF8] flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        className="text-8xl mb-4"
      >
        🎉
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-black text-gray-700 mb-2">
          {childName} 오늘 루틴 완료!
        </h1>
        <p className="text-gray-400">캐릭터에게 먹이를 줄 수 있어요 🍖</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-3xl p-8 shadow-xl mb-8 w-full max-w-sm"
      >
        <PetWidget showFeedButton={true} />
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => router.replace('/routine/personal')}
        className="text-gray-400 font-semibold text-sm"
      >
        나중에 줄게요 →
      </motion.button>
    </div>
  )
}
