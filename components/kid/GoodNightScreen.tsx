/**
 * 저녁 루틴 전부 완료 후 보여주는 "잘자요~" 화면
 * 비개발자: 마지막 미션 "잠자기"까지 끝내면 이 화면이 나와요. "잠들기"를 누르면 밤 모드(캐릭터 잠자는 화면)로 넘어갑니다.
 */

'use client'

import { motion } from 'framer-motion'
import { useTTS } from '@/lib/hooks/useTTS'

interface GoodNightScreenProps {
  onClose: () => void
}

export function GoodNightScreen({ onClose }: GoodNightScreenProps) {
  const { speak } = useTTS({ preset: 'kid' })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex flex-col items-center justify-center z-50 p-8"
    >
      {/* 달 + 별 배경 분위기 */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-8xl mb-4"
      >
        🌙
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex gap-4 text-4xl mb-6"
      >
        <span className="animate-pulse">✨</span>
        <span className="animate-pulse" style={{ animationDelay: '0.3s' }}>⭐</span>
        <span className="animate-pulse" style={{ animationDelay: '0.6s' }}>✨</span>
      </motion.div>

      {/* 잘자요 메시지 */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-3xl font-black text-white text-center mb-2"
        style={{ fontFamily: "'Nanum Round', sans-serif" }}
      >
        잘자요~ 😴
      </motion.h1>
      <motion.p
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-lg text-white/80 text-center mb-10"
      >
        내일 아침에 또 만나요!
      </motion.p>

      {/* 잠들기 버튼: 누르면 onClose → 목록(밤이면 잠자는 화면)으로 이동 */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          speak('좋은 꿈 꿔요~')
          onClose()
        }}
        className="bg-white/20 text-white font-bold text-xl px-10 py-4 rounded-full border-2 border-white/40"
      >
        잠들기 🌙
      </motion.button>
    </motion.div>
  )
}
