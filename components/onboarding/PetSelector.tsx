'use client'

/**
 * 캐릭터 선택 컴포넌트 — 5종 캐릭터(펭귄/파랑새/강아지/고양이/식물) 중 하나 선택
 * 비개발자: 온보딩에서 "같이 키울 친구"를 고르면, 선택한 캐릭터의 성장 단계 미리보기와 먹이 정보가 보여요.
 */

import { motion } from 'framer-motion'
import { PetSpecies, PET_META } from '@/types/pet'

interface PetSelectorProps {
  selected: PetSpecies | null
  onSelect: (s: PetSpecies) => void
}

/** 표시 순서: 펭귄 → 파랑새 → 강아지 → 고양이 → 식물 */
const SPECIES_ORDER: PetSpecies[] = ['penguin', 'bluebird', 'dog', 'cat', 'plant']

export function PetSelector({ selected, onSelect }: PetSelectorProps) {
  return (
    <div>
      <p className="text-sm font-black text-gray-500 mb-3 text-center">
        키울 캐릭터를 선택해요 🐾
      </p>
      <div className="flex justify-center gap-3 flex-wrap">
        {SPECIES_ORDER.map((species) => {
          const meta = PET_META[species]
          const isSelected = selected === species
          return (
            <motion.button
              key={species}
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => onSelect(species)}
              className={`flex flex-col items-center gap-1.5 w-16 py-3 rounded-2xl border-2 transition-all ${
                isSelected
                  ? 'border-[#FF8FAB] bg-[#FFF0F5] shadow-md'
                  : 'border-gray-100 bg-white'
              }`}
            >
              <span className="text-3xl">{meta.stages[1]}</span>
              <p
                className={`text-xs font-black ${
                  isSelected ? 'text-[#FF8FAB]' : 'text-gray-400'
                }`}
              >
                {meta.label}
              </p>
            </motion.button>
          )
        })}
      </div>

      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex flex-col items-center"
        >
          <p className="text-xs text-gray-400 mb-2">성장 단계 미리보기</p>
          <div className="flex items-end gap-2">
            {PET_META[selected].stages.map((emoji, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className="flex flex-col items-center"
              >
                <span style={{ fontSize: 16 + i * 6 }}>{emoji}</span>
                <div className="w-1 h-1 rounded-full bg-gray-200 mt-1" />
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-gray-300 mt-1">
            루틴 완료 시 {PET_META[selected].feedEmoji}{' '}
            {PET_META[selected].feedLabel} 획득!
          </p>
        </motion.div>
      )}
    </div>
  )
}
