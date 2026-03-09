/**
 * 아이용 루틴 "실행" 페이지 (미션 컨펌 플로우 + 개별 타이머)
 * 비개발자: 아침/저녁 루틴을 선택하면 이 화면에서 미션 카드를 하나씩 진행합니다.
 * - 미션 카드 옆 원형 타이머 탭 → 개별 카운트다운 시작 (30초/10초 남으면 색상 변화 + TTS "서둘러요!")
 * - 미션 카드 탭 → 축하 팝업 2초 → 카드 흐릿하게 "엄마/아빠 확인 중"
 * - 부모가 승인하면 카드 "펑" 사라짐, 거절하면 원상복귀. 전체 완료 시 컨페티 + 보상 화면
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react'
import { useKidRoutineStore, selectRewardPoints } from '@/lib/stores/kidRoutineStore'
import { useProfileStore } from '@/lib/stores/profileStore'
import { RoutineItem } from '@/types/routine'
import { useTTS } from '@/lib/hooks/useTTS'
import { TTS_SCRIPTS } from '@/lib/hooks/useTTSMessages'
import { MissionCompletePopup } from '@/components/kid/MissionCompletePopup'
import { MissionTimer } from '@/components/kid/MissionTimer'
import { RoutineItemIcon } from '@/components/kid/RoutineItemIcon'
import { RewardScreen } from '@/components/kid/RewardScreen'
import { GoodNightScreen } from '@/components/kid/GoodNightScreen'
import { SleepModeScreen } from '@/components/kid/SleepModeScreen'
import { ROUTINE_IMAGES, LABEL_TO_IMAGE_KEY } from '@/lib/utils/defaultRoutines'

// 미션 카드 상태: idle=미완료, pending=부모 확인 대기(흐릿), approved=승인완료(사라짐)
type ItemState = 'idle' | 'pending' | 'approved'

interface MissionCardProps {
  item: RoutineItem
  state: ItemState
  isActive: boolean
  onTap: (item: RoutineItem) => void
  onTimerStart: (itemId: string) => void
  onTimeUp: (itemId: string) => void
}

/** 미션 카드 한 장: idle(탭 가능 + 타이머) / pending(흐릿 + 확인 중) / approved(exit 시 사라짐) */
function MissionCard({ item, state, isActive, onTap, onTimerStart, onTimeUp }: MissionCardProps) {
  return (
    <AnimatePresence mode="wait">
      {state !== 'approved' && (
        <motion.div
          key={item.id}
          layout
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{
            opacity: state === 'pending' ? 0.55 : 1,
            scale: 1,
            y: 0,
            filter: state === 'pending' ? 'grayscale(0.4)' : 'none',
          }}
          exit={{
            scale: [1, 1.15, 0],
            opacity: [1, 1, 0],
            rotate: [0, -5, 10],
            transition: { duration: 0.5, ease: 'easeInOut' },
          }}
          whileTap={state === 'idle' ? { scale: 0.95 } : {}}
          onClick={() => state === 'idle' && onTap(item)}
          className={`
            relative flex items-center gap-4 p-5 rounded-3xl
            ${state === 'idle'
              ? 'bg-white shadow-lg shadow-pink-100 border-2 border-pink-50 cursor-pointer'
              : 'bg-gray-100 border-2 border-gray-200 cursor-not-allowed'
            }
          `}
        >
          <div className="w-16 h-16 rounded-2xl bg-[#FFF9F0] flex-shrink-0 flex items-center justify-center overflow-hidden">
            <RoutineItemIcon item={item} className="w-16 h-16" imageClassName="w-12 h-12 object-contain" />
          </div>

          <div className="flex-1 min-w-0">
            <p className={`text-xl font-black ${state === 'pending' ? 'text-gray-400' : 'text-gray-700'}`}>
              {item.label}
            </p>
            {state === 'pending' && (
              <motion.p
                className="text-xs text-amber-500 font-semibold mt-0.5 flex items-center gap-1"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              >
                ⏳ 엄마/아빠 확인 중...
              </motion.p>
            )}
            {state === 'idle' && (
              <p className="text-sm text-gray-400 mt-0.5">{item.ttsText}</p>
            )}
          </div>

          {/* 타이머 (idle이고, 타이머가 설정된 미션만 표시) */}
          {state === 'idle' && (item.timerEnabled ?? (item.timerSeconds ?? 0) > 0) && (
            <div
              onClick={(e) => { e.stopPropagation(); onTimerStart(item.id) }}
              className="flex-shrink-0"
            >
              <MissionTimer
                totalSeconds={item.timerSeconds || 0}
                isRunning={isActive}
                onTimeUp={() => onTimeUp(item.id)}
                label={item.label}
              />
            </div>
          )}

          {state === 'pending' && (
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-xl">⏳</span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function KidRoutineExecutePage() {
  const params = useParams()
  const router = useRouter()
  const routineId = params.routineId as string

  const activeProfile = useProfileStore((s) => s.getActiveProfile())
  const setCurrentProfileId = useKidRoutineStore((s) => s.setCurrentProfileId)
  const initRoutines = useKidRoutineStore((s) => s.initRoutines)
  const setActiveRoutine = useKidRoutineStore((s) => s.setActiveRoutine)
  const requestConfirm = useKidRoutineStore((s) => s.requestConfirm)
  const getActiveRoutine = useKidRoutineStore((s) => s.getActiveRoutine)
  const getTodayLog = useKidRoutineStore((s) => s.getTodayLog)
  const rewardPoints = useKidRoutineStore(selectRewardPoints)
  const sessionCompletedItems = useKidRoutineStore((s) => s.sessionCompletedItems)
  const pendingConfirmItems = useKidRoutineStore((s) => s.pendingConfirmItems)
  const resetSession = useKidRoutineStore((s) => s.resetSession)
  const markRewardShown = useKidRoutineStore((s) => s.markRewardShown)
  const hasShownReward = useKidRoutineStore((s) => s.hasShownReward)

  const [ttsEnabled, setTtsEnabled] = useState(false)
  const { speak, cancel } = useTTS({ enabled: ttsEnabled, preset: 'kid' })
  const [showReward, setShowReward] = useState(false)
  const [showSleepMode, setShowSleepMode] = useState(false)
  const [popup, setPopup] = useState<{ show: boolean; icon: string; imagePath: string | null; label: string }>({
    show: false, icon: '', imagePath: null, label: '',
  })
  const [activeTimerItemId, setActiveTimerItemId] = useState<string | null>(null)
  const [timedOutItems, setTimedOutItems] = useState<string[]>([])

  const routine = getActiveRoutine()
  const todayLog = getTodayLog(routineId)

  // 진입 시 현재 프로필 기준 루틴 사용 + 초기화 후 활성 루틴 설정
  useEffect(() => {
    setCurrentProfileId(activeProfile?.id ?? null)
  }, [activeProfile?.id, setCurrentProfileId])

  useEffect(() => {
    if (!activeProfile?.id) return
    initRoutines(activeProfile.role)
    if (hasShownReward(routineId)) {
      router.replace('/routine/kid')
      return
    }
    setActiveRoutine(routineId)
    speak(TTS_SCRIPTS.welcome)
  }, [routineId, activeProfile?.id, activeProfile?.role, initRoutines, setActiveRoutine, speak, hasShownReward, router])

  // 전체 완료 감지 (pending 제외). 이미 오늘 보상 화면 봤으면 절대 다시 띄우지 않음.
  useEffect(() => {
    if (!routine) return
    if (hasShownReward(routineId)) return
    const totalItems = routine.items.length
    if (sessionCompletedItems.length >= totalItems && totalItems > 0) {
      setTimeout(() => setShowReward(true), 600)
    }
  }, [sessionCompletedItems, routine, routineId, hasShownReward])

  const handleTap = useCallback((item: RoutineItem) => {
    // TTS는 MissionCompletePopup에서 missionTap(itemLabel)으로 재생
    const labelKey = item.label?.trim() ? LABEL_TO_IMAGE_KEY[item.label.trim()] : undefined
    const resolvedKey = labelKey ?? item.imageKey
    const imagePath = (resolvedKey ? ROUTINE_IMAGES[resolvedKey] ?? null : null) ?? item.imagePath ?? null
    setPopup({
      show: true,
      icon: item.icon,
      imagePath,
      label: item.label,
    })
    requestConfirm(item.id)
    if (activeTimerItemId === item.id) setActiveTimerItemId(null)
  }, [activeTimerItemId, requestConfirm])

  const handleTimerStart = (itemId: string) => {
    setActiveTimerItemId((prev) => prev === itemId ? null : itemId)
  }

  const handleTimeUp = (itemId: string) => {
    setTimedOutItems((prev) => [...prev, itemId])
    setActiveTimerItemId(null)
    speak(TTS_SCRIPTS.timerEnd)
  }

  const visibleItems = routine?.items.filter(
    (item) => !sessionCompletedItems.includes(item.id)
  ) ?? []

  const progressRate = routine
    ? sessionCompletedItems.length / routine.items.length
    : 0

  if (!routine) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF9F0]">
        <p className="text-gray-400">루틴을 찾을 수 없어요 😅</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF9F0] pb-10">

      <div className="sticky top-0 z-10 bg-[#FFF9F0]/95 backdrop-blur-sm px-5 pt-safe pb-3">
        <div className="flex items-center justify-between py-4">
          <button
            onClick={() => {
              resetSession()
              router.replace('/routine/kid')
            }}
            className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>

          <div className="text-center">
            <p className="text-2xl font-black text-gray-700">{routine.title}</p>
            <p className="text-sm text-gray-400">
              {sessionCompletedItems.length} / {routine.items.length} 완료
              {pendingConfirmItems.length > 0 && (
                <span className="ml-2 text-amber-400">
                  ({pendingConfirmItems.length}개 확인 중)
                </span>
              )}
            </p>
          </div>

          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center"
          >
            {ttsEnabled
              ? <Volume2 className="w-6 h-6 text-pink-400" />
              : <VolumeX className="w-6 h-6 text-gray-400" />
            }
          </button>
        </div>

        <div className="w-full h-3 bg-pink-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#FF8FAB] to-[#FFD93D] rounded-full"
            animate={{ width: `${progressRate * 100}%` }}
            transition={{ type: 'spring', stiffness: 100 }}
          />
        </div>
      </div>

      <div className="px-5 pt-4 flex flex-col gap-4">
        {/* 대기 중인 카드 (흐릿하게 상단에) */}
        {routine.items
          .filter((item) => pendingConfirmItems.includes(item.id))
          .map((item) => (
            <MissionCard
              key={`pending-${item.id}`}
              item={item}
              state="pending"
              isActive={false}
              onTap={() => {}}
              onTimerStart={() => {}}
              onTimeUp={() => {}}
            />
          ))}

        <AnimatePresence>
          {routine.items
            .filter((item) =>
              !sessionCompletedItems.includes(item.id) &&
              !pendingConfirmItems.includes(item.id)
            )
            .map((item) => (
              <MissionCard
                key={item.id}
                item={item}
                state="idle"
                isActive={activeTimerItemId === item.id}
                onTap={handleTap}
                onTimerStart={handleTimerStart}
                onTimeUp={handleTimeUp}
              />
            ))
          }
        </AnimatePresence>

        {visibleItems.length === 0 && pendingConfirmItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-xl font-black text-gray-500">엄마/아빠 확인 중이에요!</p>
            <p className="text-gray-400 mt-2">조금만 기다려요 🙏</p>
          </motion.div>
        )}
      </div>

      <MissionCompletePopup
        show={popup.show}
        itemIcon={popup.icon}
        itemImagePath={popup.imagePath}
        itemLabel={popup.label}
        onClose={() => setPopup((p) => ({ ...p, show: false }))}
      />

      <AnimatePresence>
        {showReward && routine?.type === 'evening' && (
          <GoodNightScreen
            onClose={() => {
              setShowReward(false)
              setShowSleepMode(true)
            }}
          />
        )}
        {showSleepMode && (
          <SleepModeScreen
            onWake={() => {
              markRewardShown(routineId)
              setShowSleepMode(false)
              resetSession()
              router.replace('/routine/kid')
            }}
          />
        )}
        {showReward && routine?.type !== 'evening' && (
          <RewardScreen
            pointsEarned={todayLog?.pointsEarned ?? 60}
            streakDays={rewardPoints.streakDays}
            onClose={() => {
              markRewardShown(routineId)
              setShowReward(false)
              resetSession()
              router.replace('/routine/kid')
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
