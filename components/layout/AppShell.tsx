/**
 * 앱 전역 쉘: 프로필 없을 때 온보딩 리다이렉트 + 하단 탭바 표시 여부
 * 비개발자: 프로필이 하나도 없으면 /onboarding으로 보내고, 온보딩 중에는 탭바를 숨겨요.
 * 프로필은 localStorage에 저장되므로, 저장소 복원(rehydration)이 끝난 뒤에만 판단해요.
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useProfileStore } from '@/lib/stores/profileStore'
import { BottomTabBar } from '@/components/layout/BottomTabBar'

const ONBOARDING_PATHS = ['/onboarding']

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const profiles = useProfileStore((s) => s.profiles)
  // 프로필 스토어가 localStorage에서 복원되었는지 여부 (복원 전에는 profiles가 빈 배열로 보임)
  const [hasHydrated, setHasHydrated] = useState(false)

  const isOnboarding = ONBOARDING_PATHS.some((p) => pathname.startsWith(p))

  // 1) 스토어 복원이 끝나면 hasHydrated를 true로 설정 (한 번만 체크)
  useEffect(() => {
    if (hasHydrated) return
    // 이미 복원된 경우(예: 빠른 재방문) 즉시 true
    if (useProfileStore.persist.hasHydrated()) {
      setHasHydrated(true)
      return
    }
    const unsub = useProfileStore.persist.onFinishHydration(() => {
      setHasHydrated(true)
    })
    return unsub
  }, [hasHydrated])

  // 2) 복원이 끝난 뒤에만, 프로필이 없고 온보딩 화면이 아니면 온보딩으로 보냄
  useEffect(() => {
    if (!hasHydrated) return
    if (profiles.length === 0 && !isOnboarding) {
      router.replace('/onboarding')
    }
  }, [hasHydrated, profiles.length, isOnboarding, router])

  return (
    <>
      <main className={isOnboarding ? '' : 'pb-24'}>
        {children}
      </main>
      {!isOnboarding && <BottomTabBar />}
    </>
  )
}
