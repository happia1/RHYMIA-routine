/**
 * 앱 전역 쉘: 프로필 없을 때 온보딩 리다이렉트 + 하단 탭바 표시 여부
 * 비개발자: 프로필이 하나도 없으면 /onboarding으로 보내고, 온보딩 중에는 탭바를 숨겨요.
 */

'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useProfileStore } from '@/lib/stores/profileStore'
import { BottomTabBar } from '@/components/layout/BottomTabBar'

const ONBOARDING_PATHS = ['/onboarding']

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const profiles = useProfileStore((s) => s.profiles)

  const isOnboarding = ONBOARDING_PATHS.some((p) => pathname.startsWith(p))

  useEffect(() => {
    if (profiles.length === 0 && !isOnboarding) {
      router.replace('/onboarding')
    }
  }, [profiles.length, isOnboarding, router])

  return (
    <>
      <main className={isOnboarding ? '' : 'pb-24'}>
        {children}
      </main>
      {!isOnboarding && <BottomTabBar />}
    </>
  )
}
