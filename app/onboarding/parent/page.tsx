/**
 * 부모 타입 선택 — 엄마 / 아빠
 * 비개발자: "나의 루틴" 선택 후, 엄마/아빠 중 어떤 프로필인지 선택해요.
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { ProfileRole } from '@/types/profile'

const PARENT_TYPES = [
  { role: 'mom' as ProfileRole, image: '/profile/mom.png', title: '엄마', color: '#FF8FAB' },
  { role: 'dad' as ProfileRole, image: '/profile/dad.png', title: '아빠', color: '#7EB8D4' },
]

export default function ParentTypePage() {
  const router = useRouter()
  const [selected, setSelected] = useState<ProfileRole | null>(null)

  return (
    <div className="min-h-screen bg-[#FFF9F0] px-5 py-8">
      <button onClick={() => router.back()} className="mb-6 p-2">
        <ArrowLeft className="w-6 h-6 text-gray-500" />
      </button>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <p className="text-sm text-[#7EB8D4] font-bold mb-1">나의 루틴</p>
        <h1 className="text-2xl font-black text-gray-700">어떤 프로필인가요?</h1>
        <p className="text-gray-400 text-sm mt-1">나만의 하루 루틴을 관리해요</p>
      </motion.div>

      <div className="flex gap-4 mb-10">
        {PARENT_TYPES.map(({ role, image, title, color }, i) => (
          <motion.button
            key={role}
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelected(role)}
            className={`flex-1 py-10 rounded-3xl flex flex-col items-center gap-3 border-2 transition-all ${
              selected === role ? 'border-gray-400 bg-white shadow-md' : 'border-gray-100 bg-white'
            }`}
          >
            <img
              src={image}
              alt={title}
              className="w-24 h-24 rounded-full border-2 border-white shadow-md object-cover"
            />
            <p className="font-black text-gray-700 text-xl">{title}</p>
            {selected === role && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: color }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-white" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => selected && router.push(`/onboarding/profile-setup?role=${selected}`)}
        disabled={!selected}
        className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${
          selected ? 'bg-gradient-to-r from-[#7EB8D4] to-[#A8E6CF] text-white shadow-lg' : 'bg-gray-100 text-gray-300'
        }`}
      >
        다음으로 →
      </motion.button>
    </div>
  )
}
