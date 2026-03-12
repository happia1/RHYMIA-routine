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
import { flushSync } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Pencil } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import { RoutineCardList, type RoutineItemEntry } from '@/components/kid/RoutineCardList'
import { RewardScreen } from '@/components/kid/RewardScreen'
import { SnackShopPopup } from '@/components/kid/SnackShopPopup'

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

/** 출발 좌표 → 도착 좌표로 보상 이모지가 날아가는 효과 (카드 → 레벨 블록). 특별미션은 별, 그 외는 하트 */
function FlyingReward({
  from,
  to,
  emoji = '❤️',
  onEnd,
}: {
  from: { x: number; y: number }
  to: { x: number; y: number }
  emoji?: string
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
        {emoji}
      </motion.div>
    </div>
  )
}

/** 하트/별 5개가 채워졌을 때 레벨 블록 → EXP 바로 5개가 날아가는 효과 (레벨 상승 연출) */
function FlyingFiveToExpBar({
  from,
  to,
  emoji = '❤️',
  onEnd,
}: {
  from: { x: number; y: number }
  to: { x: number; y: number }
  emoji?: string
  onEnd: () => void
}) {
  const count = 5
  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-lg select-none"
          style={{ left: from.x, top: from.y, marginLeft: '-0.5rem', marginTop: '-0.5rem' }}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{
            x: to.x - from.x,
            y: to.y - from.y,
            scale: 0.5,
            opacity: 0,
          }}
          transition={{
            duration: 0.55,
            ease: 'easeIn',
            delay: i * 0.06,
          }}
          onAnimationComplete={i === count - 1 ? onEnd : undefined}
        >
          {emoji}
        </motion.div>
      ))}
    </div>
  )
}

