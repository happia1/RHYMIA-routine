/**
 * 루틴 전부 완료 시 보여주는 보상/축하 화면
 * 비개발자: 아이가 오늘 루틴을 다 끝내면 폭죽·꽃다발 축하 이미지 + 컨페티 터짐 + 효과음 + "대단해요!" 메시지 + 포인트/연속일수 표시 후 "완료!" 버튼으로 닫습니다.
 */

'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import NextImage from 'next/image'
import confetti from 'canvas-confetti'
import { useTTS } from '@/lib/hooks/useTTS'
import { TTS_SCRIPTS } from '@/lib/hooks/useTTSMessages'

/** 효과음 파일 경로 (public/sounds에 mixkit-magic-festive-melody-2986.wav를 넣어주세요) */
const CELEBRATION_SOUND_PATH = '/sounds/mixkit-magic-festive-melody-2986.wav'

interface RewardScreenProps {
  pointsEarned: number
  streakDays: number
  onClose: () => void
}

export function RewardScreen({ pointsEarned, streakDays, onClose }: RewardScreenProps) {
  const { speak } = useTTS({ preset: 'kid' })
  const soundPlayedRef = useRef(false)

  useEffect(() => {
    // 1) 효과음 재생 (한 번만, 사용자가 public/sounds에 wav 파일을 넣어두면 재생됨)
    if (!soundPlayedRef.current && typeof window !== 'undefined') {
      soundPlayedRef.current = true
      const audio = new Audio(CELEBRATION_SOUND_PATH)
      audio.volume = 0.7
      audio.play().catch(() => {
        // 파일이 없거나 자동 재생 정책으로 실패해도 화면은 정상 표시
      })
    }

    // 2) 컨페티 터짐 효과: 중앙에서 한 번 크게 터뜨린 뒤, 양쪽에서 계속 터뜨리기
    const duration = 2500
    const end = Date.now() + duration
    // 중앙에서 폭죽처럼 터지는 컨페티 (한 번)
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#FFD93D', '#FF8FAB', '#7EB8D4', '#A8E6CF', '#C77DFF', '#FFB347'],
    })
    const frame = () => {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 } })
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 } })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()

    // 3) TTS로 전체 완료 축하 문장 (밝은 여자아이 목소리)
    speak(TTS_SCRIPTS.allDone)
  }, [speak])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-gradient-to-b from-[#FFD93D] to-[#FF8FAB] flex flex-col items-center justify-center z-50 p-6 overflow-hidden"
    >
      {/* 축하 이미지: 폭죽 + 꽃다발 (루틴 완료 축하 분위기) */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
        className="w-full max-w-[280px] aspect-[4/3] relative rounded-2xl overflow-hidden shadow-2xl mb-4 flex-shrink-0"
      >
        <NextImage
          src="/images/celebration.png"
          alt="루틴 완료 축하 - 폭죽과 꽃다발"
          fill
          className="object-contain"
          priority
          unoptimized
        />
      </motion.div>

      {/* 트로피 이모지 (스프링 애니메이션) - 이미지 아래 작게 */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
        className="text-5xl mb-2"
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
