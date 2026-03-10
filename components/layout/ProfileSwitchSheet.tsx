/**
 * 프로필 전환 바텀시트
 * 비개발자: 하단 탭바에서 "프로필" 버튼을 누르면 올라오는 시트로, 누가 사용할지 선택·삭제·추가할 수 있어요.
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProfileStore } from '@/lib/stores/profileStore'
import { useRouter } from 'next/navigation'
import { Plus, X, Trash2, Pencil, Settings } from 'lucide-react'
import { ROLE_META, getProfileImageSrc, type ProfileRole } from '@/types/profile'
import { ProfileEditSheet } from '@/components/profile/ProfileEditSheet'

interface ProfileSwitchSheetProps {
  isOpen: boolean
  onClose: () => void
}

/** 역할이 ROLE_META에 없을 때 쓰는 기본 라벨 (오래된 데이터·마이그레이션 대비) */
const FALLBACK_LABEL = '프로필'

export function ProfileSwitchSheet({ isOpen, onClose }: ProfileSwitchSheetProps) {
  const { profiles, activeProfileId, setActiveProfile, deleteProfile } = useProfileStore()
  const router = useRouter()
  const [editProfile, setEditProfile] = useState<typeof profiles[0] | null>(null)

  const handleSelect = (profileId: string) => {
    const profile = profiles.find((p) => p.id === profileId)
    if (!profile) return
    setActiveProfile(profileId)
    onClose()
    switch (profile.role) {
      case 'child_preschool':
        router.push('/routine/kid')
        break
      case 'child_school':
      case 'mom':
      case 'dad':
        router.push('/routine/personal')
        break
      default:
        router.push('/')
    }
  }

  /** 프로필 삭제: 확인 후 삭제하고, 삭제한 게 현재 프로필이면 첫 번째 프로필로 전환 또는 온보딩으로 */
  const handleDelete = (e: React.MouseEvent, profileId: string) => {
    e.stopPropagation()
    if (!confirm('이 프로필을 삭제할까요?')) return
    const wasActive = profileId === activeProfileId
    const rest = profiles.filter((p) => p.id !== profileId)
    deleteProfile(profileId)
    if (wasActive && rest.length > 0) {
      setActiveProfile(rest[0].id)
      onClose()
      router.push('/')
    } else if (wasActive && rest.length === 0) {
      onClose()
      router.push('/onboarding')
    }
  }

  /** 프로필 추가: 시트 닫고 처음 온보딩 화면으로 이동 */
  const handleAddProfile = () => {
    onClose()
    router.push('/onboarding')
  }

  /** 자녀 프로필 설정: 이름·시간 등 전체 수정 페이지로 이동 (자녀만 해당) */
  const handleSettings = (e: React.MouseEvent, profile: (typeof profiles)[0]) => {
    e.stopPropagation()
    const isChild = profile.role === 'child_preschool' || profile.role === 'child_school'
    if (!isChild) return
    onClose()
    router.push(`/profile/child/${profile.id}`)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6 pb-10"
          >
            <div className="w-10 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black text-gray-700">누가 사용할 건가요?</h2>
              <button onClick={onClose}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="flex flex-col gap-3 mb-4">
              {profiles.map((profile) => {
                const meta = profile.role != null && profile.role in ROLE_META
                  ? ROLE_META[profile.role as ProfileRole]
                  : null
                const label = meta?.label ?? FALLBACK_LABEL
                const isActive = profile.id === activeProfileId
                return (
                  <motion.div
                    key={profile.id}
                    whileTap={{ scale: 0.97 }}
                    className={`
                      flex items-center gap-3 p-4 rounded-2xl text-left transition-all
                      ${isActive
                        ? 'border-2 border-[#FF8FAB] bg-pink-50'
                        : 'border-2 border-gray-100 bg-gray-50'
                      }
                    `}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelect(profile.id)}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <div
                        className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center text-3xl flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: (profile.avatarColor || '#F3F4F6') + '33' }}
                      >
                        {getProfileImageSrc(profile) ? (
                          <img
                            src={getProfileImageSrc(profile)!}
                            alt={profile.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          profile.avatarEmoji || '👤'
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-black text-gray-700">{profile.name}</p>
                        <p className="text-xs text-gray-400">{label}</p>
                      </div>
                      {isActive && (
                        <div className="w-3 h-3 rounded-full bg-[#FF8FAB] flex-shrink-0" />
                      )}
                    </button>
                    {/* 수정(사진) · 설정(자녀 전체 수정) · 삭제 — 나란히 배치 */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditProfile(profile)
                      }}
                      className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors flex-shrink-0"
                      title="프로필 사진 수정"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    {(profile.role === 'child_preschool' || profile.role === 'child_school') && (
                      <button
                        type="button"
                        onClick={(e) => handleSettings(e, profile)}
                        className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors flex-shrink-0"
                        title="프로필 설정"
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, profile.id)}
                      className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0"
                      title="프로필 삭제"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                )
              })}
            </div>

            <button
              type="button"
              onClick={handleAddProfile}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 font-semibold hover:border-[#FF8FAB] hover:text-[#FF8FAB] transition-colors"
            >
              <Plus className="w-5 h-5" />
              프로필 추가
            </button>
          </motion.div>

          <ProfileEditSheet
            profile={editProfile}
            isOpen={!!editProfile}
            onClose={() => setEditProfile(null)}
          />
        </>
      )}
    </AnimatePresence>
  )
}
