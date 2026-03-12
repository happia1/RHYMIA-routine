/**
 * 마이펫 성장 대시보드 전용 상단 HUD (다마고치 스타일)
 * 비개발자: 레벨을 프로그레스 바 형태로, 아이콘 우측 하단에 x0 형태 개수를 표시합니다.
 * 레벨 블록(PetLevelBlock)은 캐릭터 화면 왼쪽에 별도 배치할 수 있도록 분리되어 있습니다.
 */

'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

/** 레벨·EXP 전용 블록 (캐릭터 화면 왼쪽 배치용) */
export interface PetLevelBlockProps {
  level: number
  expProgress: number
  expCurrent: number
  expNext: number
}

export function PetLevelBlock({ level, expProgress, expCurrent, expNext }: PetLevelBlockProps) {
  return (
    <div className="flex-shrink-0 min-w-[90px] flex flex-col justify-center rounded-xl bg-white/75 backdrop-blur-sm px-2.5 py-2 shadow-md border border-amber-100/80">
      <div className="flex items-center justify-between mb-1">
        <span className="text-amber-600 text-sm font-black">LV.{level}</span>
        <span className="text-[10px] text-amber-700/90 font-bold">
          EXP {expCurrent}/{expNext}
        </span>
      </div>
      <div className="h-2.5 bg-amber-100 rounded-full overflow-hidden border border-amber-200/50">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
          initial={false}
          animate={{ width: `${Math.min(100, expProgress * 100)}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export interface PetGrowthHUDProps {
  level: number
  expProgress: number
  expCurrent: number
  expNext: number
  foodCount: number
  /** 별 스티커 개수 (마일스톤 달성 시 +1) */
  stickerCount: number
  /** 다이아몬드 개수 (스티커 5개 → 다이아 1개 전환) */
  points: number
  onFeedClick?: () => void
  flashFood?: boolean
  /** 재화 변경 시 숫자 강조: 별 스티커가 올랐을 때 true */
  flashSticker?: boolean
  /** 재화 변경 시 숫자 강조: 다이아몬드가 올랐을 때 true */
  flashDiamond?: boolean
  /** false면 레벨 블록을 표시하지 않음 (레벨은 캐릭터 왼쪽에 별도 배치) */
  showLevel?: boolean
  /** 보상바 먹이 버튼 DOM 참조 (루틴 완료 시 카드→먹이 아이콘 날아가는 효과의 목표 위치용) */
  foodIconRef?: React.RefObject<HTMLButtonElement | null>
}

export function PetGrowthHUD({
  level,
  expProgress,
  expCurrent,
  expNext,
  foodCount,
  stickerCount,
  points,
  onFeedClick,
  flashFood = false,
  flashSticker = false,
  flashDiamond = false,
  showLevel = false,
  foodIconRef,
}: PetGrowthHUDProps) {
  return (
    <div className="flex items-center justify-between gap-2 bg-white/95 backdrop-blur rounded-2xl px-3 py-2.5 shadow-md border border-amber-100">
      {/* 레벨: showLevel일 때만 상단 바에 표시 (기본은 캐릭터 왼쪽에 별도 배치) */}
      {showLevel && (
        <div className="flex-shrink-0 min-w-[100px]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-amber-600 text-sm font-black">LV.{level}</span>
            <span className="text-[10px] text-amber-700/90 font-bold">
              EXP {expCurrent}/{expNext}
            </span>
          </div>
          <div className="h-2.5 bg-amber-100 rounded-full overflow-hidden border border-amber-200/50">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
              initial={false}
              animate={{ width: `${Math.min(100, expProgress * 100)}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* 하트(보상): 블록 클릭 시 한 개씩 캐릭터 EXP에 전달 + 강조 애니메이션 (ref로 상단바 하트 위치 전달) */}
      <motion.button
        ref={foodIconRef}
        type="button"
        onClick={onFeedClick}
        animate={flashFood ? { scale: [1, 1.25, 1.1] } : {}}
        transition={{ duration: 0.4 }}
        className="relative flex items-center justify-center w-10 h-10 outline-none"
        aria-label="하트로 EXP 채우기"
      >
        <span className="text-2xl">❤️</span>
        <motion.span
          animate={flashFood ? { scale: [1, 1.5, 1.2], color: ['#be123c', '#e11d48', '#be123c'] } : {}}
          transition={{ duration: 0.4 }}
          className="absolute bottom-0 right-0 text-[10px] font-black text-rose-700 bg-rose-100 rounded px-0.5 min-w-[18px] text-center"
        >
          x{foodCount}
        </motion.span>
      </motion.button>

      {/* 별 스티커: 재화 변경 시 강조 애니메이션 */}
      <Link href="/routine/kid/sticker" className="relative flex items-center justify-center w-10 h-10 outline-none">
        <span className="text-2xl">⭐</span>
        <motion.span
          animate={flashSticker ? { scale: [1, 1.4, 1.15], color: ['#92400e', '#f59e0b', '#92400e'] } : {}}
          transition={{ duration: 0.4 }}
          className="absolute bottom-0 right-0 text-[10px] font-black text-amber-800 bg-amber-100 rounded px-0.5 min-w-[18px] text-center"
        >
          x{stickerCount}
        </motion.span>
      </Link>

      {/* 다이아몬드: 재화 변경 시 강조 애니메이션 */}
      <Link href="/routine/kid/shop" className="relative flex items-center justify-center w-10 h-10 outline-none">
        <span className="text-2xl">💎</span>
        <motion.span
          animate={flashDiamond ? { scale: [1, 1.4, 1.15], color: ['#92400e', '#06b6d4', '#92400e'] } : {}}
          transition={{ duration: 0.4 }}
          className="absolute bottom-0 right-0 text-[10px] font-black text-amber-800 bg-amber-100 rounded px-0.5 min-w-[18px] text-center"
        >
          x{points}
        </motion.span>
      </Link>

      {/* 트로피(마일스톤) */}
      <Link href="/routine/kid/milestone" className="flex items-center justify-center w-10 h-10 outline-none" aria-label="마일스톤">
        <span className="text-2xl">🏆</span>
      </Link>
    </div>
  )
}
