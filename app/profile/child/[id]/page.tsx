/**
 * 자녀 프로필 수정 페이지
 * 비개발자: 온보딩에서 설정한 이름·아바타·다니는 곳·기상·등하원·취침 시간을 모두 여기서 수정할 수 있어요.
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Check } from 'lucide-react'
import { useProfileStore } from '@/lib/stores/profileStore'
import { useKidRoutineStore } from '@/lib/stores/kidRoutineStore'
import { ProfileImagePicker } from '@/components/profile/ProfileImagePicker'
import { ROLE_META } from '@/types/profile'

/* 이모지/배경색 선택 기능은 제거됨 — 프로필에 저장된 값만 표시·저장에 사용 */

const INSTITUTION_TYPES = [
  { value: 'kindergarten' as const, label: '유치원', emoji: '🏫', arrivalDefault: '09:00', departureDefault: '08:20' },
  { value: 'daycare' as const, label: '어린이집', emoji: '🏡', arrivalDefault: '09:30', departureDefault: '09:00' },
  { value: 'elementary' as const, label: '초등학교', emoji: '🎒', arrivalDefault: '08:40', departureDefault: '08:10' },
]

function ChildProfileEditContent() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string | undefined
  const getProfile = useProfileStore((s) => s.getProfile)
  const updateProfile = useProfileStore((s) => s.updateProfile)
  const setWakeAlarmTimeForProfile = useKidRoutineStore((s) => s.setWakeAlarmTimeForProfile)

  const profile = id ? getProfile(id) : undefined
  const isChild =
    profile?.role === 'child_preschool' || profile?.role === 'child_school'

  const [name, setName] = useState('')
  const [customPhotoBase64, setCustomPhotoBase64] = useState<string | null>(null)
  const [institutionType, setInstitutionType] = useState<'kindergarten' | 'daycare' | 'elementary' | null>(null)
  const [wakeTime, setWakeTime] = useState('07:00')
  const [departureTime, setDepartureTime] = useState('')
  const [arrivalTime, setArrivalTime] = useState('')
  const [returnTime, setReturnTime] = useState('')
  const [bedtime, setBedtime] = useState('21:00')

  useEffect(() => {
    if (!profile) return
    setName(profile.name)
    setCustomPhotoBase64(profile.customPhotoBase64 ?? null)
    const cs = profile.childSettings
    if (cs) {
      setInstitutionType(cs.institutionType ?? null)
      setWakeTime(cs.wakeTime ?? '07:00')
      setDepartureTime(cs.departureTime ?? '')
      setArrivalTime(cs.arrivalTime ?? '')
      setReturnTime(cs.returnTime ?? '')
      setBedtime(cs.bedtime ?? '21:00')
    }
  }, [profile])

  const isValid = name.trim().length > 0

  const handleInstitutionSelect = (inst: (typeof INSTITUTION_TYPES)[number]) => {
    setInstitutionType(inst.value)
    if (!departureTime) setDepartureTime(inst.departureDefault)
    if (!arrivalTime) setArrivalTime(inst.arrivalDefault)
  }

  const handleSave = () => {
    if (!id || !profile || !isValid) return

    updateProfile(id, {
      name: name.trim(),
      avatarEmoji: profile.avatarEmoji,
      avatarColor: profile.avatarColor,
      customPhotoBase64: customPhotoBase64 ?? undefined,
      useCustomPhoto: !!customPhotoBase64,
      childSettings: {
        institutionType,
        wakeTime: wakeTime || null,
        departureTime: departureTime || null,
        arrivalTime: arrivalTime || null,
        returnTime: returnTime || null,
        bedtime: bedtime || null,
      },
    })

    setWakeAlarmTimeForProfile(id, wakeTime || '07:00')
    router.back()
  }

  if (!id || !profile) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center">
        <p className="text-gray-400">프로필을 찾을 수 없어요</p>
      </div>
    )
  }

  if (!isChild) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center">
        <p className="text-gray-400">자녀 프로필만 수정할 수 있어요</p>
      </div>
    )
  }

  const meta = ROLE_META[profile.role]

  return (
    <div className="min-h-screen bg-[#FFF9F0] px-5 py-8 pb-32">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-6 p-2 -ml-2"
      >
        <ArrowLeft className="w-6 h-6 text-gray-500" />
      </button>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <p className="text-sm font-bold mb-1" style={{ color: meta.color }}>
          자녀 프로필 수정
        </p>
        <h1 className="text-2xl font-black text-gray-700">
          {profile.name}의 설정을 변경해요
        </h1>
      </motion.div>

      {/* 프로필 사진만 표시·변경 가능, 이모지/배경색 선택 UI는 제거됨 */}
      <div className="flex flex-col items-center mb-8">
        <ProfileImagePicker
          currentSrc={
            customPhotoBase64
              ? customPhotoBase64
              : profile.gender === 'girl'
                ? '/profile/girl.png'
                : profile.gender === 'boy'
                  ? '/profile/boy.png'
                  : null
          }
          fallbackEmoji={profile.avatarEmoji}
          avatarColor={profile.avatarColor}
          onSave={(base64) => setCustomPhotoBase64(base64)}
          size={100}
        />
      </div>

      <div className="mb-6">
        <label className="text-sm font-bold text-gray-500 mb-2 block">
          자녀 이름
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 지수, 민준이"
          maxLength={10}
          className="w-full px-4 py-4 rounded-2xl border-2 border-gray-100 bg-white text-gray-700 font-bold text-lg focus:outline-none focus:border-[#FF8FAB]"
        />
      </div>

      <div className="mb-5">
        <label className="text-sm font-bold text-gray-500 mb-2 block">
          다니는 곳
        </label>
        <div className="flex gap-2">
          {INSTITUTION_TYPES.map((inst) => (
            <motion.button
              key={inst.value}
              type="button"
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

      <div className="mb-6">
        <label className="text-sm font-bold text-gray-500 mb-3 block">
          ⏰ 시간 설정
        </label>
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

      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={handleSave}
        disabled={!isValid}
        className={`fixed bottom-24 left-5 right-5 py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-2 shadow-lg ${
          isValid
            ? 'bg-gradient-to-r from-[#FF8FAB] to-[#FFD93D] text-white'
            : 'bg-gray-100 text-gray-300'
        }`}
      >
        <Check className="w-6 h-6" />
        저장하기
      </motion.button>
    </div>
  )
}

export default function ChildProfileEditPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center">
          <div className="text-4xl animate-bounce">🌸</div>
        </div>
      }
    >
      <ChildProfileEditContent />
    </Suspense>
  )
}
