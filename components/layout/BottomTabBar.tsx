/**
 * 하단 고정 탭바 (홈, 루틴, 프로필 전환)
 * 비개발자: 앱 하단에 항상 보이는 네비게이션 바예요. "홈", "루틴" 탭과 현재 프로필 아바타(클릭 시 전환 시트)가 있어요.
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Home, CalendarDays, Bell, Users } from 'lucide-react'
import { useProfileStore } from '@/lib/stores/profileStore'
import { getProfileImageSrc } from '@/types/profile'
import { ProfileSwitchSheet } from './ProfileSwitchSheet'
import { motion } from 'framer-motion'

export function BottomTabBar() {
  const router = useRouter()
  const pathname = usePathname()
  const [sheetOpen, setSheetOpen] = useState(false)
  /** 하이드레이션 후에만 프로필 표시 (서버/클라이언트 초기 HTML 일치로 hydration 오류 방지) */
  const [mounted, setMounted] = useState(false)
  /** activeProfileId·profiles 구독으로 프로필 전환 시 독바 아이콘/이름 즉시 반영 */
  const activeProfile = useProfileStore((state) => {
    if (!mounted) return null
    const p = state.profiles.find((pr) => pr.id === state.activeProfileId)
    return p ?? null
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const tabs = [
    { icon: Home, label: '홈', path: '/' },
    { icon: CalendarDays, label: '루틴', path: '/routine' },
    { icon: Bell, label: '알림', path: '/notifications' },
  ]

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-t border-gray-100 pb-safe">
        <div className="flex items-center justify-around px-4 py-2">
          {tabs.map(({ icon: Icon, label, path }) => {
            // 홈(/)은 경로가 정확히 '/'일 때만 활성, 나머지 탭은 path와 일치하거나 하위 경로일 때 활성
            const isActive =
              path === '/' ? pathname === '/' : (pathname === path || pathname.startsWith(path + '/'))
            return (
              <button
                key={path}
                onClick={() => router.push(path)}
                className="flex flex-col items-center gap-1 py-2 px-6"
              >
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    isActive ? 'text-[#FF8FAB]' : 'text-gray-400'
                  }`}
                />
                <span className={`text-xs font-semibold ${
                  isActive ? 'text-[#FF8FAB]' : 'text-gray-400'
                }`}>
                  {label}
                </span>
              </button>
            )
          })}

          <button
            onClick={() => setSheetOpen(true)}
            className="flex flex-col items-center gap-1 py-2 px-4"
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-2xl overflow-hidden flex items-center justify-center text-xl relative"
              style={{
                backgroundColor: activeProfile
                  ? activeProfile.avatarColor + '33'
                  : '#F3F4F6',
              }}
            >
              {activeProfile ? (
                getProfileImageSrc(activeProfile) ? (
                  <img
                    src={getProfileImageSrc(activeProfile)!}
                    alt={activeProfile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  activeProfile.avatarEmoji
                )
              ) : (
                <Users className="w-5 h-5 text-gray-400" />
              )}
              {activeProfile && (
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#FF8FAB] border-2 border-white" />
              )}
            </motion.div>
            <span className="text-xs font-semibold text-gray-400">
              {activeProfile ? activeProfile.name : '프로필'}
            </span>
          </button>
        </div>
      </div>

      <ProfileSwitchSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  )
}
