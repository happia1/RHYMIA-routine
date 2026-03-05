'use client';

/**
 * RoutineCardImage.tsx
 * 실제 아이콘 이미지를 쓰는 루틴 카드입니다.
 * 미완료: 흰 배경 + 핑크/민트 테두리, 완료: 초록 오버레이 + 체크.
 * 탭 시 통통 튀는 애니메이션, 완료 시 별 파티클 효과, 이미지 실패 시 이모지 fallback.
 */

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { RoutineDataItem } from '@/lib/utils/routineData';
import { useTTS } from '@/lib/hooks/useTTS';

export interface RoutineCardImageProps {
  /** 루틴 항목 (id, label, icon 경로, ttsText 등) */
  item: RoutineDataItem;
  /** 완료 여부 */
  isCompleted: boolean;
  /** 카드 탭 시 호출 (완료 처리) */
  onComplete: (itemId: string) => void;
}

/** 이미지 로드 실패 시 보여줄 대체 이모지 (루틴 느낌) */
const FALLBACK_EMOJI = '✨';

export default function RoutineCardImage({ item, isCompleted, onComplete }: RoutineCardImageProps) {
  const { speak } = useTTS();
  const [imageError, setImageError] = useState(false);
  const [showStars, setShowStars] = useState(false);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleTap = useCallback(() => {
    if (isCompleted) return;
    speak(item.ttsText);
    setShowStars(true);
    onComplete(item.id);
    // 별 애니메이션 후 상태 초기화
    setTimeout(() => setShowStars(false), 800);
  }, [isCompleted, item, speak, onComplete]);

  return (
    <motion.button
      type="button"
      onClick={handleTap}
      disabled={isCompleted}
      className={`relative w-full aspect-square min-w-[80px] min-h-[80px] rounded-2xl border-2 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 ${
        isCompleted
          ? 'bg-green-50 border-green-300'
          : 'bg-white border-2 border-pink-300 ring-2 ring-teal-200/60 shadow-sm'
      }`}
      initial={false}
      animate={{ scale: 1 }}
      whileTap={isCompleted ? {} : { scale: [0.9, 1.1, 1] }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 15,
        scale: { duration: 0.35 },
      }}
      aria-label={item.label}
      aria-pressed={isCompleted}
    >
      {/* 카드 내용: 이미지 + 라벨 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 flex items-center justify-center">
          {imageError ? (
            <span className="text-4xl sm:text-5xl" role="img" aria-hidden>
              {FALLBACK_EMOJI}
            </span>
          ) : (
            <Image
              src={item.icon}
              alt={item.label}
              width={56}
              height={56}
              className="object-contain w-full h-full"
              onError={handleImageError}
              unoptimized
            />
          )}
        </div>
        <span
          className={`mt-1 text-xs sm:text-sm font-bold text-center leading-tight line-clamp-2 ${
            isCompleted ? 'text-green-600 line-through' : 'text-gray-700'
          }`}
        >
          {item.label}
        </span>
      </div>

      {/* 완료 시: 초록 반투명 오버레이 + 중앙 체크 */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-green-500/40 flex items-center justify-center pointer-events-none"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="text-white text-4xl sm:text-5xl font-bold drop-shadow-md"
              aria-hidden
            >
              ✓
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 완료 순간 별 파티클 3개 위로 */}
      <AnimatePresence>
        {showStars && (
          <div className="absolute inset-0 pointer-events-none flex justify-center">
            {['⭐', '🌟', '✨'].map((star, i) => (
              <motion.span
                key={i}
                initial={{ y: 0, x: (i - 1) * 16, opacity: 1, scale: 1 }}
                animate={{
                  y: -80,
                  x: (i - 1) * 24,
                  opacity: 0,
                  scale: 1.2,
                }}
                transition={{ duration: 0.7, delay: i * 0.05 }}
                className="absolute text-2xl"
              >
                {star}
              </motion.span>
            ))}
          </div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
