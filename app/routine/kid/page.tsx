/**
 * 아이용 루틴 메인 — Depth 0, 탭 전환 시 카드 즉시 인라인 렌더링
 *
 * 1. 라우팅 제거: 아침/저녁 카드 클릭 시 다른 페이지로 이동하지 않음 (navigation/Link 삭제)
 * 2. 시간대별 자동 노출: 아침(0~11시), 오후(12~17시), 저녁(18시~), 주말은 주말루틴 + 특별미션 상시
 * 3. 정사각형 카드 그리드 + 스크롤/스와이프
 * 4. 탭 클릭 시 카드 리스트 Fade-in/Slide 애니메이션
 * 5. 집 나서는 시간: 카드 리스트 최상단에 고정(inline)
 */

'use client'

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NextImage from 'next/image'
import { Check, Pencil } from 'lucide-react'
import Link from 'next/link'
import {
  useKidRoutineStore,
  selectRoutines,
  selectRewardPoints,
  selectWakeAlarmTime,
  selectAlarmEnabled,
  selectLastAlarmDismissedDate,
} from '@/lib/stores/kidRoutineStore'
import { useProfileStore } from '@/lib/stores/profileStore'
import { usePetStore, DEFAULT_PET_STATE } from '@/lib/stores/petStore'
import { getTodayRoutines, ROUTINE_IMAGES } from '@/lib/utils/defaultRoutines'
import { EXP_PER_STAGE, PET_META } from '@/types/pet'
import type { RoutineItem } from '@/types/routine'
import { isWakeTimeNow, isMorningTime, isEveningTime } from '@/lib/utils/sleepSchedule'
import { PetLevelBlock } from '@/components/kid/PetGrowthHUD'
import { WakeAlarmOverlay } from '@/components/kid/WakeAlarmOverlay'
import { DepartureBanner } from '@/components/kid/DepartureBanner'
import { DateBar } from '@/components/kid/DateBar'
import { RoutineCardList, type RoutineItemEntry } from '@/components/kid/RoutineCardList'
import { RewardScreen } from '@/components/kid/RewardScreen'

type DashboardTab = 'morning' | 'afternoon' | 'evening' | 'special' | 'weekend'

const ROUTINE_TYPE_META: Record<string, { emoji: string; label: string; bg: string }> = {
  morning: { emoji: '🌅', label: '아침 루틴', bg: 'from-[#FFE57A] to-[#FFB347]' },
  afternoon: { emoji: '☀️', label: '평일오후', bg: 'from-[#7EB8D4] to-[#A8E6CF]' },
  evening: { emoji: '🌙', label: '저녁 루틴', bg: 'from-[#5B7C99] to-[#8BB8D4]' },
  weekend: { emoji: '🎉', label: '주말루틴', bg: 'from-[#FF8FAB] to-[#C77DFF]' },
  special: { emoji: '⭐', label: '특별미션', bg: 'from-[#FFD93D] to-[#F59E0B]' },
}

const TAB_ICONS: Record<DashboardTab, string> = {
  morning: '🌅',
  afternoon: '☀️',
  evening: '🌙',
  special: '⭐',
  weekend: '🎉',
}

/** 루틴 완료 시 먹이가 쌓였을 때 보여주는 파티클 (중앙에서 터지는 효과) */
function FoodParticleToPet({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = -90 + (i - 3) * 25
        const rad = (angle * Math.PI) / 180
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 80, scale: 1, opacity: 1 }}
            animate={{ x: Math.cos(rad) * 120, y: Math.sin(rad) * 120 - 60, scale: 0.3, opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeIn', delay: i * 0.05 }}
            className="absolute text-2xl select-none"
          >
            ❤️
          </motion.div>
        )
      })}
    </div>
  )
}

/** 출발 좌표 → 도착 좌표로 먹이 이모지가 날아가는 효과 (카드→먹이 아이콘, 먹이 아이콘→캐릭터) */
function FlyingFood({
  from,
  to,
  onEnd,
}: {
  from: { x: number; y: number }
  to: { x: number; y: number }
  onEnd: () => void
}) {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      <motion.div
        className="absolute text-2xl select-none will-change-transform"
        initial={{ x: from.x, y: from.y, scale: 1, opacity: 1 }}
        animate={{
          x: to.x,
          y: to.y,
          scale: 0.6,
          opacity: 0.9,
        }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        onAnimationComplete={onEnd}
        style={{ left: 0, top: 0, marginLeft: '-1rem', marginTop: '-1rem' }}
      >
        ❤️
      </motion.div>
    </div>
  )
}

