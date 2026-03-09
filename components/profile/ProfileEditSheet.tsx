/**
 * 프로필 사진 수정 바텀시트
 * 비개발자: 프로필 전환 시트에서 "사진 변경"을 누르면 올라오는 시트로, 프로필 이미지를 선택·크롭해서 저장해요.
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useProfileStore } from '@/lib/stores/profileStore'
import { getProfileImageSrc } from '@/types/profile'
import { ProfileImagePicker } from './ProfileImagePicker'
import type { FamilyProfile } from '@/types/profile'

interface ProfileEditSheetProps {
  profile: FamilyProfile | null
  isOpen: boolean
  onClose: () => void
}

export function ProfileEditSheet({ profile, isOpen, onClose }: ProfileEditSheetProps) {
  const updateProfile = useProfileStore((s) => s.updateProfile)
  const currentSrc = profile ? getProfileImageSrc(profile) : null

  const handleSave = (base64: string) => {
    if (!profile) return
    updateProfile(profile.id, {
      customPhotoBase64: base64,
      useCustomPhoto: true,
    })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && profile && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[60]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl p-6 pb-10"
          >
            <div className="w-10 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-gray-700">프로필 사진 변경</h2>
              <button type="button" onClick={onClose}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <div className="flex flex-col items-center py-4">
              <ProfileImagePicker
                currentSrc={currentSrc}
                fallbackEmoji={profile.avatarEmoji}
                avatarColor={profile.avatarColor}
                onSave={handleSave}
                size={90}
              />
              <p className="text-xs text-gray-400 mt-4">
                원형 아이콘을 눌러 갤러리에서 사진을 선택한 뒤, 원하는 영역을 잘라 저장해요.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
