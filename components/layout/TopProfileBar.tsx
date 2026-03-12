/**
 * 화면 최상단 프로필 바 — 뒤로가기(홈), 일어날/집나서는/하원/자러갈 시간 카운트다운, 시계(시간설정)·알림·프로필
 * 비개발자: 일어날 시간 바 내용을 상단바에 모두 넣었어요. 다음에 올 시간까지 남은 시간과 목표 시각이 보여요.
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeft, Bell, Users } from 'lucide-react'
import { useProfileStore } from '@/lib/stores/profileStore'
import { useKidRoutineStore, selectWakeAlarmTime } from '@/lib/stores/kidRoutineStore'
import { getProfileImageSrc } from '@/types/profile'
import { ROUTINE_IMAGES } from '@/lib/utils/defaultRoutines'
import { ProfileSwitchSheet } from './ProfileSwitchSheet'
import { motion } from 'framer-motion'

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
  if (diffSec <= 0) return { hours: 0, minutes: 0, seconds: 0, passed: true }
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

export function TopProfileBar() {
  const router = useRouter()
  const pathname = usePathname()
  /** 홈 화면(/)일 때는 뒤로가기 버튼을 비활성화 (이미 홈이므로 갈 곳이 없음) */
  const isHome = pathname === '/'
  const [sheetOpen, setSheetOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const activeProfile = useProfileStore((state) => {
    if (!mounted) return null
    const p = state.profiles.find((pr) => pr.id === state.activeProfileId)
    return p ?? null
  })
  const wakeAlarmTime = useKidRoutineStore(selectWakeAlarmTime)
  const cs = activeProfile?.childSettings
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
    setMounted(true)
  }, [])

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
      setRemaining({
        phaseIndex,
        label: phase.label,
        iconSrc: ROUTINE_IMAGES[phase.iconKey] ?? ROUTINE_IMAGES.wakeup,
        timeStr: times[phaseIndex] ?? '',
        text: formatRemaining(r),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [wakeTime, departureTime, returnTime, bedtime])

  const goToHome = () => router.push('/')

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center gap-2 px-3 py-2.5 bg-[#FFF9F0]/95 backdrop-blur-sm border-b border-gray-100/80 pt-safe">
        {/* 왼쪽: 뒤로가기 — 홈으로 (홈 화면에서는 비활성화) */}
        <button
          type="button"
          onClick={isHome ? undefined : goToHome}
          disabled={isHome}
          aria-label="홈으로 가기"
          className={`p-1.5 -ml-0.5 rounded-xl transition-colors flex-shrink-0 ${
            isHome
              ? 'text-gray-300 cursor-default pointer-events-none'
              : 'text-gray-600 hover:bg-white/80 hover:text-amber-600'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* 가운데: 일어날 시간 바 내용 (아이콘 + 라벨/남은시간 + 목표 시각) */}
        <div className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden">
          {remaining ? (
            <>
              <div className="flex-shrink-0 w-8 h-8 relative">
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
                <p className="text-gray-500 text-[10px] font-semibold truncate">{remaining.label} ({remaining.timeStr})</p>
                <p className="text-gray-800 font-black text-sm leading-tight truncate">{remaining.text}</p>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-xs truncate">오늘 설정된 시간이 없어요</p>
          )}
        </div>

        {/* 오른쪽: 알림 · 프로필 */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => router.push('/routine/kid/alarm')}
            aria-label="알림 설정"
            className="p-1.5 rounded-xl text-gray-600 hover:bg-white/80 hover:text-amber-600 transition-colors"
          >
            <Bell className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            aria-label="프로필"
            className="p-1 rounded-xl hover:bg-white/80 transition-colors"
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center text-lg"
              style={{
                backgroundColor: activeProfile ? activeProfile.avatarColor + '33' : '#F3F4F6',
              }}
            >
              {activeProfile ? (
                getProfileImageSrc(activeProfile) ? (
                  <img
                    src={getProfileImageSrc(activeProfile)!}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  activeProfile.avatarEmoji
                )
              ) : (
                <Users className="w-4 h-4 text-gray-400" />
              )}
            </motion.div>
          </button>
        </div>
      </header>

      <ProfileSwitchSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  )
}