/** 미션 카드 클릭 시 카드 위치에서 터지면서 퍼져 나가는 파티클 (하트/별) */
function BurstParticles({
  x,
  y,
  emoji = '❤️',
  onEnd,
}: {
  x: number
  y: number
  emoji?: string
  onEnd?: () => void
}) {
  const count = 8
  return (
    <div className="fixed inset-0 pointer-events-none z-[99]" style={{ left: 0, top: 0 }}>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 360
        const rad = (angle * Math.PI) / 180
        const dist = 50 + (i % 3) * 25
        return (
          <motion.div
            key={i}
            className="absolute text-xl select-none"
            style={{ left: x, top: y, marginLeft: '-0.5rem', marginTop: '-0.5rem' }}
            initial={{ scale: 1.2, opacity: 1, x: 0, y: 0 }}
            animate={{
              scale: 0.4,
              opacity: 0,
              x: Math.cos(rad) * dist,
              y: Math.sin(rad) * dist,
            }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: i * 0.02 }}
            onAnimationComplete={i === count - 1 ? onEnd : undefined}
          >
            {emoji}
          </motion.div>
        )
      })}
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
  const router = useRouter()
  const activeProfile = useProfileStore((s) => s.getActiveProfile())
  const setCurrentProfileId = useKidRoutineStore((s) => s.setCurrentProfileId)
  const routines = useKidRoutineStore(selectRoutines)
  const initRoutines = useKidRoutineStore((s) => s.initRoutines)
  const getTodayLog = useKidRoutineStore((s) => s.getTodayLog)
  const getTodayLogForProfile = useKidRoutineStore((s) => s.getTodayLogForProfile)
  const completeItemForRoutine = useKidRoutineStore((s) => s.completeItemForRoutine)
  const spendCoins = useKidRoutineStore((s) => s.spendCoins)
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
  /** 완료 기록(logs) 변경 시 리렌더되어 카드 제거·별/하트 게이지 반영. 직렬화 문자열로 구독해 변경 시 확실히 리렌더 */
  const todayForLog = new Date().toISOString().split('T')[0]
  useKidRoutineStore((s) => {
    if (!profileId || !s.byProfile[profileId]) return ''
    return s.byProfile[profileId].logs
      .filter((l) => l.date === todayForLog)
      .map((l) => `${l.routineId}:${(l.completedItems?.length ?? 0)}`)
      .join('|')
  })
  // 온보딩에서 선택한 캐릭터가 petStore에 반영되면 즉시 표시 (byProfile 구독)
  const petState = usePetStore((s) => s.byProfile[profileId ?? ''] ?? DEFAULT_PET_STATE)
  const feedPetOne = usePetStore((s) => s.feedPetOne)
  const addExp = usePetStore((s) => s.addExp)
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
  /** 보상바 먹이 아이콘 위치 (먹이→캐릭터 날아가는 효과의 출발점, 상단바에 있을 때 사용) */
  const foodIconRef = useRef<HTMLButtonElement | null>(null)
  /** 레벨 블록 위치 (미션 완료 시 보상 아이콘이 날아가는 목표) */
  const levelBlockRef = useRef<HTMLDivElement | null>(null)
  /** EXP 바 위치 (하트/별 5개 시 5개가 날아가서 레벨 오르는 연출 목표) */
  const expBarRef = useRef<HTMLDivElement | null>(null)
  /** 캐릭터 위치 (먹이 클릭 시 날아가는 효과의 목표) */
  const characterRef = useRef<HTMLDivElement | null>(null)
  /** 미션 완료 시 카드 → 레벨 블록으로 보상 이모지 날아가는 효과 (특별미션=별, 그 외=하트) */
  const [flyToLevelBlock, setFlyToLevelBlock] = useState<{
    from: { x: number; y: number }
    to: { x: number; y: number }
    emoji: string
  } | null>(null)
  /** 하트 또는 별 5개 채워진 뒤 레벨 블록 → EXP 바로 5개 날아가는 효과 */
  const [flyToExpBar, setFlyToExpBar] = useState<{
    from: { x: number; y: number }
    to: { x: number; y: number }
    emoji: string
    kind: 'heart' | 'star'
  } | null>(null)
  /** 보상바 먹이 클릭 시 먹이 아이콘 → 캐릭터로 날아가는 효과 좌표 */
  const [flyToCharacter, setFlyToCharacter] = useState<{ from: { x: number; y: number }; to: { x: number; y: number } } | null>(null)
  /** 미션 카드 클릭 시 터지는 파티클 위치 (카드 중심) */
  const [burstAt, setBurstAt] = useState<{ x: number; y: number; emoji: string } | null>(null)
  /** 보상이 레벨 블록에 도착한 뒤, 하트/별 5개가 채워졌으면 EXP 바로 5개 날아가는 효과 트리거용 */
  const triggerFlyToExpBarRef = useRef<{ emoji: string; kind: 'heart' | 'star' } | null>(null)
  /**
   * 탭에서 모든 루틴을 완료했을 때 한 번만 축하 화면(폭죽·꽃다발·컨페티·효과음) 표시.
   * - showCelebration: 실제로 현재 화면에 축하 팝업을 띄울지 여부
   * - hasShownCelebrationToday: 오늘 날짜/현재 프로필 기준으로 이미 한 번 축하 팝업을 본 적이 있는지 여부
   *   → 한 번 본 뒤에는 같은 날에는 다시 나오지 않도록 막아, 미션 카드 추가 클릭 시 계속 뜨는 현상을 방지.
   */
  const [showCelebration, setShowCelebration] = useState(false)
  const [hasShownCelebrationToday, setHasShownCelebrationToday] = useState(false)
  /** 1st 아이콘 버튼 클릭 시 아래에서 슬라이딩되는 팝업 표시 여부 */
  const [show1stPopup, setShow1stPopup] = useState(false)
  const [characterImageError, setCharacterImageError] = useState(false)
  const prevFoodRef = useRef(petState.pendingFood)
  const petMeta = petState.species != null ? PET_META[petState.species as keyof typeof PET_META] : undefined
  const characterStageImageSrc =
    petMeta != null && petState.stage != null
      ? petMeta.stageImages[Math.min(petState.stage, petMeta.stageImages.length - 1)]
      : null
  const prevStarStickers = useRef(rewardPoints.starStickers ?? 0)
  const prevDiamonds = useRef(rewardPoints.diamonds ?? 0)
  /**
   * 오늘(프로필 기준) 하트/별 게이지를 몇 개까지 EXP 바로 전환했는지(누적 완료 개수 기준).
   * - EXP 전환(하트/별 5개 모음) 자체는 스토어의 누적 로그로 관리하지만,
   *   "눈에 보이는 작은 하트/별 5개"는 아래 heartsGauge / starsGauge로만 제어한다.
   * - 이렇게 분리하면, 로그 리셋/지연과 상관없이 카드 클릭 직후 게이지가 바로 반응한다.
   */
  const [heartGaugeOffset, setHeartGaugeOffset] = useState(0)
  const [starGaugeOffset, setStarGaugeOffset] = useState(0)
  /** 클릭으로 방금 완료한 항목 키(routineId:itemId) — 스토어 리렌더 전에 카드를 바로 제거하기 위한 낙관적 업데이트 */
  const [justCompletedKeys, setJustCompletedKeys] = useState<Set<string>>(new Set())
  /**
   * 하트/별 게이지 "화면 표시용" 개수 (0~5).
   * - 순수하게 "오늘 이 기기에서 아이가 몇 개를 눌러서 채웠는지"만 기준으로 한다.
   * - 스토어의 로그(heartsCompletedRaw / starsCompletedRaw)는 EXP 전환/통계용으로만 쓰고,
   *   게이지 애니메이션은 이 값만 보고 바로바로 반응하도록 분리한다.
   */
  const [heartsGauge, setHeartsGauge] = useState(0)
  const [starsGauge, setStarsGauge] = useState(0)
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
  const coins = rewardPoints.coins ?? 0
  /** 상점 슬라이딩 팝업 열림 여부 */
  const [showShop, setShowShop] = useState(false)
  /** 오늘 모든 루틴에서 완료한 미션 개수 */
  const allRoutinesForToday = useMemo(
    () => [
      ...morningRoutines,
      ...afternoonRoutines,
      ...eveningRoutines,
      ...specialRoutines,
      ...weekendRoutines,
    ],
    [morningRoutines, afternoonRoutines, eveningRoutines, specialRoutines, weekendRoutines]
  )
  /** 일반 미션(아침/오후/저녁/주말) 완료 수(원본, 누적 개수) — 현재 프로필 기준 */
  const heartsCompletedRaw =
    profileId == null
      ? 0
      : [...morningRoutines, ...afternoonRoutines, ...eveningRoutines, ...weekendRoutines].reduce(
          (sum, r) => sum + (getTodayLogForProfile(profileId, r.id)?.completedItems?.length ?? 0),
          0
        )
  /** 특별미션 완료 수(원본, 누적 개수) — 현재 프로필 기준 */
  const starsCompletedRaw =
    profileId == null
      ? 0
      : specialRoutines.reduce(
          (sum, r) => sum + (getTodayLogForProfile(profileId, r.id)?.completedItems?.length ?? 0),
          0
        )
  /**
   * 레벨 블록에 실제로 표시할 하트/별 개수 (0~5).
   * - heartsGauge / starsGauge만 사용해서 즉시 반응하도록 하고,
   *   heartGaugeOffset / starGaugeOffset은 EXP 전환된 "묵은" 개수를 나타내는 용도로만 사용한다.
   * - 이 페이지에서는 heartsGauge / starsGauge가 이미 0~5 범위에서 관리되므로,
   *   단순히 그대로 사용한다.
   */
  const heartsFilled = Math.min(5, Math.max(0, heartsGauge))
  const starsFilled = Math.min(5, Math.max(0, starsGauge))

  const level = (petState.stage ?? 0) + 1
  const expProgress = profileId ? getProgress(profileId) : 0
  const curStageExp = EXP_PER_STAGE[petState.stage ?? 0] ?? 0
  const nextStageTotal = profileId ? getNextStageExp(profileId) : 25
  const expCurrent = Math.max(0, (petState.totalFed ?? 0) - curStageExp)
  const expNext = Math.max(1, nextStageTotal - curStageExp)

  // 날짜 또는 프로필이 바뀌면, 게이지 전환·낙관적 완료 키·화면용 하트/별 게이지 완전 초기화
  useEffect(() => {
    // 하트/별 게이지 관련 누적 값 및 보정값을 완전히 0에서 다시 시작
    setHeartGaugeOffset(0)
    setStarGaugeOffset(0)
    setJustCompletedKeys(new Set())
    setHeartsGauge(0)
    setStarsGauge(0)

    // 날짜/프로필 변경 시에는 축하 팝업 관련 상태도 함께 초기화해, 새로운 하루에는 다시 한 번 표시되도록 함
    setShowCelebration(false)
    setHasShownCelebrationToday(false)
  }, [todayStr, profileId])

  // 스토어 완료 수 변화는 EXP 계산·통계용으로만 사용하고,
  // 화면용 하트/별 게이지(heartsGauge / starsGauge)는 카드 클릭 시에만 직접 변경한다.

  // 하트/별이 5개 이상 쌓였으면, 이미 레벨 게이지로 전환된 걸로 간주하고 offset 동기화 → 게이지는 0~4개만 표시(블랭크 하트/별)
  useEffect(() => {
    if (heartsCompletedRaw >= 5) {
      const minOffset = Math.floor(heartsCompletedRaw / 5) * 5
      setHeartGaugeOffset((prev) => Math.max(prev, minOffset))
    }
    if (starsCompletedRaw >= 5) {
      const minOffset = Math.floor(starsCompletedRaw / 5) * 5
      setStarGaugeOffset((prev) => Math.max(prev, minOffset))
    }
  }, [heartsCompletedRaw, starsCompletedRaw])

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
    setCharMsg('나의 펫 화면으로 이동해요! 🐾')
    setTimeout(() => setCharReaction(false), 600)
    setTimeout(() => setCharMsg(null), 1800)
    if (profileId) {
      router.push('/routine/kid/pet')
    }
  }

  /**
   * 시간대 루틴 + 특별미션(상시) 합친 플랫 항목 리스트.
   * - includeHidden true면 숨긴 항목도 포함.
   * - 이 함수는 "현재 탭 기준으로 어떤 미션들이 존재하는지"만 계산하고,
   *   "완료 여부에 따른 필터링"은 아래 itemEntries 계산 단계에서 한 번에 처리한다.
   */
  const getItemEntries = (includeHidden = false): RoutineItemEntry[] => {
    // 1️⃣ 현재 선택된 시간대(아침/오후/저녁/주말)에 해당하는 루틴 목록만 추린다.
    const timeList =
      currentTimeTab === 'morning' ? morningRoutines
      : currentTimeTab === 'afternoon' ? afternoonRoutines
      : currentTimeTab === 'evening' ? eveningRoutines
      : currentTimeTab === 'weekend' ? weekendRoutines
      : []

    // 2️⃣ 루틴 리스트를 카드에서 쓰기 좋은 납작한(entries) 구조로 변환한다.
    const toEntries = (list: typeof todayRoutines) => {
      const ent: RoutineItemEntry[] = []
      list.forEach((r) => {
        r.items
          .filter((item) => includeHidden || !(item as RoutineItem).hidden) // 숨김 처리된 항목은 옵션에 따라 제외
          .forEach((item) => {
            ent.push({ routineId: r.id, routineType: r.type, item: item as RoutineItem })
          })
      })
      // 같은 루틴 안에서는 order 순서대로 나오도록 정렬
      return ent.sort((a, b) => a.item.order - b.item.order)
    }

    // 3️⃣ 현재 시간대 루틴 + 특별미션(상시)을 합쳐 하나의 리스트로 반환
    return [...toEntries(timeList), ...toEntries(specialRoutines)]
  }

  const isItemCompleted = (routineId: string, itemId: string) => {
    const log = profileId ? getTodayLogForProfile(profileId, routineId) : getTodayLog(routineId)
    return log?.completedItems?.includes(itemId) ?? false
  }

  /** 항목 고유 키 (낙관적 제거용) */
  const entryKey = (routineId: string, itemId: string) => `${routineId}:${itemId}`

  /**
   * 수정 모드 / 보기 모드별로 실제로 화면에 보여줄 카드 리스트 계산.
   *
   * - 수정 모드(editMode=true)
   *   · 숨긴 항목까지 모두 보여 주어야 하므로, 완료 여부와 관계없이 getItemEntries(true) 그대로 사용.
   *
   * - 보기 모드(editMode=false)
   *   · 1차로 "현재 시간대 탭"에서 아직 완료하지 않은 미션만 보여 준다.
   *   · 만약 현재 탭에서 보여 줄 미션이 하나도 없고,
   *     오늘 다른 시간대(아침/오후/저녁/주말, 특별미션 제외)에 아직 완료하지 않은 미션이 남아 있다면
   *     → 그 남은 미션들을 자동으로 활성화하여 보여 준다.
   *       (사용자 입장에서는 '모두 완료했어요!' 대신, 아직 남은 미션이 자연스럽게 이어서 노출)
   */
  let itemEntries: RoutineItemEntry[]

  if (editMode) {
    // ✅ 수정 모드: 숨김 여부와 상관없이 모든 항목을 그대로 노출
    itemEntries = getItemEntries(true)
  } else {
    // ✅ 보기 모드 1단계: 현재 시간대 탭 기준으로 아직 완료하지 않은 미션만 필터링
    const baseEntries = getItemEntries(false)
    const visibleInCurrentTab = baseEntries.filter(
      (e) =>
        !justCompletedKeys.has(entryKey(e.routineId, e.item.id)) && // 방금 완료한(낙관적) 항목은 숨김
        !isItemCompleted(e.routineId, e.item.id) // 오늘 이미 완료한 항목은 숨김
    )

    if (visibleInCurrentTab.length > 0) {
      // 🔹 현재 탭에 아직 남은 미션이 있다면 그대로 사용
      itemEntries = visibleInCurrentTab
    } else {
      // ✅ 보기 모드 2단계: 현재 탭에서는 더 이상 보여 줄 미션이 없을 때,
      //                   오늘 다른 시간대 탭에 남아 있는 미션들을 순서대로 모아서 보여 준다.
      const fallbackEntries: RoutineItemEntry[] = []

      // 오늘의 모든 루틴을 타입별로 그룹에서 가져오되, 현재 탭과 특별미션(special)은 제외
      const fallbackTypes = (['morning', 'afternoon', 'evening', 'weekend'] as DashboardTab[]).filter(
        (t) => t !== currentTimeTab
      )

      fallbackTypes.forEach((type) => {
        const list =
          type === 'morning' ? morningRoutines
          : type === 'afternoon' ? afternoonRoutines
          : type === 'evening' ? eveningRoutines
          : weekendRoutines

        list.forEach((r) => {
          r.items.forEach((rawItem) => {
            const item = rawItem as RoutineItem
            if (item.hidden) return // 숨김 처리된 항목은 스킵
            const key = entryKey(r.id, item.id)
            // 오늘 이미 완료했거나 방금 완료 처리된 항목은 제외
            if (justCompletedKeys.has(key) || isItemCompleted(r.id, item.id)) return
            fallbackEntries.push({ routineId: r.id, routineType: r.type, item })
          })
        })
      })

      // 동일 루틴 내에서는 order 기준으로 자연스럽게 정렬
      fallbackEntries.sort((a, b) => a.item.order - b.item.order)

      itemEntries = fallbackEntries
    }
  }

  /**
   * 미션 카드 클릭: 즉시 완료 처리 → 카드 위치에서 터지는 버스트 효과 → 보상 이모지가 레벨 블록으로 날아감.
   * 완료 시점에 리스트에서 제거되므로 카드는 exit 애니메이션으로 사라짐.
   */
  const handleItemComplete = (entry: RoutineItemEntry, e?: React.MouseEvent) => {
    if (!profileId) return
    const key = entryKey(entry.routineId, entry.item.id)
    if (justCompletedKeys.has(key) || isItemCompleted(entry.routineId, entry.item.id)) return
    const cardEl = e?.currentTarget as HTMLElement | undefined
    const levelEl = levelBlockRef.current
    const isSpecial = entry.routineType === 'special'
    const rewardEmoji = isSpecial ? '⭐' : '❤️'

    // 0. 낙관적 업데이트: 클릭 직후 동기 반영해 하트/별 게이지가 즉시 채워지도록 (느리게 보이는 현상 방지)
    flushSync(() => {
      setJustCompletedKeys((prev) => new Set(prev).add(key))
      if (isSpecial) {
        // 특별 미션(별) 완료 시: 화면용 별 게이지를 즉시 +1 하고,
        // 5개가 꽉 찼다면 EXP 바로 날아가는 연출을 예약한다.
        setStarsGauge((prev) => {
          const next = Math.min(5, prev + 1)
          if (next === 5) {
            triggerFlyToExpBarRef.current = { emoji: rewardEmoji, kind: 'star' }
          }
          return next
        })
      } else {
        // 일반 미션(하트) 완료 시: 화면용 하트 게이지를 즉시 +1 하고,
        // 5개가 꽉 찼다면 EXP 바로 날아가는 연출을 예약한다.
        setHeartsGauge((prev) => {
          const next = Math.min(5, prev + 1)
          if (next === 5) {
            triggerFlyToExpBarRef.current = { emoji: rewardEmoji, kind: 'heart' }
          }
          return next
        })
      }
    })
    // 1. 스토어에도 완료 저장 (새로고침 시 반영)
    completeItemForRoutine(entry.routineId, entry.item.id)
    setFlashFood(true)
    setTimeout(() => setFlashFood(false), 500)

    // 2. 카드 위치에서 터지는 버스트 파티클 (하트/별이 사방으로 퍼짐)
    if (cardEl) {
      const cr = cardEl.getBoundingClientRect()
      const cx = cr.left + cr.width / 2
      const cy = cr.top + cr.height / 2
      setBurstAt({ x: cx, y: cy, emoji: rewardEmoji })
      setTimeout(() => setBurstAt(null), 500)
    }

    // 3. 보상 이모지가 레벨 블록으로 날아가는 효과
    if (cardEl && levelEl) {
      const cr = cardEl.getBoundingClientRect()
      const lr = levelEl.getBoundingClientRect()
      setFlyToLevelBlock({
        from: { x: cr.left + cr.width / 2, y: cr.top + cr.height / 2 },
        to: { x: lr.left + lr.width / 2, y: lr.top + lr.height / 2 },
        emoji: rewardEmoji,
      })
      // 3-1. EXP 전환 트리거는 위의 heartsGauge / starsGauge 업데이트 시점에서 이미 예약된다.
    }

    // 4. 오늘 노출 중인 미션을 모두 완료했는지 확인 후 축하 화면
    const allVisible = getItemEntries()
    const uncompletedCount = allVisible.filter((e) => !isItemCompleted(e.routineId, e.item.id)).length
    //    - 단, 같은 날/같은 프로필에서 이미 한 번 축하 화면을 본 적이 있다면 다시 띄우지 않는다.
    if (!hasShownCelebrationToday && allVisible.length > 0 && uncompletedCount === 0) {
      setShowCelebration(true)
      setHasShownCelebrationToday(true)
    }
  }

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

  // 한 화면에 맞춤: 페이지 스크롤 없이 뷰포트 채움, 카드 리스트만 내부 스크롤
  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden bg-[#FFF9F0]">
      <AnimatePresence>{showFoodParticle && <FoodParticleToPet active />}</AnimatePresence>
      {/* 미션 완료 시 카드 위치에서 터지는 버스트 + 보상 이모지가 레벨 블록으로 날아가는 효과 */}
      <AnimatePresence>
        {burstAt && (
          <BurstParticles
            key="burst"
            x={burstAt.x}
            y={burstAt.y}
            emoji={burstAt.emoji}
            onEnd={() => setBurstAt(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {flyToLevelBlock && (
          <FlyingReward
            key="to-level"
            from={flyToLevelBlock.from}
            to={flyToLevelBlock.to}
            emoji={flyToLevelBlock.emoji}
            onEnd={() => {
              setFlyToLevelBlock(null)
              // 하트/별 5개가 막 채워졌으면 레벨 블록 → EXP 바로 5개 날아가는 효과 재생
              const trigger = triggerFlyToExpBarRef.current
              triggerFlyToExpBarRef.current = null
              if (trigger && levelBlockRef.current && expBarRef.current) {
                const lr = levelBlockRef.current.getBoundingClientRect()
                const er = expBarRef.current.getBoundingClientRect()
                setFlyToExpBar({
                  from: { x: lr.left + lr.width / 2, y: lr.top + lr.height * 0.7 },
                  to: { x: er.left + er.width / 2, y: er.top + er.height / 2 },
                  emoji: trigger.emoji,
                  kind: trigger.kind,
                })
              }
            }}
          />
        )}
      </AnimatePresence>
      {/* 하트/별 5개 채워진 뒤 레벨 블록 → EXP 바로 5개 날아가서 레벨 오르는 연출. 도착 시 해당 게이지 5개 리셋(빈 하트/별로) */}
      <AnimatePresence>
        {flyToExpBar && (
          <FlyingFiveToExpBar
            key={`to-exp-${flyToExpBar.kind}`}
            from={flyToExpBar.from}
            to={flyToExpBar.to}
            emoji={flyToExpBar.emoji}
            onEnd={() => {
              const kind = flyToExpBar.kind
              setFlyToExpBar(null)
              if (kind === 'heart') {
                // 하트 5개가 EXP 바로 전환되면, 화면용 하트 게이지를 0으로 비우고
                // 누적 전환 개수(heartGaugeOffset)를 5만큼 올린다.
                setHeartGaugeOffset((prev) => prev + 5)
                setHeartsGauge(0)
                if (profileId) addExp(profileId, 1) // 하트 5개 전환 시 레벨 게이지 +1
              } else if (kind === 'star') {
                // 별 5개가 EXP 바로 전환되면, 화면용 별 게이지를 0으로 비우고
                // 누적 전환 개수(starGaugeOffset)를 5만큼 올린다.
                setStarGaugeOffset((prev) => prev + 5)
                setStarsGauge(0)
                if (profileId) addExp(profileId, 10) // 별 5개 전환 시 레벨 게이지 +10
              }
            }}
          />
        )}
      </AnimatePresence>
      {/* 보상바 먹이 클릭 시 먹이 아이콘 → 캐릭터로 날아간 뒤 EXP 1 증가 */}
      <AnimatePresence>
        {flyToCharacter && (
          <FlyingReward
            key="to-char"
            from={flyToCharacter.from}
            to={flyToCharacter.to}
            emoji="❤️"
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

      {/* 간식 상점: 아래에서 슬라이딩 팝업, 코인으로 구매 */}
      {/* 1st 버튼 클릭 시 아래에서 올라오는 슬라이딩 팝업 */}
      <AnimatePresence>
        {show1stPopup && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setShow1stPopup(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed left-0 right-0 bottom-0 z-50 rounded-t-3xl bg-[#FFF9F0] shadow-2xl border-t border-amber-100 max-h-[70vh] flex flex-col"
              role="dialog"
              aria-label="1st"
            >
              <div className="flex-shrink-0 pt-3 pb-2 px-4">
                <div className="w-10 h-1 rounded-full bg-amber-200 mx-auto mb-3" aria-hidden="true" />
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-amber-800">1st</h2>
                  <button
                    type="button"
                    onClick={() => setShow1stPopup(false)}
                    className="text-amber-600 font-bold text-sm px-3 py-1 rounded-lg hover:bg-amber-100"
                  >
                    닫기
                  </button>
                </div>
              </div>
              <div className="flex-1 px-4 pb-6 overflow-y-auto">
                {/* 여기에 1st 팝업 내용을 자유롭게 추가할 수 있습니다 */}
                <p className="text-gray-600 text-sm py-4">콘텐츠를 추가해 보세요.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SnackShopPopup
            isOpen={showShop}
            onClose={() => setShowShop(false)}
        currentCoins={coins}
        onPurchase={(amount) => spendCoins(amount)}
      />

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

      <div className="px-3 pt-2 pb-4 flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* 상단: room_background 배경 — 뷰포트에 맞춰 높이 비율 고정(약 44%), 캐릭터 중앙 배치 */}
        <section
          className="flex-shrink-0 h-[44%] min-h-[200px] max-h-[340px] flex flex-col bg-cover bg-center bg-no-repeat -mx-3 rounded-b-2xl overflow-hidden"
          style={{ backgroundImage: 'url(/background/room_background.png)' }}
        >
          {/* 캐릭터 영역: 레벨 블록 왼쪽 상단, 캐릭터 중앙, 코인/상점 오른쪽 상·하단 */}
          <div className="relative flex-1 flex items-center justify-center min-h-[120px] px-3 pt-2">
            {/* 레벨 블록: 왼쪽 상단 (미션 완료 시 보상 아이콘이 날아오는 목표) */}
            <div ref={levelBlockRef} className="absolute left-3 top-3 z-10">
              <PetLevelBlock
                level={level}
                expProgress={expProgress}
                expCurrent={expCurrent}
                expNext={expNext}
                heartsFilled={heartsFilled}
                starsFilled={starsFilled}
                expBarRef={expBarRef}
              />
            </div>

            {/* 오른쪽 상단: 코인 블록 + 1st 블록 (기존 스타일 유지) */}
            <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
              {/* 코인 블록 */}
              <div className="flex items-center gap-1.5 rounded-xl bg-white/60 backdrop-blur-md px-2.5 py-1.5 shadow-md border border-white/50">
                <img
                  src="/routine-icons/icons/point/coin.png"
                  alt="코인"
                  className="w-7 h-7 object-contain"
                />
                <span className="text-base font-black text-amber-800 tabular-nums">{coins}</span>
              </div>
              {/* 1st 블록 — 코인과 동일한 스타일·사이즈, 클릭 시 하단 슬라이딩 팝업 */}
              <button
                type="button"
                onClick={() => setShow1stPopup(true)}
                className="flex items-center gap-1.5 rounded-xl bg-white/60 backdrop-blur-md px-2.5 py-1.5 shadow-md border border-white/50 active:scale-95 transition-transform outline-none"
                aria-label="1st"
              >
                <img
                  src="/routine-icons/icons/1st.png"
                  alt="1st"
                  className="w-7 h-7 object-contain"
                />
              </button>
            </div>

            {/* 오른쪽 하단: 상점 아이콘만 표시 (배경 블록 없음, 플로팅 효과) */}
            <motion.button
              type="button"
              onClick={() => setShowShop(true)}
              className="absolute right-3 bottom-3 z-10 flex items-center justify-center w-24 h-24 active:scale-95 transition-transform outline-none"
              aria-label="상점"
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <img
                src="/routine-icons/icons/shop.png"
                alt="상점"
                className="w-20 h-20 object-contain"
              />
            </motion.button>

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

        {/* 카드 리스트: 시간대별 자동(아침~11:59 / 오후~17:59 / 저녁 18:00~) + 특별미션 상시 — 캐릭터 배경과 간격 축소(mt-1) */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-auto pb-4 mt-1">
          {/* 캐릭터 배경 ↔ 루틴 카드 사이: 왼쪽에 Today Missions! 타이틀, 오른쪽에 수정 버튼 */}
          <div className="mt-2 mb-2 flex items-center justify-between gap-2">
            <h2 className="text-base font-black text-gray-700 tracking-tight">Today Missions!</h2>
            <button
              type="button"
              onClick={() => setEditMode((v) => !v)}
              aria-label={editMode ? '완료' : '수정'}
              className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${editMode ? 'bg-amber-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {editMode ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* 수정 모드일 때는 항목이 없어도 리스트 영역을 보여줌 → 루틴 추가·삭제 가능 */}
            {/* 루틴이 하나도 없을 때(모두 완료): "모두 완료했어요!" 문구만 표시 */}
            {!editMode && itemEntries.length === 0 ? (
              <motion.div
                key={`empty-${currentTimeTab}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-center py-8"
              >
                <p className="text-gray-600 text-base font-semibold">모두 완료했어요!</p>
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
        <div className="h-full min-h-0 bg-[#FFF9F0] flex items-center justify-center">
          <div className="text-4xl animate-pulse">🌟</div>
        </div>
      }
    >
      <KidRoutineMainContent />
    </Suspense>
  )
}
