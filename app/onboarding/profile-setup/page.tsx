/**
 * 프로필 설정 — 이름·아바타·(자녀) 기관·시간
 * 비개발자: 역할 선택 후 이름·이모지·색상·(자녀 시) 다니는 곳·집 나서는/등원/하원 시간을 입력하고 완료하면 해당 루틴 화면으로 이동해요.
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Check } from 'lucide-react'
import { useProfileStore } from '@/lib/stores/profileStore'
import { useKidRoutineStore } from '@/lib/stores/kidRoutineStore'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'
import { ProfileImagePicker } from '@/components/profile/ProfileImagePicker'
import { ProfileRole, ROLE_META, AVATAR_COLORS } from '@/types/profile'

const AVATAR_EMOJIS: Record<string, string[]> = {
  child_preschool: ['🧒', '👦', '👧', '🐣', '🐥', '🌱', '⭐', '🌟'],
  child_school: ['🎒', '📚', '🏃', '⚽', '🎨', '🎮', '🌈', '🦋'],
  mom: ['👩', '👩‍💼', '👩‍🍳', '🧘‍♀️', '👩‍💻', '🌸', '☕', '💐'],
  dad: ['👨', '👨‍💼', '👨‍🍳', '🏋️', '👨‍💻', '⚽', '🎸', '🧩'],
}

const INSTITUTION_TYPES = [
  { value: 'kindergarten' as const, label: '유치원', emoji: '🏫', arrivalDefault: '09:00', departureDefault: '08:20' },
  { value: 'daycare' as const, label: '어린이집', emoji: '🏡', arrivalDefault: '09:30', departureDefault: '09:00' },
  { value: 'elementary' as const, label: '초등학교', emoji: '🎒', arrivalDefault: '08:40', departureDefault: '08:10' },
]

export default function ProfileSetupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const childRole = useOnboardingStore((s) => s.childRole)
  const childGender = useOnboardingStore((s) => s.childGender)
  const resetOnboarding = useOnboardingStore((s) => s.reset)
  const role = (childRole ?? searchParams.get('role')) as ProfileRole
  const { addProfile, setActiveProfile } = useProfileStore()
  const { applyTimerSettings, setCurrentProfileId } = useKidRoutineStore()

  const isChild = role === 'child_preschool' || role === 'child_school'
  const isParent = role === 'mom' || role === 'dad'
  const meta = role ? ROLE_META[role] : null
  const availableEmojis = (role && AVATAR_EMOJIS[role]) ?? ['😊']

  /** 엄마/아빠는 선택한 이미지(mom.png/dad.png)를 기본 프로필 사진으로 사용 */
  const defaultParentImage = role === 'mom' ? '/profile/mom.png' : role === 'dad' ? '/profile/dad.png' : null

  const [name, setName] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState(meta?.emoji ?? availableEmojis[0])
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0])
  const [customPhotoBase64, setCustomPhotoBase64] = useState<string | null>(null)
  const [institutionType, setInstitutionType] = useState<'kindergarten' | 'daycare' | 'elementary' | null>(null)
  const [departureTime, setDepartureTime] = useState('')
  const [arrivalTime, setArrivalTime] = useState('')
  const [returnTime, setReturnTime] = useState('')
  const [missionTimers, setMissionTimers] = useState<Record<string, number>>({
    'km-2': 0, 'km-3': 0, 'km-4': 0, 'km-5': 0, 'km-6': 0,
    'ke-3': 0, 'ke-4': 0,
  })

  const TIMER_MISSIONS = [
    { id: 'km-2', label: '🫧 세수하기' },
    { id: 'km-3', label: '🪥 양치하기' },
    { id: 'km-4', label: '👗 옷 입기' },
    { id: 'km-5', label: '🍳 아침 먹기' },
    { id: 'km-6', label: '🎒 가방 챙기기' },
    { id: 'ke-3', label: '🛁 목욕하기' },
    { id: 'ke-4', label: '📖 책 읽기' },
  ]

  const isValid = name.trim().length > 0

  const handleInstitutionSelect = (inst: (typeof INSTITUTION_TYPES)[number]) => {
    setInstitutionType(inst.value)
    if (!departureTime) setDepartureTime(inst.departureDefault)
    if (!arrivalTime) setArrivalTime(inst.arrivalDefault)
  }

  const handleComplete = () => {
    if (!isValid || !role || !meta) return

    const newProfile = addProfile({
      name: name.trim(),
      role,
      avatarEmoji: selectedEmoji,
      avatarColor: selectedColor,
      gender: isChild ? childGender ?? undefined : undefined,
      customPhotoBase64: customPhotoBase64 ?? undefined,
      useCustomPhoto: !!customPhotoBase64,
      childSettings: isChild
        ? {
            institutionType,
            departureTime: departureTime || null,
            arrivalTime: arrivalTime || null,
            returnTime: returnTime || null,
            missionTimers,
          }
        : undefined,
    })

    setActiveProfile(newProfile.id)
    if (isChild) {
      setCurrentProfileId(newProfile.id)
      applyTimerSettings(missionTimers)
    }
    resetOnboarding()

    if (role === 'child_preschool') {
      router.replace('/routine/kid')
    } else {
      router.replace('/routine/personal')
    }
  }

  if (!role || !meta) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center">
        <p className="text-gray-400">잘못된 접근이에요. 프로필을 처음부터 선택해주세요.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF9F0] px-5 py-8 pb-32">
      <button onClick={() => router.back()} className="mb-6 p-2">
        <ArrowLeft className="w-6 h-6 text-gray-500" />
      </button>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="text-sm font-bold mb-1" style={{ color: meta.color }}>
          {meta.label} 프로필
        </p>
        <h1 className="text-2xl font-black text-gray-700">프로필을 만들어요</h1>
      </motion.div>

      {/* 프로필 이미지: 엄마/아빠는 선택한 이미지(mom/dad.png), 자녀는 girl/boy 또는 업로드 */}
      <div className="flex flex-col items-center mb-8">
        <ProfileImagePicker
          currentSrc={
            customPhotoBase64
              ? customPhotoBase64
              : defaultParentImage
                ? defaultParentImage
                : isChild && childGender === 'girl'
                  ? '/profile/girl.png'
                  : isChild && childGender === 'boy'
                    ? '/profile/boy.png'
                    : null
          }
          fallbackEmoji={selectedEmoji}
          avatarColor={selectedColor}
          onSave={(base64) => setCustomPhotoBase64(base64)}
          size={100}
        />
        <p className="text-xs text-gray-400 mt-3">
          {customPhotoBase64 ? '✅ 사진 업로드 완료' : isParent ? '선택한 프로필 사진이 적용돼요' : '아이콘을 눌러 사진을 추가해요'}
        </p>
      </div>

      <div className="mb-6">
        <p className="text-xs text-gray-400 font-semibold mb-2 text-center">배경 색상</p>
        <div className="flex justify-center gap-3">
          {AVATAR_COLORS.map((color) => (
            <motion.button
              key={color}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedColor(color)}
              className={`w-8 h-8 rounded-full transition-all ${
                selectedColor === color ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : ''
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="text-sm font-bold text-gray-500 mb-2 block">
          {isChild ? '자녀 이름' : '이름 또는 호칭'}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={isChild ? '예: 지수, 민준이' : '예: 엄마, 아빠, 김지영'}
          maxLength={10}
          className="w-full px-4 py-4 rounded-2xl border-2 border-gray-100 bg-white text-gray-700 font-bold text-lg focus:outline-none focus:border-[#FF8FAB] transition-colors"
        />
      </div>

      <AnimatePresence>
        {isChild && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="mb-5">
              <label className="text-sm font-bold text-gray-500 mb-2 block">다니는 곳</label>
              <div className="flex gap-2">
                {INSTITUTION_TYPES.map((inst) => (
                  <motion.button
                    key={inst.value}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleInstitutionSelect(inst)}
                    className={`flex-1 py-4 rounded-2xl flex flex-col items-center gap-1 border-2 transition-all ${
                      institutionType === inst.value
                        ? 'border-[#FF8FAB] bg-pink-50'
                        : 'border-gray-100 bg-white'
                    }`}
                  >
                    <span className="text-2xl">{inst.emoji}</span>
                    <span className="text-xs font-bold text-gray-600">{inst.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="text-sm font-bold text-gray-500 mb-3 block">⏰ 시간 설정</label>
              <div className="flex flex-col gap-3">
                <div className="bg-white border-2 border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <span className="text-xl">🚪</span>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 font-semibold">집 나서는 시간</p>
                    <input
                      type="time"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      className="text-xl font-black text-gray-700 focus:outline-none bg-transparent w-full"
                    />
                  </div>
                  <span className="text-xs text-gray-300">출발</span>
                </div>

                <div className="bg-white border-2 border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <span className="text-xl">🏫</span>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 font-semibold">등원 시간</p>
                    <input
                      type="time"
                      value={arrivalTime}
                      onChange={(e) => setArrivalTime(e.target.value)}
                      className="text-xl font-black text-gray-700 focus:outline-none bg-transparent w-full"
                    />
                  </div>
                  <span className="text-xs text-gray-300">도착</span>
                </div>

                <div className="bg-white border-2 border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <span className="text-xl">🏠</span>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 font-semibold">하원 시간</p>
                    <input
                      type="time"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      className="text-xl font-black text-gray-700 focus:outline-none bg-transparent w-full"
                    />
                  </div>
                  <span className="text-xs text-gray-300">귀가</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2 ml-1">
                루틴 화면에서 등원까지 남은 시간을 실시간으로 알려드려요 🚌
              </p>
            </div>

            <div className="mb-5">
              <label className="text-sm font-bold text-gray-500 mb-1 block">
                ⏱ 미션 타이머 설정 <span className="text-gray-300 font-normal">(선택)</span>
              </label>
              <p className="text-xs text-gray-400 mb-3">
                시간 제한이 필요한 미션만 설정해요. 0분 = 타이머 없음
              </p>
              <div className="flex flex-col gap-2">
                {TIMER_MISSIONS.map(({ id, label }) => {
                  const minutes = Math.floor((missionTimers[id] ?? 0) / 60)
                  return (
                    <div
                      key={id}
                      className="bg-white border-2 border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3"
                    >
                      <span className="text-sm font-bold text-gray-600 flex-1">{label}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setMissionTimers((prev) => ({
                            ...prev,
                            [id]: Math.max(0, (prev[id] ?? 0) - 60),
                          }))}
                          className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 font-black flex items-center justify-center text-lg"
                        >
                          −
                        </button>
                        <span className={`w-12 text-center font-black text-lg ${minutes > 0 ? 'text-[#FF8FAB]' : 'text-gray-300'}`}>
                          {minutes > 0 ? `${minutes}분` : '−'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setMissionTimers((prev) => ({
                            ...prev,
                            [id]: Math.min(1800, (prev[id] ?? 0) + 60),
                          }))}
                          className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 font-black flex items-center justify-center text-lg"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleComplete}
        disabled={!isValid}
        className={`
          fixed bottom-8 left-5 right-5 py-5 rounded-2xl font-black text-xl
          flex items-center justify-center gap-2 transition-all shadow-lg
          ${isValid
            ? 'bg-gradient-to-r from-[#FF8FAB] to-[#FFD93D] text-white'
            : 'bg-gray-100 text-gray-300'
          }
        `}
      >
        <Check className="w-6 h-6" />
        프로필 만들기 완료!
      </motion.button>
    </div>
  )
}