function CharBubble({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 8 }}
          className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white rounded-2xl px-3 py-1.5 shadow-lg border border-gray-100 whitespace-nowrap z-10"
        >
          <span className="text-xs font-black text-gray-700">{message}</span>
          <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-gray-100" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function KidRoutineMainContent() {
  const activeProfile = useProfileStore((s) => s.getActiveProfile())
  const setCurrentProfileId = useKidRoutineStore((s) => s.setCurrentProfileId)
  const routines = useKidRoutineStore(selectRoutines)
  const initRoutines = useKidRoutineStore((s) => s.initRoutines)
  const getTodayLog = useKidRoutineStore((s) => s.getTodayLog)
  const completeItemForRoutine = useKidRoutineStore((s) => s.completeItemForRoutine)
  const removeRoutineItem = useKidRoutineStore((s) => s.removeRoutineItem)
  const addRoutineItem = useKidRoutineStore((s) => s.addRoutineItem)
  const setRoutineItemsOrder = useKidRoutineStore((s) => s.setRoutineItemsOrder)
  const setItemHidden = useKidRoutineStore((s) => s.setItemHidden)
  const getDeletedItemTemplates = useKidRoutineStore((s) => s.getDeletedItemTemplates)
  const rewardPoints = useKidRoutineStore(selectRewardPoints)
  const wakeAlarmTime = useKidRoutineStore(selectWakeAlarmTime)
  const alarmEnabled = useKidRoutineStore(selectAlarmEnabled)
  const lastAlarmDismissedDate = useKidRoutineStore(selectLastAlarmDismissedDate)
  const dismissAlarm = useKidRoutineStore((s) => s.dismissAlarm)
  const runDailyResetIfNeeded = useKidRoutineStore((s) => s.runDailyResetIfNeeded)
  const byProfile = useKidRoutineStore((s) => s.byProfile)

  const profileId = activeProfile?.id ?? null
  // 온보딩에서 선택한 캐릭터가 petStore에 반영되면 즉시 표시 (byProfile 구독)
  const petState = usePetStore((s) => s.byProfile[profileId ?? ''] ?? DEFAULT_PET_STATE)
  const feedPetOne = usePetStore((s) => s.feedPetOne)
  const getEmoji = usePetStore((s) => s.getEmoji)
  const getProgress = usePetStore((s) => s.getProgress)
  const getNextStageExp = usePetStore((s) => s.getNextStageExp)

  /** 현재 시각(1분마다 갱신) — 시간대별 자동 탭 결정용 */
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(id)
  }, [])
  /** 시간대별 표시: 아침(0~11시), 오후(12~17시), 저녁(18시~), 주말은 주말루틴. 특별미션은 상시 노출 */
  const currentTimeTab = useMemo((): DashboardTab => {
    const h = now.getHours()
    const d = now.getDay()
    if (d === 0 || d === 6) return 'weekend'
    if (h < 12) return 'morning'
    if (h < 18) return 'afternoon'
    return 'evening'
  }, [now])
  const [editMode, setEditMode] = useState(false)
  const [showFoodParticle, setShowFoodParticle] = useState(false)
  const [flashFood, setFlashFood] = useState(false)
  const [flashSticker, setFlashSticker] = useState(false)
  const [flashDiamond, setFlashDiamond] = useState(false)
  const [charMsg, setCharMsg] = useState<string | null>(null)
  const [charReaction, setCharReaction] = useState(false)
  /** 보상바 먹이 아이콘 위치 (루틴 완료 시 날아가는 효과의 목표, 먹이→캐릭터 시 출발점) */
  const foodIconRef = useRef<HTMLButtonElement | null>(null)
  /** 캐릭터 위치 (먹이 클릭 시 날아가는 효과의 목표) */
  const characterRef = useRef<HTMLDivElement | null>(null)
  /** 루틴 클릭 시 카드 → 보상바 먹이 아이콘으로 날아가는 효과 좌표 */
  const [flyToFoodIcon, setFlyToFoodIcon] = useState<{ from: { x: number; y: number }; to: { x: number; y: number } } | null>(null)
  /** 보상바 먹이 클릭 시 먹이 아이콘 → 캐릭터로 날아가는 효과 좌표 */
  const [flyToCharacter, setFlyToCharacter] = useState<{ from: { x: number; y: number }; to: { x: number; y: number } } | null>(null)
  /** 탭에서 모든 루틴을 완료했을 때 한 번만 축하 화면(폭죽·꽃다발·컨페티·효과음) 표시 */
  const [showCelebration, setShowCelebration] = useState(false)
  const [characterImageError, setCharacterImageError] = useState(false)
  /** scale down & fade out 애니메이션 중인 카드의 item.id (애니메이션 끝나면 실제 완료 처리) */
  const [completingEntryId, setCompletingEntryId] = useState<string | null>(null)
  const prevFoodRef = useRef(petState.pendingFood)
  const petMeta = petState.species != null ? PET_META[petState.species as keyof typeof PET_META] : undefined
  const characterStageImageSrc =
    petMeta != null && petState.stage != null
      ? petMeta.stageImages[Math.min(petState.stage, petMeta.stageImages.length - 1)]
      : null
  const prevStarStickers = useRef(rewardPoints.starStickers ?? 0)
  const prevDiamonds = useRef(rewardPoints.diamonds ?? 0)
  const STORAGE_KEY = 'rhymia-dashboard-last-food'

  // 자정 리셋: 앱 로드·탭 포커스 시 날짜가 바뀌었으면 아침/저녁 완료 상태 초기화
  useEffect(() => {
    runDailyResetIfNeeded()
  }, [runDailyResetIfNeeded])
  useEffect(() => {
    const onFocus = () => runDailyResetIfNeeded()
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', onFocus)
      return () => window.removeEventListener('focus', onFocus)
    }
  }, [runDailyResetIfNeeded])

  // 재화(별 스티커·다이아몬드) 변경 시 HUD 강조
  useEffect(() => {
    const stars = rewardPoints.starStickers ?? 0
    const diamonds = rewardPoints.diamonds ?? 0
    if (stars > prevStarStickers.current) {
      setFlashSticker(true)
      const t = setTimeout(() => setFlashSticker(false), 500)
      return () => clearTimeout(t)
    }
    prevStarStickers.current = stars
  }, [rewardPoints.starStickers])
  useEffect(() => {
    const diamonds = rewardPoints.diamonds ?? 0
    if (diamonds > prevDiamonds.current) {
      setFlashDiamond(true)
      const t = setTimeout(() => setFlashDiamond(false), 500)
      return () => clearTimeout(t)
    }
    prevDiamonds.current = diamonds
  }, [rewardPoints.diamonds])

  // 미션 성공 시 말풍선은 표시하지 않음. 하트 수신 시 파티클만 표시
  useEffect(() => {
    if (!profileId || typeof window === 'undefined') return
    const key = `${STORAGE_KEY}-${profileId}`
    const lastSeen = parseInt(sessionStorage.getItem(key) ?? '0', 10)
    const current = petState.pendingFood
    if (current > lastSeen) {
      setShowFoodParticle(true)
      sessionStorage.setItem(key, String(current))
      const t1 = setTimeout(() => setShowFoodParticle(false), 900)
      return () => clearTimeout(t1)
    }
    sessionStorage.setItem(key, String(current))
  }, [profileId, petState.pendingFood])

  useEffect(() => {
    setCharacterImageError(false)
  }, [characterStageImageSrc])

  useEffect(() => {
    setCurrentProfileId(activeProfile?.id ?? null)
  }, [activeProfile?.id, setCurrentProfileId])

  useEffect(() => {
    if (activeProfile?.id) initRoutines(activeProfile.role)
  }, [activeProfile?.id, activeProfile?.role, initRoutines])

  const todayStr = new Date().toISOString().split('T')[0]
  const showAlarm = alarmEnabled && isWakeTimeNow(wakeAlarmTime) && lastAlarmDismissedDate !== todayStr

  const todayRoutines = getTodayRoutines(routines)
  const morningRoutines = todayRoutines.filter((r) => r.type === 'morning')
  const afternoonRoutines = todayRoutines.filter((r) => r.type === 'afternoon')
  const eveningRoutines = todayRoutines.filter((r) => r.type === 'evening')
  const specialRoutines = todayRoutines.filter((r) => r.type === 'special')
  const weekendRoutines = todayRoutines.filter((r) => r.type === 'weekend')
  const isWeekend = useMemo(() => {
    const d = now.getDay()
    return d === 0 || d === 6
  }, [now])
  const highlightType = isMorningTime() ? 'morning' : isEveningTime() ? 'evening' : null

  const profileData = profileId ? byProfile[profileId] : null
  const starStickers = rewardPoints.starStickers ?? 0
  const diamonds = rewardPoints.diamonds ?? 0

  const level = (petState.stage ?? 0) + 1
  const expProgress = profileId ? getProgress(profileId) : 0
  const curStageExp = EXP_PER_STAGE[petState.stage ?? 0] ?? 0
  const nextStageTotal = profileId ? getNextStageExp(profileId) : 25
  const expCurrent = Math.max(0, (petState.totalFed ?? 0) - curStageExp)
  const expNext = Math.max(1, nextStageTotal - curStageExp)

  /** 보상바 먹이 클릭: 한 개씩 캐릭터에게 날아가며 EXP 1씩 증가 */
  const handleFeedClick = () => {
    if (!profileId || petState.pendingFood <= 0 || petState.isEating) return
    const foodEl = foodIconRef.current
    const charEl = characterRef.current
    if (foodEl && charEl) {
      const fr = foodEl.getBoundingClientRect()
      const tr = charEl.getBoundingClientRect()
      setFlyToCharacter({
        from: { x: fr.left + fr.width / 2, y: fr.top + fr.height / 2 },
        to: { x: tr.left + tr.width / 2, y: tr.top + tr.height / 2 },
      })
    } else {
      feedPetOne(profileId)
      setCharMsg('냠냠! 맛있어요 🥰')
      setTimeout(() => setCharMsg(null), 2000)
    }
  }

  const handleCharacterTap = () => {
    setCharReaction(true)
    setCharMsg('나를 눌렀어요! 🥰')
    setTimeout(() => setCharReaction(false), 600)
    setTimeout(() => setCharMsg(null), 1800)
  }

  /** 시간대 루틴 + 특별미션(상시) 합친 플랫 항목 리스트. includeHidden true면 숨긴 항목도 포함 */
  const getItemEntries = (includeHidden = false): RoutineItemEntry[] => {
    const timeList =
      currentTimeTab === 'morning' ? morningRoutines
      : currentTimeTab === 'afternoon' ? afternoonRoutines
      : currentTimeTab === 'evening' ? eveningRoutines
      : currentTimeTab === 'weekend' ? weekendRoutines
      : []
    const toEntries = (list: typeof todayRoutines) => {
      const ent: RoutineItemEntry[] = []
      list.forEach((r) => {
        r.items
          .filter((item) => includeHidden || !(item as RoutineItem).hidden)
          .forEach((item) => {
            ent.push({ routineId: r.id, routineType: r.type, item: item as RoutineItem })
          })
      })
      return ent.sort((a, b) => a.item.order - b.item.order)
    }
    return [...toEntries(timeList), ...toEntries(specialRoutines)]
  }

  const isItemCompleted = (routineId: string, itemId: string) => {
    const log = getTodayLog(routineId)
    return log?.completedItems?.includes(itemId) ?? false
  }

  /** 수정 모드: 숨긴 항목 포함 전체 표시(순서 변경·숨기기 토글용). 보기 모드: 숨긴 항목 제외, 완료한 항목은 리스트에서 제거 */
  const itemEntries = editMode
    ? getItemEntries(true)
    : getItemEntries(false).filter((e) => !isItemCompleted(e.routineId, e.item.id))

  /** 카드 클릭: scale down & fade out 애니메이션 시작 + 날아가는 효과. 실제 완료는 handleExitAnimationComplete에서 */
  const handleItemComplete = (entry: RoutineItemEntry, e?: React.MouseEvent) => {
    if (!profileId) return
    if (isItemCompleted(entry.routineId, entry.item.id)) return
    if (completingEntryId) return
    setCompletingEntryId(entry.item.id)
    // 미션 성공 시 말풍선 없음 (setCharMsg 제거)
    setFlashFood(true)
    setTimeout(() => setFlashFood(false), 500)
    const cardEl = e?.currentTarget as HTMLElement | undefined
    const foodEl = foodIconRef.current
    if (cardEl && foodEl) {
      const cr = cardEl.getBoundingClientRect()
      const fr = foodEl.getBoundingClientRect()
      setFlyToFoodIcon({
        from: { x: cr.left + cr.width / 2, y: cr.top + cr.height / 2 },
        to: { x: fr.left + fr.width / 2, y: fr.top + fr.height / 2 },
      })
    }
  }

  /** scale down & fade out 애니메이션 종료 후: 실제 완료 처리, 노출 중인 루틴 전체 완료 시 축하 */
  const handleExitAnimationComplete = useCallback(
    (entry: RoutineItemEntry) => {
      completeItemForRoutine(entry.routineId, entry.item.id)
      setCompletingEntryId(null)
      const allVisible = getItemEntries()
      const uncompletedCount = allVisible.filter((e) => !isItemCompleted(e.routineId, e.item.id)).length
      if (allVisible.length > 0 && uncompletedCount === 0) {
        setShowCelebration(true)
      }
    },
    [completeItemForRoutine, getItemEntries, isItemCompleted]
  )

  const handleReorder = useCallback(
    (newEntries: RoutineItemEntry[]) => {
      const byRoutine = new Map<string, string[]>()
      newEntries.forEach((e) => {
        const ids = byRoutine.get(e.routineId) ?? []
        ids.push(e.item.id)
        byRoutine.set(e.routineId, ids)
      })
      byRoutine.forEach((ids, routineId) => setRoutineItemsOrder(routineId, ids))
    },
    [setRoutineItemsOrder]
  )

  const handleRemove = useCallback(
    (entry: RoutineItemEntry) => {
      removeRoutineItem(entry.routineId, entry.item.id)
    },
    [removeRoutineItem]
  )

  const handleHide = useCallback(
    (entry: RoutineItemEntry, hidden: boolean) => {
      setItemHidden(entry.routineId, entry.item.id, hidden)
    },
    [setItemHidden]
  )

  /** 수정 모드에서 추가 시: 현재 시간대 루틴에 추가 */
  const handleAddItem = useCallback(
    (item: RoutineItem) => {
      const list =
        currentTimeTab === 'morning' ? morningRoutines
        : currentTimeTab === 'afternoon' ? afternoonRoutines
        : currentTimeTab === 'evening' ? eveningRoutines
        : currentTimeTab === 'weekend' ? weekendRoutines
        : []
      const routineId = list[0]?.id
      if (routineId) addRoutineItem(routineId, item)
    },
    [currentTimeTab, morningRoutines, afternoonRoutines, eveningRoutines, weekendRoutines, addRoutineItem]
  )

  const addTargetRoutineId = useMemo(() => {
    const list =
      currentTimeTab === 'morning' ? morningRoutines
      : currentTimeTab === 'afternoon' ? afternoonRoutines
      : currentTimeTab === 'evening' ? eveningRoutines
      : currentTimeTab === 'weekend' ? weekendRoutines
      : []
    return list[0]?.id ?? null
  }, [currentTimeTab, morningRoutines, afternoonRoutines, eveningRoutines, weekendRoutines])

  const getDeletedTemplates = useCallback(
    (routineId: string) => (profileId ? getDeletedItemTemplates(profileId, routineId) : []),
    [profileId, getDeletedItemTemplates]
  )

  return (
    <div className="min-h-screen bg-[#FFF9F0] flex flex-col">
      <AnimatePresence>{showFoodParticle && <FoodParticleToPet active />}</AnimatePresence>
      {/* 루틴 완료 시 카드 → 보상바 먹이 아이콘으로 날아가는 효과 */}
      <AnimatePresence>
        {flyToFoodIcon && (
          <FlyingFood
            key="to-food"
            from={flyToFoodIcon.from}
            to={flyToFoodIcon.to}
            onEnd={() => setFlyToFoodIcon(null)}
          />
        )}
      </AnimatePresence>
      {/* 보상바 먹이 클릭 시 먹이 아이콘 → 캐릭터로 날아간 뒤 EXP 1 증가 */}
      <AnimatePresence>
        {flyToCharacter && (
          <FlyingFood
            key="to-char"
            from={flyToCharacter.from}
            to={flyToCharacter.to}
            onEnd={() => {
              setFlyToCharacter(null)
              if (profileId) {
                feedPetOne(profileId)
                setCharMsg('냠냠! 맛있어요 🥰')
                setTimeout(() => setCharMsg(null), 2000)
              }
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>{showAlarm && <WakeAlarmOverlay onDismiss={dismissAlarm} />}</AnimatePresence>

      {/* 탭별 모든 루틴 완료 시: 폭죽·꽃다발 축하 이미지 + 컨페티 + 효과음 */}
      <AnimatePresence>
        {showCelebration && (
          <RewardScreen
            pointsEarned={rewardPoints.totalPoints ?? 60}
            streakDays={rewardPoints.streakDays}
            onClose={() => setShowCelebration(false)}
          />
        )}
      </AnimatePresence>

      <div className="px-3 pt-2 pb-6 flex-1 flex flex-col min-h-0">
        {/* 상단 절반: room_background 배경 (화면 높이의 절반), 캐릭터는 배경 중앙에 배치 */}
        <section
          className="flex-shrink-0 min-h-[50vh] flex flex-col bg-cover bg-center bg-no-repeat -mx-3 rounded-b-2xl overflow-hidden"
          style={{ backgroundImage: 'url(/background/room_background.png)' }}
        >
          <div className="px-3 pt-2">
            <DepartureBanner variant="inline" />
          </div>
          {/* 캐릭터 영역: 레벨 블록은 왼쪽 상단(화면 안쪽), 캐릭터는 배경 중앙 */}
          <div className="relative flex-1 flex items-center justify-center min-h-[180px] px-3">
            {/* 레벨 블록: 왼쪽 상단, 화면 안쪽으로 정렬 (잘림 방지) */}
            <div className="absolute left-3 top-3 z-10">
              <PetLevelBlock
                level={level}
                expProgress={expProgress}
                expCurrent={expCurrent}
                expNext={expNext}
              />
            </div>
            <div className="relative flex items-center justify-center w-full max-w-[280px]">
              <div ref={characterRef} className="relative flex flex-col items-center justify-center">
                <CharBubble message={charMsg} />
                <motion.div
                  animate={
                    charReaction
                      ? { scale: [1, 1.25, 1.1], rotate: [0, -8, 8, 0] }
                      : petState.isEating
                        ? { scale: [1, 1.15, 0.95, 1], rotate: [0, -5, 5, 0] }
                        : {}
                  }
                  transition={
                    charReaction ? { duration: 0.5 }
                    : petState.isEating ? { duration: 0.5, repeat: 0 }
                    : {}
                  }
                  className="relative w-24 h-24 md:w-28 md:h-28 flex items-center justify-center select-none cursor-pointer"
                  onClick={handleCharacterTap}
                  role="button"
                  aria-label="마이펫"
                >
                  {characterStageImageSrc && !characterImageError ? (
                    <img
                      src={characterStageImageSrc}
                      alt=""
                      className="w-full h-full object-contain"
                      onError={() => setCharacterImageError(true)}
                    />
                  ) : (
                    <span className="text-6xl md:text-7xl">
                      {getEmoji(profileId ?? '') || '🥚'}
                    </span>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* 캐릭터와 날짜 바 사이 간격 넓힘 */}
        <div className="mt-8">
          <DateBar />
        </div>

        {/* 카드 리스트: 시간대별 자동(아침~11:59 / 오후~17:59 / 저녁 18:00~) + 특별미션 상시 */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-auto pb-4">
          {/* 미션 카드 상단: 수정 버튼(아이콘), 간격 적용 */}
          <div className="mt-4 mb-2 flex justify-end">
            <button
              type="button"
              onClick={() => setEditMode((v) => !v)}
              aria-label={editMode ? '완료' : '수정'}
              className={`p-1.5 rounded-lg transition-colors ${editMode ? 'bg-amber-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {editMode ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* 수정 모드일 때는 항목이 없어도 리스트 영역을 보여줌 → 루틴 추가·삭제 가능 */}
            {!editMode && itemEntries.length === 0 ? (
              <motion.div
                key={`empty-${currentTimeTab}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-center py-8"
              >
                <div className="text-4xl mb-2">{TAB_ICONS[currentTimeTab] ?? '📋'}</div>
                <p className="text-gray-400 text-sm font-semibold">오늘 이 루틴이 없어요</p>
              </motion.div>
            ) : (
              <motion.div
                key={`${currentTimeTab}-${editMode ? 'edit' : 'view'}`}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18 }}
              >
                <RoutineCardList
                  entries={itemEntries}
                  onComplete={handleItemComplete}
                  onExitAnimationComplete={handleExitAnimationComplete}
                  completingEntryId={completingEntryId}
                  onReorder={handleReorder}
                  onRemove={handleRemove}
                  onHide={handleHide}
                  getDeletedTemplates={getDeletedTemplates}
                  editMode={editMode}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default function KidRoutineMainPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center">
          <div className="text-4xl animate-pulse">🌟</div>
        </div>
      }
    >
      <KidRoutineMainContent />
    </Suspense>
  )
}
