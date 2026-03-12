'use client'

/**
 * 캐릭터 선택 컴포넌트 — 3종 캐릭터(강아지/토끼/오리) 중 하나 선택
 * 비개발자: 온보딩에서 "같이 키울 친구"를 고르면, 선택한 캐릭터 카드만 표시해요.
 * 이미지는 public/routine-icons/pet 폴더의 puppy/cute-puppy, rabbit/rabbit, ducky/ducky 사용.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PetSpecies, PET_META } from '@/types/pet'

interface PetSelectorProps {
  selected: PetSpecies | null
  onSelect: (s: PetSpecies) => void
}

/** 표시 순서: 강아지 → 토끼 → 오리 */
const SPECIES_ORDER: PetSpecies[] = ['dog', 'rabbit', 'duck']

export function PetSelector({ selected, onSelect }: PetSelectorProps) {
  // 이미지 로드 실패 시 이모지로 보여줄 캐릭터
  const [imageError, setImageError] = useState<Record<PetSpecies, boolean>>({
    dog: false,
    rabbit: false,
    duck: false,
  })

  const handleImageError = (species: PetSpecies) => {
    setImageError((prev) => ({ ...prev, [species]: true }))
  }

  return (
    <div>
      <p className="text-sm font-black text-gray-500 mb-3 text-center">
        키울 캐릭터를 선택해요 🐾
      </p>
      <div className="flex justify-center gap-4 flex-wrap">
        {SPECIES_ORDER.map((species) => {
          const meta = PET_META[species]
          const isSelected = selected === species
          const useEmoji = imageError[species]
          return (
            <motion.button
              key={species}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(species)}
              className={`flex flex-col items-center gap-2 w-28 py-4 rounded-2xl border-2 transition-all ${
                isSelected
                  ? 'border-[#FF8FAB] bg-[#FFF0F5] shadow-md'
                  : 'border-gray-100 bg-white'
              }`}
            >
              {/* 카드 이미지: PET_META의 imagePath 사용, 로드 실패 시 이모지 표시 */}
              <div className="w-20 h-20 flex items-center justify-center overflow-hidden rounded-xl bg-white/80">
                {useEmoji ? (
                  <span className="text-4xl">{meta.emoji}</span>
                ) : (
                  <img
                    src={meta.imagePath}
                    alt={meta.label}
                    className="w-full h-full object-contain"
                    onError={() => handleImageError(species)}
                  />
                )}
              </div>
              <p
                className={`text-sm font-black ${
                  isSelected ? 'text-[#FF8FAB]' : 'text-gray-400'
                }`}
              >
                {meta.label}
              </p>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
