// components/kid/RoutineCard.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { RoutineItem } from '@/types/routine';
import { useTTS } from '@/lib/hooks/useTTS';

interface RoutineCardProps {
  item: RoutineItem;
  isCompleted: boolean;
  onComplete: (itemId: string) => void;
}

export default function RoutineCard({ item, isCompleted, onComplete }: RoutineCardProps) {
  const { speak } = useTTS();

  const handleTap = () => {
    if (isCompleted) return;
    speak(item.ttsText);
    // 약간 딜레이 후 완료 처리 (TTS 시작 후 피드백)
    setTimeout(() => onComplete(item.id), 300);
  };

  return (
    <motion.div
      layout
      whileTap={{ scale: isCompleted ? 1 : 0.92 }}
      className={`
        relative flex items-center gap-4 p-5 rounded-3xl border-4 cursor-pointer select-none
        transition-all duration-300
        ${isCompleted
          ? 'bg-green-50 border-green-300 opacity-80'
          : 'bg-white border-pink-200 shadow-lg hover:shadow-xl hover:border-pink-400'
        }
      `}
      onClick={handleTap}
    >
      {/* 이모지 아이콘 */}
      <div className="text-6xl flex-shrink-0 w-20 text-center">
        {item.icon}
      </div>

      {/* 라벨 */}
      <div className="flex-1">
        <p className={`text-2xl font-bold ${isCompleted ? 'text-green-600 line-through' : 'text-gray-700'}`}>
          {item.label}
        </p>
      </div>

      {/* 체크박스 */}
      <div
        className={`
          w-14 h-14 rounded-full border-4 flex items-center justify-center flex-shrink-0
          transition-all duration-300
          ${isCompleted
            ? 'bg-green-400 border-green-500'
            : 'bg-gray-100 border-gray-300'
          }
        `}
      >
        <AnimatePresence>
          {isCompleted && (
            <motion.span
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              className="text-white text-2xl font-bold"
            >
              ✓
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* 완료 파티클 효과 */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
          >
            {['⭐', '✨', '🌟'].map((star, i) => (
              <motion.span
                key={i}
                initial={{ y: 0, x: 0, opacity: 1, scale: 1 }}
                animate={{
                  y: -60 - i * 20,
                  x: (i - 1) * 40,
                  opacity: 0,
                  scale: 1.5,
                }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                className="absolute text-2xl"
              >
                {star}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* TTS 버튼 (보조) */}
      <button
        className="absolute top-2 right-2 text-gray-300 hover:text-pink-400 text-lg"
        onClick={(e) => {
          e.stopPropagation();
          speak(item.ttsText);
        }}
        aria-label="음성으로 듣기"
      >
        🔊
      </button>
    </motion.div>
  );
}
