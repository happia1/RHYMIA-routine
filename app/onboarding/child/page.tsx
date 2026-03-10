/**
 * 자녀 온보딩 — 나이대 → 성별 → 캐릭터 선택
 * 비개발자: "우리아이 루틴" 선택 후, 미취학/학령기 → 여아·남아(또는 여학생·남학생) → 키울 캐릭터를 고르고 프로필 설정으로 넘어가요.
 * 학령기는 girl_student/boy_student 이미지, 성별 선택 시 테두리로 선택 상태를 표시해요.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Check } from 'lucide-react'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'
import { PetSelector } from '@/components/onboarding/PetSelector'
import { PetSpecies, PET_META } from '@/types/pet'
import type { ProfileRole } from '@/types/profile'

type Step = 'age' | 'gender' | 'pet'
type AgeType = 'preschool' | 'school'
type Gender = 'girl' | 'boy'

export default function ChildOnboardingPage() {
  const router = useRouter()
  const { setChildRole, setChildGender, setSelectedPetSpecies } = useOnboardingStore()

  const [step, setStep] = useState<Step>('age')
  const [selectedAge, setSelectedAge] = useState<AgeType | null>(null)
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null)
  const [selectedPet, setSelectedPet] = useState<PetSpecies | null>(null)

  const isPreschool = selectedAge === 'preschool'

  const handleAgeSelect = (age: AgeType) => {
    setSelectedAge(age)
    setChildRole(
      age === 'preschool' ? 'child_preschool' : 'child_school'
    )
    setTimeout(() => setStep('gender'), 250)
  }

  const handleGenderSelect = (gender: Gender) => {
    setSelectedGender(gender)
    setChildGender(gender)
    setTimeout(() => setStep('pet'), 250)
  }

  const handlePetConfirm = () => {
    if (!selectedPet) return
    setSelectedPetSpecies(selectedPet)
    router.push('/onboarding/profile-setup')
  }

  const goBack = () => {
    if (step === 'pet') setStep('gender')
    else if (step === 'gender') setStep('age')
    else router.back()
  }

  /** 학령기: 여학생/남학생 이미지, 미취학: 여아/남아 이미지 */
  const genderImages = {
    girl: isPreschool ? '/profile/girl.png' : '/profile/girl_student.png',
    boy: isPreschool ? '/profile/boy.png' : '/profile/boy_student.png',
  }
  const genderLabels = {
    girl: isPreschool ? '여아' : '여학생',
    boy: isPreschool ? '남아' : '남학생',
  }
  const borderColors: Record<Gender, string> = {
    girl: '#FF8FAB',
    boy: '#7EB8D4',
  }

  return (
    <div className="min-h-screen bg-[#FFF9F0] px-5 pt-8 pb-10">
      <button
        type="button"
        onClick={goBack}
        className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center mb-8"
      >
        <ArrowLeft className="w-5 h-5 text-gray-600" />
      </button>

      {/* 진행 도트 */}
      <div className="flex gap-1.5 mb-8">
        {(['age', 'gender', 'pet'] as Step[]).map((s, i) => (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all ${
              s === step
                ? 'w-8 bg-[#FF8FAB]'
                : i < ['age', 'gender', 'pet'].indexOf(step)
                  ? 'w-4 bg-[#FF8FAB]/40'
                  : 'w-4 bg-gray-200'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: 나이대 */}
        {step === 'age' && (
          <motion.div
            key="age"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <p className="text-[#FF8FAB] font-black text-sm mb-1">
              우리아이 루틴
            </p>
            <h1 className="text-3xl font-black text-gray-800 mb-2">
              자녀가 몇 살인가요?
            </h1>
            <p className="text-gray-400 text-sm mb-8">
              나이에 맞는 루틴 화면을 제공해요
            </p>

            <div className="flex flex-col gap-3">
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAgeSelect('preschool')}
                className="w-full bg-white rounded-3xl p-5 border-2 border-transparent shadow-sm text-left hover:border-[#FF8FAB] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    <img
                      src="/profile/girl.png"
                      alt="여아"
                      className="w-12 h-12 rounded-full border-2 border-white object-cover shadow"
                    />
                    <img
                      src="/profile/boy.png"
                      alt="남아"
                      className="w-12 h-12 rounded-full border-2 border-white object-cover shadow"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-gray-800 text-lg">
                      미취학 아동
                    </p>
                    <p className="text-gray-400 text-sm">
                      유치원 · 어린이집 (7세 이하)
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {[
                        '이미지 카드 루틴',
                        '엄마가 세팅해줘요',
                        '등하원 타이머',
                        '펫 보상',
                      ].map((t) => (
                        <span
                          key={t}
                          className="text-[10px] bg-[#FFF0F5] text-[#FF8FAB] font-bold px-2 py-0.5 rounded-full"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.button>

              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAgeSelect('school')}
                className="w-full bg-white rounded-3xl p-5 border-2 border-transparent shadow-sm text-left hover:border-[#7EB8D4] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    <img
                      src="/profile/girl_student.png"
                      alt="여학생"
                      className="w-12 h-12 rounded-full border-2 border-white object-cover shadow"
                    />
                    <img
                      src="/profile/boy_student.png"
                      alt="남학생"
                      className="w-12 h-12 rounded-full border-2 border-white object-cover shadow"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-gray-800 text-lg">
                      학령기 자녀
                    </p>
                    <p className="text-gray-400 text-sm">
                      초등학생 이상 (8세~)
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {[
                        '이미지 루틴',
                        '스스로 설정',
                        '스트릭 달성',
                        '통계 차트',
                      ].map((t) => (
                        <span
                          key={t}
                          className="text-[10px] bg-blue-50 text-blue-400 font-bold px-2 py-0.5 rounded-full"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 2: 성별 (테두리로 선택 표시, 학령기=여학생/남학생) */}
        {step === 'gender' && (
          <motion.div
            key="gender"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <p className="text-[#FF8FAB] font-black text-sm mb-1">
              우리아이 루틴
            </p>
            <h1 className="text-3xl font-black text-gray-800 mb-2">
              어떤 아이인가요?
            </h1>
            <p className="text-gray-400 text-sm mb-8">
              프로필 기본 이미지로 사용해요
            </p>

            <div className="flex gap-4">
              {(['girl', 'boy'] as Gender[]).map((g) => {
                const isSelected = selectedGender === g
                return (
                  <motion.button
                    key={g}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleGenderSelect(g)}
                    className="flex-1 bg-white rounded-3xl p-6 flex flex-col items-center gap-4 shadow-sm transition-all"
                    style={{
                      border: `3px solid ${isSelected ? borderColors[g] : '#F0F0F0'}`,
                      boxShadow: isSelected
                        ? `0 8px 24px ${borderColors[g]}44`
                        : undefined,
                    }}
                  >
                    <div
                      className="relative w-28 h-28 rounded-full overflow-hidden"
                      style={{
                        border: `4px solid ${borderColors[g]}`,
                        boxShadow: `0 0 0 3px ${borderColors[g]}33`,
                      }}
                    >
                      <img
                        src={genderImages[g]}
                        alt={genderLabels[g]}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center bg-black/20"
                        >
                          <Check
                            className="w-10 h-10 text-white"
                            strokeWidth={3}
                          />
                        </motion.div>
                      )}
                    </div>
                    <p className="font-black text-gray-800 text-xl">
                      {genderLabels[g]}
                    </p>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Step 3: 캐릭터 선택 */}
        {step === 'pet' && (
          <motion.div
            key="pet"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <p className="text-[#FF8FAB] font-black text-sm mb-1">
              우리아이 루틴
            </p>
            <h1 className="text-3xl font-black text-gray-800 mb-2">
              같이 키울 친구를
              <br />
              선택해요!
            </h1>
            <p className="text-gray-400 text-sm mb-8">
              루틴을 완료하면 친구가 자라요 🌱
            </p>

            <PetSelector selected={selectedPet} onSelect={setSelectedPet} />

            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={handlePetConfirm}
              disabled={!selectedPet}
              className="w-full mt-8 py-4 rounded-2xl font-black text-white text-lg disabled:opacity-30 transition-opacity"
              style={{
                background: selectedPet
                  ? 'linear-gradient(135deg, #FF8FAB, #FFD93D)'
                  : '#E5E5E5',
              }}
            >
              {selectedPet
                ? `${PET_META[selectedPet].label}와 함께 시작하기! 🎉`
                : '캐릭터를 선택해주세요'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
