/**
 * 미션 완료 직후 보여주는 축하 팝업
 * 비개발자: 아이가 미션 카드를 탭해 "완료했어요!"라고 하면, 2초 동안 "잘했어요! 엄마한테 확인 중이에요!" 팝업을 띄웁니다.
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { useTTS } from '@/lib/hooks/useTTS'
import { TTS_SCRIPTS } from '@/lib/hooks/useTTSMessages'

interface MissionCompletePopupProps {
  show: boolean
  itemIcon: string
  /** 루틴 아이콘 이미지 경로 (있으면 이미지 표시, 없으면 itemIcon 이모지) */
  itemImagePath?: string | null
  itemLabel: string
  onClose: () => void
}

export function MissionCompletePopup({ show, itemIcon, itemImagePath, itemLabel, onClose }: MissionCompletePopupProps) {
  const { speak } = useTTS({ preset: 'kid' })

  useEffect(() => {
    if (show) {
      // TTS: 미션 탭 시 귀여운 축하 문구 (밝은 여자아이 목소리)
      speak(TTS_SCRIPTS.missionTap(itemLabel))
      // 2초 후 자동 닫기
      const t = setTimeout(onClose, 2200)
      return () => clearTimeout(t)
    }
  }, [show, itemLabel, onClose, speak])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
        >
          {/* 배경 블러 (화면 살짝 흐리게) */}
          <motion.div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

          {/* 팝업 카드 */}
          <motion.div
            initial={{ scale: 0.5, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="relative bg-white rounded-3xl px-10 py-8 flex flex-col items-center shadow-2xl mx-8"
          >
            {/* 파티클 이모지들 (별·반짝임 효과) */}
            {['⭐', '✨', '🌟', '💫', '⭐'].map((e, i) => (
              <motion.span
                key={i}
                className="absolute text-2xl"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  x: (i - 2) * 50,
                  y: -60 - Math.abs(i - 2) * 20,
                }}
                transition={{ delay: i * 0.08, duration: 0.8 }}
              >
                {e}
              </motion.span>
            ))}

            {/* 미션 아이콘: 이미지가 있으면 이미지, 없으면 이모지 (살짝 흔들리는 애니메이션) */}
            <motion.div
              className={`mb-3 flex items-center justify-center ${itemImagePath ? 'w-20 h-20' : 'text-7xl'}`}
              animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
              transition={{ duration: 0.5 }}
            >
              {itemImagePath ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={itemImagePath} alt="" className="w-full h-full object-contain" />
              ) : (
                itemIcon
              )}
            </motion.div>

            <p className="text-2xl font-black text-gray-700 mb-1">{itemLabel}</p>
            <p className="text-base text-pink-400 font-bold">잘했어요! 🎉</p>

            {/* "엄마/아빠 확인 중..." 안내 */}
            <div className="mt-4 flex items-center gap-2 bg-amber-50 rounded-2xl px-4 py-2">
              <span className="text-xl">⏳</span>
              <p className="text-sm text-amber-600 font-semibold">엄마/아빠 확인 중...</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
