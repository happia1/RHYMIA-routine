/**
 * 상단 보상 HUD 바 — ⭐ 스티커 · 🔥 연속일 · 💎 포인트 · 🏆 마일스톤
 * 비개발자: 루틴 메인과 루틴 실행(아침/저녁) 페이지 상단에 공통으로 보이는 바입니다.
 * 포인트/별 획득 시 flash 애니메이션은 선택(flashStar, flashPoint)으로 넣을 수 있어요.
 */

'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export interface RewardHUDProps {
  /** 완료한 루틴 날짜 수 (별 개수) */
  stars: number
  /** 총 포인트 */
  points: number
  /** 연속 완료 일수 */
  streakDays: number
  /** 별 강조 애니메이션 (메인에서 포인트 올랐을 때 등) */
  flashStar?: boolean
  /** 포인트 강조 애니메이션 */
  flashPoint?: boolean
}

export function RewardHUD({
  stars,
  points,
  streakDays,
  flashStar = false,
  flashPoint = false,
}: RewardHUDProps) {
  return (
    <div className="flex items-center justify-between bg-white/95 backdrop-blur rounded-2xl px-4 py-2.5 shadow-sm border border-gray-100">
      {/* 별 클릭 시 스티커함 페이지로 이동 (HUD Stat Bar 연동) */}
      <Link href="/routine/kid/sticker" className="flex items-center gap-1.5 outline-none">
        <motion.div
          animate={flashStar ? { scale: [1, 1.6, 0.9, 1.2, 1], rotate: [0, -15, 15, -5, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-1.5"
        >
          <span className="text-xl">⭐</span>
          <span className="text-sm font-black text-gray-700">{stars}</span>
        </motion.div>
      </Link>

      <div className="flex items-center gap-1.5">
        <span className="text-xl">🔥</span>
        <span className="text-sm font-black text-gray-700">{streakDays}일</span>
      </div>

      <motion.div
        animate={flashPoint ? { scale: [1, 1.5, 0.95, 1.2, 1], y: [0, -5, 0] } : {}}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-1.5"
      >
        <span className="text-xl">💎</span>
        <span className="text-sm font-black text-gray-700">{points}</span>
      </motion.div>

      <Link href="/routine/kid/milestone">
        <span className="text-xl">🏆</span>
      </Link>
    </div>
  )
}
