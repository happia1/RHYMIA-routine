// components/kid/PetWidget.tsx
'use client';

import { motion } from 'framer-motion';
import { VirtualCompanion, GROWTH_STAGE_LABELS } from '@/types/routine';

const PET_EMOJIS: Record<string, string[]> = {
  // [species]: [stage0, stage1, stage2, stage3, stage4]
  dog:     ['🥚', '🐶', '🐕', '🦮', '🐕‍🦺'],
  cat:     ['🥚', '🐱', '🐈', '🐈', '😺'],
  rabbit:  ['🥚', '🐰', '🐇', '🐇', '🐇'],
  hamster: ['🥚', '🐹', '🐹', '🐹', '🐹'],
  // plants
  sunflower: ['🌱', '🌿', '🌾', '🌻', '🌻'],
  cactus:    ['🌱', '🌿', '🪴', '🌵', '🌵'],
  tulip:     ['🌱', '🌿', '🪴', '🌷', '🌷'],
  tree:      ['🌱', '🌿', '🌳', '🌳', '🌲'],
};

interface PetWidgetProps {
  companion: VirtualCompanion;
  onFeed?: () => void;
}

export default function PetWidget({ companion, onFeed }: PetWidgetProps) {
  const emoji = PET_EMOJIS[companion.species]?.[companion.growthStage] ?? '🥚';
  const stageLabel = GROWTH_STAGE_LABELS[companion.growthStage];
  const happinessPercent = companion.happiness;

  return (
    <div className="bg-gradient-to-br from-pink-50 to-mint-50 rounded-3xl p-5 border-2 border-pink-200 shadow-md">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-lg font-bold text-gray-700">{companion.name}</p>
          <p className="text-sm text-gray-400">{stageLabel} 단계</p>
        </div>
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="text-6xl"
        >
          {emoji}
        </motion.div>
      </div>

      {/* 행복도 바 */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>💖 행복도</span>
          <span>{happinessPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${happinessPercent}%` }}
            transition={{ duration: 0.5 }}
            className="h-3 rounded-full bg-gradient-to-r from-pink-400 to-red-400"
          />
        </div>
      </div>

      {/* 경험치 바 */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>⭐ 경험치</span>
          <span>{companion.totalExp}P</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-3 rounded-full bg-gradient-to-r from-yellow-300 to-orange-400"
            style={{ width: `${Math.min(100, (companion.totalExp % 100))}%` }}
          />
        </div>
      </div>

      {/* 먹이주기 버튼 (포인트 필요) */}
      {onFeed && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onFeed}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-400 to-pink-400 text-white font-bold text-lg shadow-md"
        >
          {companion.type === 'pet' ? '🍖 먹이 주기' : '💧 물 주기'}
        </motion.button>
      )}
    </div>
  );
}
