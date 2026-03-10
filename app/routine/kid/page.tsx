/**
 * 아이용 루틴 메인 화면 (오늘 할 루틴 목록)
 * 비개발자: 낮에는 "오늘의 루틴" 카드를 보여주고, 밤(21시~06시)에는 캐릭터가 잠자는 화면을 보여줍니다.
 * 기상 시간이 되면 미션 화면으로 전환되며 알람이 울리고, 알람 설정은 별도 화면에서 할 수 있습니다.
 */

'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings } from 'lucide-react'
import { useKidRoutineStore, selectRoutines, selectWakeAlarmTime, selectAlarmEnabled, selectLastAlarmDismissedDate } from '@/lib/stores/kidRoutineStore'
import { useProfileStore } from '@/lib/stores/profileStore'
import { useMilestoneStore } from '@/lib/stores/milestoneStore'
import type { Milestone } from '@/lib/stores/milestoneStore'
import { getTodayRoutines } from '@/lib/utils/defaultRoutines'

/** getSnapshot 무한루프 방지: 빈 마일스톤 배열은 항상 같은 참조 반환 */
const EMPTY_MILESTONES: Milestone[] = []
import { isNightTime, isWakeTimeNow, isMorningTime, isEveningTime } from '@/lib/utils/sleepSchedule'
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

/** useSearchParams 사용 본문 (Suspense 경계 안에서만 렌더) */
function KidRoutineMainContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeProfile = useProfileStore((s) => s.getActiveProfile())
  const setCurrentProfileId = useKidRoutineStore((s) => s.setCurrentProfileId)
  const routines = useKidRoutineStore(selectRoutines)
  const initRoutines = useKidRoutineStore((s) => s.initRoutines)
  const hasShownReward = useKidRoutineStore((s) => s.hasShownReward)
  const getCompletionRate = useKidRoutineStore((s) => s.getCompletionRate)
  const wakeAlarmTime = useKidRoutineStore(selectWakeAlarmTime)
  const alarmEnabled = useKidRoutineStore(selectAlarmEnabled)
  const lastAlarmDismissedDate = useKidRoutineStore(selectLastAlarmDismissedDate)
  const dismissAlarm = useKidRoutineStore((s) => s.dismissAlarm)
  // 마일스톤 블록: 현재 자녀 프로필 기준 달성 현황 (루틴 페이지에서 바로 마일스톤 진입 가능). 셀렉터는 안정 참조만 반환해 무한루프 방지
  const profileId = activeProfile?.id ?? null
  const milestones = useMilestoneStore((s) =>
    profileId ? (s.byProfile[profileId] ?? EMPTY_MILESTONES) : EMPTY_MILESTONES
  )
  const achievedCount = milestones.filter((m) => m.isAchieved).length

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

  // 아침/저녁 시간대에는 해당 루틴 실행 화면으로 자동 이동. 아침 보상 이미 봤으면 저녁 루틴으로 (무한루프 방지)
  // 단, "목록 보기"로 돌아온 경우(?list=1)에는 자동 이동하지 않고 목록을 보여줌
  const forceShowList = searchParams.get('list') === '1'
  const morningRoutine = todayRoutines.find((r) => r.type === 'morning')
  const eveningRoutine = todayRoutines.find((r) => r.type === 'evening')
  let autoRedirectTarget: string | null = null
  if (!forceShowList) {
    if (isEveningTime() && eveningRoutine) {
      autoRedirectTarget = eveningRoutine.id
    } else if (isMorningTime() && morningRoutine) {
      if (hasShownReward(morningRoutine.id) && eveningRoutine) {
        autoRedirectTarget = eveningRoutine.id
      } else {
        autoRedirectTarget = morningRoutine.id
      }
    }
  }
  const shouldAutoShowMorning = autoRedirectTarget === morningRoutine?.id
  const shouldAutoShowEvening = autoRedirectTarget === eveningRoutine?.id

  useEffect(() => {
    if (autoRedirectTarget) {
      router.replace(`/routine/kid/${autoRedirectTarget}`)
    }
  }, [autoRedirectTarget, router])

  // 자동으로 루틴 화면으로 넘어가는 중일 때는 목록 대신 잠깐 로딩 표시 (목록이 깜빡 보이지 않도록)
  if (autoRedirectTarget) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-3 animate-pulse">
            {shouldAutoShowMorning ? '🌅' : '🌙'}
          </div>
          <p className="text-gray-500 font-medium">루틴 불러오는 중...</p>
        </div>
      </div>
    )
  }

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

      {/* 칭찬 스티커 · 나의 펫 · 마일스톤 바로가기 (마일스톤은 루틴 페이지에서 바로 진입) */}
      <div className="flex gap-3 mb-6">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/routine/kid/sticker')}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white border-2 border-[#FFD93D] shadow-sm"
        >
          <span className="text-2xl">⭐</span>
          <span className="text-sm font-black text-gray-700">칭찬 스티커</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/routine/kid/pet')}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white border-2 border-[#A8E6CF] shadow-sm"
        >
          <span className="text-2xl">🐾</span>
          <span className="text-sm font-black text-gray-700">나의 펫</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/routine/kid/milestone')}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white border-2 border-[#FF8FAB] shadow-sm"
        >
          <span className="text-2xl">🏆</span>
          <span className="text-sm font-black text-gray-700">
            마일스톤{milestones.length > 0 ? ` ${achievedCount}/${milestones.length}` : ''}
          </span>
        </motion.button>
      </div>

      {/* 루틴 카드 목록: 1:1 비율 — 왼쪽 해/달 이미지, 오른쪽 루틴명·항목 수·완료율 */}
      <div className="grid grid-cols-2 gap-3">
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
                relative w-full rounded-2xl overflow-hidden text-left
                bg-gradient-to-br ${meta.color}
                shadow-lg min-h-[140px] flex flex-row
              `}
            >
              {/* 왼쪽 50%: 해(아침) / 달(저녁) 등 루틴 타입 아이콘 */}
              <div className="w-1/2 flex-shrink-0 flex items-center justify-center bg-white/20 min-h-[140px]">
                <span
                  className="text-5xl sm:text-6xl drop-shadow-md"
                  aria-hidden
                >
                  {meta.emoji}
                </span>
              </div>

              {/* 오른쪽 50%: 루틴명, 항목 수, 완료율 */}
              <div className="w-1/2 flex-shrink-0 flex flex-col justify-center p-3 min-w-0">
                <p className="text-sm font-black text-white leading-tight truncate">
                  {routine.title}
                </p>
                <p className="text-white/90 text-xs mt-0.5">
                  {routine.items.length}개 항목
                </p>
                <div className="mt-2 h-1.5 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${rate * 100}%` }}
                  />
                </div>
                <p className="text-white font-bold text-xs mt-1">
                  {Math.round(rate * 100)}% 완료
                  {isDone && <span className="ml-1">✅</span>}
                </p>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

/** 자녀 루틴 메인 페이지: useSearchParams를 Suspense로 감싸 정적 생성 시 오류 방지 */
export default function KidRoutineMainPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      }
    >
      <KidRoutineMainContent />
    </Suspense>
  )
}
