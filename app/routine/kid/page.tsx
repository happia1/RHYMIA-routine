/**
 * 아이용 루틴 메인 화면 (오늘 할 루틴 목록)
 * 비개발자: 낮에는 "오늘의 루틴" 카드를 보여주고, 밤(21시~06시)에는 캐릭터가 잠자는 화면을 보여줍니다.
 * 기상 시간이 되면 미션 화면으로 전환되며 알람이 울리고, 알람 설정은 별도 화면에서 할 수 있습니다.
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings } from 'lucide-react'
import { useKidRoutineStore, selectRoutines, selectWakeAlarmTime, selectAlarmEnabled, selectLastAlarmDismissedDate } from '@/lib/stores/kidRoutineStore'
import { useProfileStore } from '@/lib/stores/profileStore'
import { getTodayRoutines } from '@/lib/utils/defaultRoutines'
import { isNightTime, isWakeTimeNow } from '@/lib/utils/sleepSchedule'
import { SleepingView } from '@/components/kid/SleepingView'
import { WakeAlarmOverlay } from '@/components/kid/WakeAlarmOverlay'
import { DepartureBanner } from '@/components/kid/DepartureBanner'

/** 루틴 타입별 이모지·라벨·그라데이션 색 (카드 스타일용) */
const ROUTINE_TYPE_META = {
  morning: { emoji: '🌅', label: '아침 루틴', color: 'from-[#FFD93D] to-[#FF8FAB]' },
  evening: { emoji: '🌙', label: '저녁 루틴', color: 'from-[#A8E6CF] to-[#7EB8D4]' },
  weekend: { emoji: '🎉', label: '주말 루틴', color: 'from-[#FF8FAB] to-[#C77DFF]' },
  special: { emoji: '⭐', label: '특별 루틴', color: 'from-[#FFD93D] to-[#A8E6CF]' },
}

export default function KidRoutineMainPage() {
  const router = useRouter()
  const activeProfile = useProfileStore((s) => s.getActiveProfile())
  const setCurrentProfileId = useKidRoutineStore((s) => s.setCurrentProfileId)
  const routines = useKidRoutineStore(selectRoutines)
  const initRoutines = useKidRoutineStore((s) => s.initRoutines)
  const getCompletionRate = useKidRoutineStore((s) => s.getCompletionRate)
  const wakeAlarmTime = useKidRoutineStore(selectWakeAlarmTime)
  const alarmEnabled = useKidRoutineStore(selectAlarmEnabled)
  const lastAlarmDismissedDate = useKidRoutineStore(selectLastAlarmDismissedDate)
  const dismissAlarm = useKidRoutineStore((s) => s.dismissAlarm)

  // 현재 선택된 프로필 기준으로 루틴 데이터 사용 (프로필 전환 시 반영)
  useEffect(() => {
    setCurrentProfileId(activeProfile?.id ?? null)
  }, [activeProfile?.id, setCurrentProfileId])

  // 시간에 따라 밤/낮 전환을 위해 1분마다 리렌더
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 60000)
    return () => clearInterval(id)
  }, [])

  // 앱 들어올 때 / 프로필 전환 시 루틴 초기화·보정 (학령기면 학령기 기본 루틴)
  useEffect(() => {
    if (activeProfile?.id) initRoutines(activeProfile.role)
  }, [activeProfile?.id, activeProfile?.role, initRoutines])

  const night = isNightTime()
  const today = new Date().toISOString().split('T')[0]
  const showAlarm =
    !night &&
    alarmEnabled &&
    isWakeTimeNow(wakeAlarmTime) &&
    lastAlarmDismissedDate !== today

  // 밤 시간대: 캐릭터 잠자는 화면만 표시
  if (night) {
    return <SleepingView />
  }

  // 오늘 요일에 맞는 루틴만 (예: 평일=아침·저녁, 주말=주말 루틴)
  const todayRoutines = getTodayRoutines(routines)

  return (
    <div className="min-h-screen bg-[#FFF9F0] px-5 py-8 pb-24">
      {/* 기상 시간: 알람 오버레이 (알람 끄기 전까지 소리 + 화면) */}
      <AnimatePresence>
        {showAlarm && (
          <WakeAlarmOverlay
            onDismiss={dismissAlarm}
          />
        )}
      </AnimatePresence>

      {/* 알람 설정 링크 (우측 상단) */}
      <div className="flex justify-end mb-2">
        <Link
          href="/routine/kid/alarm"
          className="flex items-center gap-1 text-gray-400 hover:text-gray-600 text-sm"
        >
          <Settings className="w-4 h-4" />
          알람 설정
        </Link>
      </div>
      {/* 상단 인사 문구 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="text-6xl mb-3">🌟</div>
        <h1 className="text-3xl font-black text-gray-700">오늘의 루틴</h1>
        <p className="text-gray-400 mt-1">어떤 루틴을 할까요?</p>
      </motion.div>

      {/* 등원까지 남은 시간 카운트다운 (자녀 프로필 + 출발 시간 설정 시에만 표시) */}
      <DepartureBanner />

      {/* 루틴 카드 목록 (아침/저녁/주말 등) */}
      <div className="flex flex-col gap-4">
        {todayRoutines.map((routine, idx) => {
          const meta = ROUTINE_TYPE_META[routine.type] ?? ROUTINE_TYPE_META.special
          const rate = getCompletionRate(routine.id)
          const isDone = rate >= 1

          return (
            <motion.button
              key={routine.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push(`/routine/kid/${routine.id}`)}
              className={`
                relative w-full rounded-3xl p-6 text-left overflow-hidden
                bg-gradient-to-br ${meta.color}
                shadow-lg
              `}
            >
              <div className="flex items-center gap-4">
                <span className="text-5xl">{meta.emoji}</span>
                <div className="flex-1">
                  <p className="text-xl font-black text-white">{routine.title}</p>
                  <p className="text-white/80 text-sm mt-0.5">
                    {routine.items.length}개 항목
                  </p>
                </div>
                {isDone && <span className="text-3xl">✅</span>}
              </div>

              {/* 진행률 바 (오늘 이 루틴 몇 % 완료했는지) */}
              <div className="mt-4 h-2 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${rate * 100}%` }}
                />
              </div>
              <p className="text-white/70 text-xs mt-1 text-right">
                {Math.round(rate * 100)}% 완료
              </p>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
