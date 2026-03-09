/**
 * 미션별 개별 카운트다운 타이머 (원형 진행 표시)
 * 비개발자: 미션 카드 옆 원형 타이머를 탭하면 카운트다운이 시작되고, 30초/10초 남을 때 색상 변화 + TTS "서둘러요!" 경고가 나옵니다.
 */

'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTTS } from '@/lib/hooks/useTTS'
import { TTS_SCRIPTS } from '@/lib/hooks/useTTSMessages'

interface MissionTimerProps {
  /** 제한 시간 (초) */
  totalSeconds: number
  /** 타이머가 지금 돌아가고 있는지 */
  isRunning: boolean
  /** 시간 종료 시 호출 (예: TTS "시간이 다 됐어요!") */
  onTimeUp: () => void
  /** 미션 이름 (타이머 아래 작게 표시) */
  label: string
}

export function MissionTimer({ totalSeconds, isRunning, onTimeUp, label }: MissionTimerProps) {
  const { speak } = useTTS({ preset: 'kid' })
  const [remaining, setRemaining] = useState(totalSeconds)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasWarned30 = useRef(false)
  const hasWarned10 = useRef(false)

  // 제한 시간이 바뀌면 남은 시간 리셋
  useEffect(() => {
    setRemaining(totalSeconds)
    hasWarned30.current = false
    hasWarned10.current = false
  }, [totalSeconds])

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          onTimeUp()
          return 0
        }
        // 30초 남았을 때 경고 TTS (귀여운 여자아이 목소리)
        if (prev === 31 && !hasWarned30.current) {
          hasWarned30.current = true
          speak(TTS_SCRIPTS.timerWarning)
        }
        // 10초 남았을 때 다시 경고 TTS
        if (prev === 11 && !hasWarned10.current) {
          hasWarned10.current = true
          speak(TTS_SCRIPTS.timerWarning)
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, onTimeUp, speak])

  const pct = remaining / totalSeconds
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const isUrgent = remaining <= 30
  const isDanger = remaining <= 10

  // SVG 원형 진행률용 (반지름 28)
  const circumference = 2 * Math.PI * 28

  return (
    <div className="flex flex-col items-center gap-1">
      {/* 원형 타이머 */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" width="80" height="80">
          {/* 배경 원 (회색) */}
          <circle cx="40" cy="40" r="28" fill="none" stroke="#F3F4F6" strokeWidth="6" />
          {/* 진행 원 (남은 시간에 따라 색상: 기본 핑크 → 30초 오렌지 → 10초 빨강) */}
          <motion.circle
            cx="40"
            cy="40"
            r="28"
            fill="none"
            stroke={isDanger ? '#EF4444' : isUrgent ? '#F97316' : '#FF8FAB'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct)}
            transition={{ duration: 0.5 }}
          />
        </svg>

        {/* 시간 숫자 (분:초 또는 초만) */}
        <motion.span
          className={`text-base font-black z-10 ${isDanger ? 'text-red-500' : isUrgent ? 'text-orange-500' : 'text-gray-600'}`}
          animate={isDanger ? { scale: [1, 1.2, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.5 }}
        >
          {mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${secs}s`}
        </motion.span>
      </div>

      {/* 미션명 (작게) */}
      <p className="text-xs text-gray-400 font-medium text-center max-w-[80px] truncate">{label}</p>

      {/* 30초/10초 남았을 때 "서둘러요!" / "빨리!" 배지 */}
      <AnimatePresence>
        {isUrgent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isDanger ? 'bg-red-100 text-red-500' : 'bg-orange-100 text-orange-500'
            }`}
          >
            {isDanger ? '⚡ 빨리!' : '⏰ 서둘러요!'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
