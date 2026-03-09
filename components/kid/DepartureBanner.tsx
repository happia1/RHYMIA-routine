/**
 * 등원 카운트다운 배너 (아이 루틴 메인 상단)
 * 비개발자: 활성 프로필이 자녀이고 "집 나서는 시간"이 설정돼 있으면, 그 시간까지 남은 시간을 보여줘요. 30분 이하면 주황, 10분 이하면 빨강+흔들림.
 */

'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useProfileStore } from '@/lib/stores/profileStore'

export function DepartureBanner() {
  const { getActiveProfile } = useProfileStore()
  const profile = getActiveProfile()
  const departureTime = profile?.childSettings?.departureTime
  const arrivalTime = profile?.childSettings?.arrivalTime
  const returnTime = profile?.childSettings?.returnTime

  const [remaining, setRemaining] = useState<{
    hours: number
    minutes: number
    seconds: number
    isUrgent: boolean
    isDanger: boolean
    isPassed: boolean
  } | null>(null)

  useEffect(() => {
    if (!departureTime) return

    const calc = () => {
      const now = new Date()
      const [h, m] = departureTime.split(':').map(Number)
      const target = new Date()
      target.setHours(h, m, 0, 0)

      const diffMs = target.getTime() - now.getTime()
      const diffSec = Math.floor(diffMs / 1000)

      if (diffSec < -3600) {
        setRemaining(null)
        return
      }

      if (diffSec < 0) {
        setRemaining({
          hours: 0,
          minutes: 0,
          seconds: 0,
          isUrgent: true,
          isDanger: true,
          isPassed: true,
        })
        return
      }

      setRemaining({
        hours: Math.floor(diffSec / 3600),
        minutes: Math.floor((diffSec % 3600) / 60),
        seconds: diffSec % 60,
        isUrgent: diffSec <= 1800,
        isDanger: diffSec <= 600,
        isPassed: false,
      })
    }

    calc()
    const interval = setInterval(calc, 1000)
    return () => clearInterval(interval)
  }, [departureTime])

  if (!departureTime || !remaining) return null

  const bgGradient = remaining.isDanger
    ? 'from-red-400 to-orange-400'
    : remaining.isUrgent
      ? 'from-orange-400 to-yellow-400'
      : 'from-[#7EB8D4] to-[#A8E6CF]'

  const timeStr = remaining.isPassed
    ? '출발 시간이에요!'
    : remaining.hours > 0
      ? `${remaining.hours}시간 ${remaining.minutes}분`
      : remaining.minutes > 0
        ? `${remaining.minutes}분 ${remaining.seconds}초`
        : `${remaining.seconds}초`

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mx-5 mb-4 bg-gradient-to-r ${bgGradient} rounded-3xl p-4 flex items-center gap-4 shadow-md`}
    >
      <motion.div
        className="text-4xl"
        animate={remaining.isDanger ? { x: [0, 3, -3, 0] } : {}}
        transition={{ repeat: Infinity, duration: 0.4 }}
      >
        🚌
      </motion.div>

      <div className="flex-1">
        <p className="text-white/80 text-xs font-semibold">
          {remaining.isPassed ? '🚨 지금 출발하세요!' : '집 나서는 시간까지'}
        </p>
        <motion.p
          className="text-white font-black text-2xl"
          animate={remaining.isDanger ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.8 }}
        >
          {remaining.isPassed ? '빨리요! 🏃' : timeStr}
        </motion.p>
      </div>

      <div className="text-right">
        <p className="text-white/60 text-xs">출발</p>
        <p className="text-white font-black text-lg">{departureTime}</p>
        {(arrivalTime || returnTime) && (
          <div className="flex gap-3 mt-2 text-white/70 text-xs flex-wrap justify-end">
            {arrivalTime && <span>🏫 등원 {arrivalTime}</span>}
            {returnTime && <span>🏠 하원 {returnTime}</span>}
          </div>
        )}
      </div>
    </motion.div>
  )
}
