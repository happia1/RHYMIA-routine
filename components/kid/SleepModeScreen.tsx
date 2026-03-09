/**
 * 수면 모드 화면 — 다크 배경 + 별 반짝임 + 유성 애니메이션
 * 비개발자: 저녁 루틴 "잠자러 가기" 완료 후 잠들기 탭 시 보여요. 화면 탭하면 깨어나요.
 */

'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useKidRoutineStore } from '@/lib/stores/kidRoutineStore'

interface SleepModeScreenProps {
  onWake: () => void
}

const FIXED_STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: (i * 37 + 11) % 100,
  y: (i * 53 + 7) % 60,
  size: 2 + (i % 4),
  delay: (i * 0.17) % 3,
  duration: 1.8 + (i % 5) * 0.4,
}))

const SHOOTING_STARS = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  startX: 15 + i * 14,
  delay: i * 1.8 + 0.5,
  duration: 1.2 + (i % 3) * 0.4,
}))

export function SleepModeScreen({ onWake }: SleepModeScreenProps) {
  const { checkAndReset } = useKidRoutineStore()
  const resetScheduledRef = useRef(false)

  useEffect(() => {
    if (resetScheduledRef.current) return
    resetScheduledRef.current = true
    const now = new Date()
    const midnight = new Date(now)
    midnight.setHours(24, 0, 0, 0)
    const msUntilMidnight = midnight.getTime() - now.getTime()
    const t = setTimeout(() => {
      checkAndReset()
    }, Math.max(0, msUntilMidnight))
    return () => clearTimeout(t)
  }, [checkAndReset])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
      className="fixed inset-0 z-50 overflow-hidden select-none"
      style={{
        background: 'linear-gradient(180deg, #050510 0%, #0d0d2b 40%, #1a0a2e 70%, #0d0820 100%)',
      }}
      onClick={onWake}
    >
      {FIXED_STARS.map((star) => (
        <motion.div
          key={`fixed-${star.id}`}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{ opacity: [0.1, 0.9, 0.1] }}
          transition={{
            repeat: Infinity,
            duration: star.duration,
            delay: star.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {SHOOTING_STARS.map((s) => (
        <motion.div
          key={`shoot-${s.id}`}
          className="absolute pointer-events-none"
          style={{ left: `${s.startX}%`, top: '-4px' }}
          initial={{ y: -10, x: 0, opacity: 0 }}
          animate={{
            y: ['0vh', '110vh'],
            x: ['0vw', '20vw'],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: s.duration,
            delay: s.delay,
            repeatDelay: 4 + s.id * 1.2,
            ease: 'easeIn',
          }}
        >
          <div className="relative">
            <div
              className="w-1.5 h-1.5 rounded-full bg-white shadow-lg"
              style={{ boxShadow: '0 0 6px 2px rgba(255,255,255,0.8)' }}
            />
            <div
              className="absolute top-0.5 right-1.5 origin-right w-10 h-1.5"
              style={{
                background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 100%)',
                transform: 'rotate(45deg)',
              }}
            />
          </div>
        </motion.div>
      ))}

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* 중앙 잠자는 달님 이미지 — 플로팅 효과 */}
        <motion.div
          className="relative mb-8"
          initial={{ y: 40, opacity: 0 }}
          animate={{
            y: [0, 0, -12, 0],
            opacity: 1,
          }}
          transition={{
            opacity: { delay: 1, type: 'spring', stiffness: 120 },
            y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 },
          }}
        >
          {[
            { text: 'z', size: 'text-2xl', offsetX: 40, offsetY: -20, delay: 1.5 },
            { text: 'Z', size: 'text-3xl', offsetX: 60, offsetY: -50, delay: 2.1 },
            { text: 'Z', size: 'text-4xl', offsetX: 80, offsetY: -85, delay: 2.7 },
          ].map((z, i) => (
            <motion.span
              key={i}
              className={`absolute ${z.size} font-black text-white/50`}
              style={{ left: z.offsetX, top: z.offsetY }}
              animate={{ opacity: [0, 0.7, 0], y: [0, -20] }}
              transition={{ repeat: Infinity, duration: 2.4, delay: z.delay, repeatDelay: 0.6 }}
            >
              {z.text}
            </motion.span>
          ))}
          <motion.div
            className="relative"
            animate={{ y: [0, -8, 0], rotate: [-1, 1, -1] }}
            transition={{
              y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
              rotate: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            <Image
              src="/routine-icons/floatingmoon.png"
              alt="잠자는 달님"
              width={120}
              height={120}
              className="object-contain"
              priority
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="text-center px-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <p className="text-white font-black text-3xl mb-2">잘 자요! 🌟</p>
          <p className="text-white/40 text-base">오늘도 정말 잘했어요</p>
          <p className="text-white/40 text-sm mt-1">아침 루틴이 다시 시작될 거예요</p>
        </motion.div>

        <motion.div
          className="flex gap-3 mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          {['✦', '✧', '★', '✧', '✦'].map((s, i) => (
            <motion.span
              key={i}
              className="text-white/20 text-sm"
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
            >
              {s}
            </motion.span>
          ))}
        </motion.div>

        <motion.p
          className="absolute bottom-12 text-white/20 text-sm"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          화면을 탭하면 깨어나요
        </motion.p>
      </div>
    </motion.div>
  )
}
