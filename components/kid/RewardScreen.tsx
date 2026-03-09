/**
 * 루틴 전부 완료 시 보여주는 보상/축하 화면
 * 비개발자: 아이가 오늘 루틴을 다 끝내면 컨페티 + "대단해요!" 메시지 + 포인트/연속일수 표시 후 "완료!" 버튼으로 닫습니다.
 */

'use client'

import { motion } from 'framer-motion'
import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { useTTS } from '@/lib/hooks/useTTS'
import { TTS_SCRIPTS } from '@/lib/hooks/useTTSMessages'

interface RewardScreenProps {
  pointsEarned: number
  streakDays: number
  onClose: () => void
}

export function RewardScreen({ pointsEarned, streakDays, onClose }: RewardScreenProps) {
  const { speak } = useTTS({ preset: 'kid' })

  useEffect(() => {
    // 화면 열리자마자 양쪽에서 컨페티 터뜨리기 (약 2.5초 동안 반복)
    const end = Date.now() + 2500
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 } })
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 } })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()

    // TTS로 전체 완료 축하 문장 (밝은 여자아이 목소리)
    speak(TTS_SCRIPTS.allDone)
  }, [speak])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-gradient-to-b from-[#FFD93D] to-[#FF8FAB] flex flex-col items-center justify-center z-50 p-8"
    >
      {/* 트로피 이모지 (스프링 애니메이션) */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className="text-9xl mb-6"
      >
        🏆
      </motion.div>

      {/* 축하 제목 */}
      <motion.h1
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-4xl font-black text-white text-center mb-2 drop-shadow-lg"
        style={{ fontFamily: "'Nanum Round', sans-serif" }}
      >
        대단해요! 🎉
      </motion.h1>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xl text-white/90 text-center mb-8"
      >
        오늘 루틴을 모두 완료했어요!
      </motion.p>

      {/* 획득 포인트 + 연속 달성 일수 */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.6, type: 'spring' }}
        className="bg-white/30 rounded-3xl px-8 py-5 flex gap-8 mb-8"
      >
        <div className="text-center">
          <p className="text-3xl font-black text-white">+{pointsEarned}</p>
          <p className="text-sm text-white/80">포인트</p>
        </div>
        <div className="w-px bg-white/40" />
        <div className="text-center">
          <p className="text-3xl font-black text-white">{streakDays}일</p>
          <p className="text-sm text-white/80">연속 달성 🔥</p>
        </div>
      </motion.div>

      {/* 완료 버튼: 누르면 onClose 호출 → 메인으로 이동 */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClose}
        className="bg-white text-[#FF8FAB] font-black text-xl px-12 py-4 rounded-full shadow-xl"
      >
        완료! ✨
      </motion.button>
    </motion.div>
  )
}
