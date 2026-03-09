/**
 * 루틴 미션 카드 (이미지 로드 실패 시 이모지 fallback)
 * 비개발자: 미션 하나를 카드로 보여줍니다. 이미지가 있으면 표시하고, 로드 실패 시 이모지로 대체해요.
 */

'use client'

import { RoutineItem } from '@/types/routine'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ROUTINE_IMAGES, LABEL_TO_IMAGE_KEY } from '@/lib/utils/defaultRoutines'

interface RoutineCardProps {
  item: RoutineItem
  isCompleted: boolean
  isPending: boolean
  onComplete: (itemId: string) => void
}

export function RoutineCard({ item, isCompleted, isPending, onComplete }: RoutineCardProps) {
  const [imgError, setImgError] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleTap = () => {
    if (isCompleted || isPending || isAnimating) return
    setIsAnimating(true)
    setTimeout(() => {
      onComplete(item.id)
      setIsAnimating(false)
    }, 250)
  }

  const labelKey = item.label?.trim() ? LABEL_TO_IMAGE_KEY[item.label.trim()] : undefined
  const resolvedKey = labelKey ?? item.imageKey
  const imagePath = (resolvedKey ? ROUTINE_IMAGES[resolvedKey] ?? null : null) ?? item.imagePath ?? null
  const showImage = imagePath && !imgError

  return (
    <AnimatePresence>
      {!isCompleted && (
        <motion.div
          layout
          onClick={handleTap}
          whileTap={!isPending ? { scale: 0.94 } : {}}
          animate={{
            opacity: isPending ? 0.5 : 1,
            filter: isPending ? 'grayscale(0.5)' : 'none',
          }}
          exit={{
            scale: [1, 1.1, 0],
            opacity: [1, 1, 0],
            rotate: [0, -8, 8],
            transition: { duration: 0.45 },
          }}
          className={`
            relative flex items-center gap-4 p-4 rounded-3xl select-none
            ${!isPending
              ? 'bg-white shadow-md shadow-pink-100 border-2 border-pink-50 cursor-pointer'
              : 'bg-gray-100 border-2 border-gray-200 cursor-not-allowed'
            }
          `}
        >
          {/* 이미지 박스: next/image 대신 일반 img + 로드 실패 시 이모지 */}
          <motion.div
            className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-[#FFF0F5] flex items-center justify-center"
            animate={isAnimating ? { scale: [1, 1.15, 1], rotate: [0, -8, 8, 0] } : {}}
            transition={{ duration: 0.35 }}
          >
            {showImage ? (
              <img
                src={imagePath!}
                alt={item.label}
                className="w-full h-full object-contain p-1"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="text-5xl">{item.icon}</span>
            )}
          </motion.div>

          {/* 텍스트 */}
          <div className="flex-1 min-w-0">
            <p
              className={`text-xl font-black leading-tight ${
                isPending ? 'text-gray-400' : 'text-gray-700'
              }`}
            >
              {item.label}
            </p>
            {isPending && (
              <motion.p
                className="text-xs text-amber-500 font-semibold mt-1"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              >
                ⏳ 엄마/아빠 확인 중...
              </motion.p>
            )}
            {/* 타이머 표시 (timerEnabled인 미션만) */}
            {item.timerEnabled && item.timerSeconds > 0 && !isPending && (
              <p className="text-xs text-[#FF8FAB] font-semibold mt-1">
                ⏱ {Math.floor(item.timerSeconds / 60)}분 안에 해봐요!
              </p>
            )}
          </div>

          {/* 대기중 아이콘 */}
          {isPending && (
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-xl">⏳</span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
