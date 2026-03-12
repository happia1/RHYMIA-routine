/**
 * 화면 최상단 프로필 바 — 왼쪽 뒤로가기(홈), 오른쪽 알림·프로필 아이콘 (텍스트 없음)
 * 비개발자: 뒤로가기 누르면 홈으로, 알림(벨) 누르면 알림 설정, 프로필 누르면 프로필 전환 시트가 열려요.
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Bell, Users } from 'lucide-react'
import { useProfileStore } from '@/lib/stores/profileStore'
import { getProfileImageSrc } from '@/types/profile'
import { ProfileSwitchSheet } from './ProfileSwitchSheet'
import { motion } from 'framer-motion'

export function TopProfileBar() {
  const router = useRouter()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const activeProfile = useProfileStore((state) => {
    if (!mounted) return null
    const p = state.profiles.find((pr) => pr.id === state.activeProfileId)
    return p ?? null
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const goToAlarm = () => {
    router.push('/routine/kid/alarm')
  }

  const goToHome = () => {
    router.push('/')
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between gap-2 px-4 py-3 bg-[#FFF9F0]/95 backdrop-blur-sm border-b border-gray-100/80 pt-safe">
        {/* 왼쪽: 뒤로가기 버튼 — 홈 화면으로 이동 */}
        <button
          type="button"
          onClick={goToHome}
          aria-label="홈으로 가기"
          className="p-2 -ml-1 rounded-xl text-gray-600 hover:bg-white/80 hover:text-amber-600 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        {/* 오른쪽 끝: 알림 아이콘, 프로필 아이콘 (텍스트 없이 작게) */}
        <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={goToAlarm}
          aria-label="알림 설정"
          className="p-2 rounded-xl text-gray-600 hover:bg-white/80 hover:text-amber-600 transition-colors"
        >
          <Bell className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-label="프로필"
          className="p-1.5 rounded-xl hover:bg-white/80 transition-colors"
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center text-lg"
            style={{
              backgroundColor: activeProfile ? activeProfile.avatarColor + '33' : '#F3F4F6',
            }}
          >
            {activeProfile ? (
              getProfileImageSrc(activeProfile) ? (
                <img
                  src={getProfileImageSrc(activeProfile)!}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                activeProfile.avatarEmoji
              )
            ) : (
              <Users className="w-4 h-4 text-gray-400" />
            )}
          </motion.div>
        </button>
        </div>
      </header>

      <ProfileSwitchSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  )
}
