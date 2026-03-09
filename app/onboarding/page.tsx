/**
 * 온보딩 진입 (최초 1회) — 환영 + 우리아이/나의 루틴 선택
 * 비개발자: 프로필이 없을 때만 이 화면으로 와요. "우리아이 루틴" 또는 "나의 루틴"을 선택해요.
 */

'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF0F5] to-[#F0FFF8] flex flex-col items-center px-6 py-6 sm:py-8">
      {/* 가족 사진 — 텍스트와 가깝게 배치해 한 화면에 두 블록이 모두 보이도록 */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="flex justify-center mb-0 p-0"
      >
        <img
          src="/profile/family.png"
          alt="가족"
          className="w-56 h-56 sm:w-64 sm:h-64 object-contain p-0 block"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-5"
      >
        <p className="text-sm text-gray-500 mb-1">아이의 미래를 밝혀주는</p>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-700">자기주도 습관형성 프로젝트!</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="w-full flex flex-col gap-3 max-w-md"
      >
        {/* 우리아이 루틴 블록 */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/onboarding/child')}
          className="w-full bg-gradient-to-r from-[#FF8FAB] to-[#FFD93D] rounded-3xl p-5 text-left shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              <img
                src="/profile/girl.png"
                alt=""
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
              />
              <img
                src="/profile/boy.png"
                alt=""
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
              />
            </div>
            <div>
              <p className="text-2xl font-black text-white">우리아이 루틴</p>
              <p className="text-white/80 text-sm">유치원 · 어린이집 · 초등학생</p>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <span className="bg-white/30 text-white text-xs font-bold px-3 py-1 rounded-full">미취학 아동</span>
            <span className="bg-white/30 text-white text-xs font-bold px-3 py-1 rounded-full">학령기 자녀</span>
          </div>
        </motion.button>

        {/* 나의 루틴 블록 */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/onboarding/parent')}
          className="w-full bg-gradient-to-r from-[#7EB8D4] to-[#A8E6CF] rounded-3xl p-5 text-left shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              <img
                src="/profile/mom.png"
                alt=""
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
              />
              <img
                src="/profile/dad.png"
                alt=""
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
              />
            </div>
            <div>
              <p className="text-2xl font-black text-white">나의 루틴</p>
              <p className="text-white/80 text-sm">엄마 · 아빠의 하루 루틴 관리</p>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <span className="bg-white/30 text-white text-xs font-bold px-3 py-1 rounded-full">엄마</span>
            <span className="bg-white/30 text-white text-xs font-bold px-3 py-1 rounded-full">아빠</span>
          </div>
        </motion.button>
      </motion.div>
    </div>
  )
}
