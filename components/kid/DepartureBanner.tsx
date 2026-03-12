/**
 * 등원/하원·기상·취침 카운트다운 배너 (아이 루틴 최상단)
 * 비개발자: 일어날 시간 → 집 나서는 시간 → 하원 시간 → 자러 갈 시간 순으로
 * 다음에 올 시간까지 남은 시간을 보여주고, 오른쪽에 시계(시간 설정) 버튼만 둡니다.
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useProfileStore } from '@/lib/stores/profileStore'
import { useKidRoutineStore, selectWakeAlarmTime, selectAlarmEnabled } from '@/lib/stores/kidRoutineStore'
import { ROUTINE_IMAGES } from '@/lib/utils/defaultRoutines'

const PHASES = [
  { key: 'wake', label: '일어날 시간', iconKey: 'morning' as const, timeKey: 'wakeTime' as const },
  { key: 'departure', label: '집 나서는 시간', iconKey: 'bus' as const, timeKey: 'departureTime' as const },
  { key: 'return', label: '하원 시간', iconKey: 'kindergarden_school' as const, timeKey: 'returnTime' as const },
  { key: 'bedtime', label: '자러 갈 시간', iconKey: 'sleep' as const, timeKey: 'bedtime' as const },
] as const

function parseTimeHHmm(s: string | null | undefined): Date | null {
  if (!s || !/^\d{1,2}:\d{2}$/.test(s)) return null
  const [h, m] = s.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d
}

function getRemaining(target: Date): { hours: number; minutes: number; seconds: number; passed: boolean } {
  const now = new Date()
  const diffMs = target.getTime() - now.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, passed: true }
  }
  return {
    hours: Math.floor(diffSec / 3600),
    minutes: Math.floor((diffSec % 3600) / 60),
    seconds: diffSec % 60,
    passed: false,
  }
}

function formatRemaining(r: { hours: number; minutes: number; seconds: number; passed: boolean }): string {
  if (r.passed) return '지금!'
  if (r.hours > 0) return `${r.hours}시간 ${r.minutes}분`
  if (r.minutes > 0) return `${r.minutes}분 ${r.seconds}초`
  return `${r.seconds}초`
}

/** variant: 'floating' = 화면 하단 고정, 'inline' = 최상단 배치 */
export function DepartureBanner({ variant = 'inline' }: { variant?: 'floating' | 'inline' }) {
  const { getActiveProfile } = useProfileStore()
  const profile = getActiveProfile()
  const wakeAlarmTime = useKidRoutineStore(selectWakeAlarmTime)

  const cs = profile?.childSettings
  const wakeTime = cs?.wakeTime ?? wakeAlarmTime ?? null
  const departureTime = cs?.departureTime ?? null
  const returnTime = cs?.returnTime ?? null
  const bedtime = cs?.bedtime ?? null

  const [remaining, setRemaining] = useState<{
    phaseIndex: number
    label: string
    iconSrc: string
    timeStr: string
    text: string
  } | null>(null)

  useEffect(() => {
    const times: (string | null)[] = [wakeTime, departureTime, returnTime, bedtime]
    const targets = times.map(parseTimeHHmm)

    const calc = () => {
      const now = new Date()
      let phaseIndex = -1
      let targetDate: Date | null = null

      for (let i = 0; i < targets.length; i++) {
        const t = targets[i]
        if (!t) continue
        if (t.getTime() > now.getTime()) {
          phaseIndex = i
          targetDate = t
          break
        }
      }

      if (phaseIndex === -1 || !targetDate) {
        setRemaining(null)
        return
      }

      const phase = PHASES[phaseIndex]
      const r = getRemaining(targetDate)
      const timeStr = times[phaseIndex] ?? ''
      const iconSrc = ROUTINE_IMAGES[phase.iconKey] ?? ROUTINE_IMAGES.wakeup
      setRemaining({
        phaseIndex,
        label: phase.label,
        iconSrc,
        timeStr,
        text: formatRemaining(r),
      })
    }

    calc()
    const interval = setInterval(calc, 1000)
    return () => clearInterval(interval)
  }, [wakeTime, departureTime, returnTime, bedtime])

  const isInline = variant === 'inline'
  const showBanner = remaining !== null || isInline

  if (!showBanner) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: isInline ? -8 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        bg-white/75 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-3 shadow-md border border-gray-200/80
        ${isInline ? 'mb-3' : 'fixed bottom-20 left-3 right-3 z-40 max-w-md mx-auto'}
      `}
    >
      {remaining ? (
        <>
          <div className="flex-shrink-0 w-10 h-10 relative">
            <Image
              src={remaining.iconSrc}
              alt=""
              fill
              className="object-contain"
              unoptimized
              onError={(e) => {
                const t = e.target as HTMLImageElement
                if (remaining.phaseIndex === 0 && t.src !== ROUTINE_IMAGES.wakeup) t.src = ROUTINE_IMAGES.wakeup
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-500 text-[11px] font-semibold">{remaining.label}</p>
            <p className="text-gray-800 font-black text-lg leading-tight">
              {remaining.text}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-gray-400 text-[10px]">목표</p>
            <p className="text-gray-700 font-bold text-sm">{remaining.timeStr}</p>
          </div>
        </>
      ) : (
        <div className="flex-1 min-w-0">
          <p className="text-gray-500 text-sm">오늘 설정된 시간이 없어요</p>
        </div>
      )}

      {/* 오른쪽: 시계(시간 설정) 아이콘만 표시, 블록 없음 */}
      <div className="flex items-center flex-shrink-0 pl-2 border-l border-gray-200/80">
        <Link
          href="/routine/kid/alarm"
          className="p-1 hover:opacity-80 transition-opacity"
          aria-label="시간 설정"
        >
          <Image
            src={ROUTINE_IMAGES.clock}
            alt=""
            width={36}
            height={36}
            className="w-9 h-9 object-contain"
            unoptimized
          />
        </Link>
      </div>
    </motion.div>
  )
}
