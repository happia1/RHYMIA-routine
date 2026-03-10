/**
 * 프로필 설정 — 이름·아바타·(자녀) 기관·시간
 * 비개발자: 역할 선택 후 이름·이모지·색상·(자녀 시) 다니는 곳·집 나서는/등원/하원 시간을 입력하고 완료하면 해당 루틴 화면으로 이동해요.
 * useSearchParams()는 Next.js에서 Suspense 경계 안에서만 사용할 수 있어서, 실제 UI는 ProfileSetupContent로 분리하고
 * 페이지에서는 Suspense로 감싸 로딩 중일 때 fallback(🐣)을 보여줍니다.
 */

'use client'

import { useState, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Check } from 'lucide-react'
import { useProfileStore } from '@/lib/stores/profileStore'
import { useKidRoutineStore } from '@/lib/stores/kidRoutineStore'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'
import { ProfileImagePicker } from '@/components/profile/ProfileImagePicker'
import { ProfileRole, ROLE_META } from '@/types/profile'

/** 프로필 배경용 기본 색상 (배경 색상 선택 기능 제거 후 고정값) */
const DEFAULT_AVATAR_COLOR = '#FF8FAB'

/** 역할별 아바타 이모지 목록 (비개발자: 프로필에서 선택할 수 있는 이모지들) */
const AVATAR_EMOJIS: Record<string, string[]> = {
  child_preschool: ['🧒', '👦', '👧', '🐣', '🐥', '🌱', '⭐', '🌟'],
  child_school: ['🎒', '📚', '🏃', '⚽', '🎨', '🎮', '🌈', '🦋'],
  mom: ['👩', '👩‍💼', '👩‍🍳', '🧘‍♀️', '👩‍💻', '🌸', '☕', '💐'],
  dad: ['👨', '👨‍💼', '👨‍🍳', '🏋️', '👨‍💻', '⚽', '🎸', '🧩'],
}

/** 자녀가 다니는 기관 타입 (유치원/어린이집/초등학교) 및 기본 등하원 시간 */
const INSTITUTION_TYPES = [
  { value: 'kindergarten' as const, label: '유치원', emoji: '🏫', arrivalDefault: '09:00', departureDefault: '08:20' },
  { value: 'daycare' as const, label: '어린이집', emoji: '🏡', arrivalDefault: '09:30', departureDefault: '09:00' },
  { value: 'elementary' as const, label: '초등학교', emoji: '🎒', arrivalDefault: '08:40', departureDefault: '08:10' },
]

/**
 * 프로필 설정 화면 본문 (useSearchParams 사용)
 * URL 쿼리 ?role= 에서 역할(엄마/아빠/유치원/학령기)을 읽어와서 폼을 구성합니다.
 */
function ProfileSetupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const childRole = useOnboardingStore((s) => s.childRole)
  const childGender = useOnboardingStore((s) => s.childGender)
  const resetOnboarding = useOnboardingStore((s) => s.reset)
  const role = (childRole ?? searchParams.get('role')) as ProfileRole
  const { addProfile, setActiveProfile } = useProfileStore()
  const { setCurrentProfileId, setWakeAlarmTime } = useKidRoutineStore()

  const isChild = role === 'child_preschool' || role === 'child_school'
  const isParent = role === 'mom' || role === 'dad'
  const meta = role ? ROLE_META[role] : null
  const availableEmojis = (role && AVATAR_EMOJIS[role]) ?? ['😊']

  /** 엄마/아빠는 선택한 이미지(mom.png/dad.png)를 기본 프로필 사진으로 사용 */
  const defaultParentImage = role === 'mom' ? '/profile/mom.png' : role === 'dad' ? '/profile/dad.png' : null

  const [name, setName] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState(meta?.emoji ?? availableEmojis[0])
  const [customPhotoBase64, setCustomPhotoBase64] = useState<string | null>(null)
  const [institutionType, setInstitutionType] = useState<'kindergarten' | 'daycare' | 'elementary' | null>(null)
  const [wakeTime, setWakeTime] = useState('07:00')
  const [departureTime, setDepartureTime] = useState('')
  const [arrivalTime, setArrivalTime] = useState('')
  const [returnTime, setReturnTime] = useState('')
  const [bedtime, setBedtime] = useState('21:00')

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
            wakeTime: wakeTime || null,
            departureTime: departureTime || null,
            arrivalTime: arrivalTime || null,
            returnTime: returnTime || null,
            bedtime: bedtime || null,
          }
        : undefined,
    })

    setActiveProfile(newProfile.id)
    if (isChild) {
      setCurrentProfileId(newProfile.id)
      setWakeAlarmTime(wakeTime || '07:00')
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
          avatarColor={DEFAULT_AVATAR_COLOR}
          onSave={(base64) => setCustomPhotoBase64(base64)}
          size={100}
        />
        <p className="text-xs text-gray-400 mt-3">
          {customPhotoBase64 ? '✅ 사진 업로드 완료' : isParent ? '선택한 프로필 사진이 적용돼요' : '아이콘을 눌러 사진을 추가해요'}
        </p>
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
              <p className="text-xs text-gray-400 mb-3">
                아침 기상·등하원·저녁 취침 시간을 설정하면 홈과 루틴 화면에서 시간대별 상태를 알려드려요.
              </p>
              <div className="flex flex-col gap-3">
                <div className="bg-white border-2 border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <span className="text-xl">🌅</span>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 font-semibold">아침에 일어날 시간</p>
                    <input
                      type="time"
                      value={wakeTime}
                      onChange={(e) => setWakeTime(e.target.value)}
                      className="text-xl font-black text-gray-700 focus:outline-none bg-transparent w-full"
                    />
                  </div>
                </div>

                <div className="bg-white border-2 border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <span className="text-xl">🚪</span>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 font-semibold">집 나서는 시간 (출발)</p>
                    <input
                      type="time"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      className="text-xl font-black text-gray-700 focus:outline-none bg-transparent w-full"
                    />
                  </div>
                </div>

                <div className="bg-white border-2 border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <span className="text-xl">🏫</span>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 font-semibold">등원(등교) 시간</p>
                    <input
                      type="time"
                      value={arrivalTime}
                      onChange={(e) => setArrivalTime(e.target.value)}
                      className="text-xl font-black text-gray-700 focus:outline-none bg-transparent w-full"
                    />
                  </div>
                </div>

                <div className="bg-white border-2 border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <span className="text-xl">🏠</span>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 font-semibold">하원(하교) 시간</p>
                    <input
                      type="time"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      className="text-xl font-black text-gray-700 focus:outline-none bg-transparent w-full"
                    />
                  </div>
                </div>

                <div className="bg-white border-2 border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <span className="text-xl">😴</span>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 font-semibold">저녁에 잠자러 가는 시간</p>
                    <input
                      type="time"
                      value={bedtime}
                      onChange={(e) => setBedtime(e.target.value)}
                      className="text-xl font-black text-gray-700 focus:outline-none bg-transparent w-full"
                    />
                  </div>
                </div>
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

/**
 * 프로필 설정 페이지 (Next.js 라우트)
 * useSearchParams를 쓰는 ProfileSetupContent를 Suspense로 감싸서,
 * 쿼리 파라미터가 준비되기 전에는 로딩 UI(🐣)를 보여줍니다.
 */
export default function ProfileSetupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center">
          <div className="text-4xl animate-bounce">🐣</div>
        </div>
      }
    >
      <ProfileSetupContent />
    </Suspense>
  )
}
