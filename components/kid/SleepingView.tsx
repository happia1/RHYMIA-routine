/**
 * 밤 시간대에 보여주는 "캐릭터가 잠자는" 화면
 * 비개발자: 새벽 시간에는 이 화면만 보여요. 아침 기상 시간이 되면 미션 화면으로 바뀌고 알람이 울립니다.
 * 잠자는 달님 이미지(floatingmoon.png)에 플로팅 효과를 적용해 표시합니다.
 */

'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export function SleepingView() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] flex flex-col items-center justify-center p-8">
      {/* 별 반짝임 — 배경은 그대로 유지 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute text-2xl text-white/60"
            style={{
              left: `${10 + (i * 8)}%`,
              top: `${15 + (i % 5) * 15}%`,
            }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
          >
            ✨
          </motion.span>
        ))}
      </div>

      {/* 잠자는 달님 이미지 — 플로팅 효과(위아래 부드럽게 흔들림) */}
      <motion.div
        className="relative mb-6"
        animate={{
          y: [0, -14, 0],
          rotate: [-1, 1, -1],
        }}
        transition={{
          y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <Image
          src="/routine-icons/floatingmoon.png"
          alt="잠자는 달님"
          width={160}
          height={160}
          className="object-contain"
          priority
        />
      </motion.div>

      <motion.p
        className="text-white/70 text-lg"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        zZz... 좋은 꿈 꿔요~
      </motion.p>
      <p className="text-white/40 text-sm mt-4">
        아침에 알람이 울리면 만나요!
      </p>
    </div>
  )
}
