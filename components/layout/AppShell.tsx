/**
 * 앱 전역 쉘: 프로필 없을 때 온보딩 리다이렉트 + 하단 탭바 표시 여부
 * 비개발자: 프로필이 하나도 없으면 /onboarding으로 보내고, 온보딩 중에는 탭바를 숨겨요.
 * 프로필은 localStorage에 저장되므로, 저장소 복원(rehydration)이 끝난 뒤에만 판단해요.
 *
 * [버그 수정 2024]
 * - 앱 재진입 시 매번 온보딩으로 가던 문제 해결
 * - 원인: activeProfileId가 null인 채로 /routine → / 리다이렉트 → 온보딩 무한루프
 * - 해결: hydration 후 ensureActiveProfile() 호출로 activeProfileId 자동복구
 *
 * [진입 흐름]
 * 앱 열기
 *   → localStorage 복원 (hydration)
 *   → profiles 있음? → ensureActiveProfile() → activeProfileId 복구
 *     → 온보딩 경로여도 리다이렉트하지 않음 (프로필 추가로 진입한 경우 허용)
 *   → profiles 없음? → /onboarding으로 이동
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useProfileStore } from '@/lib/stores/profileStore'
import { TopProfileBar } from '@/components/layout/TopProfileBar'

const ONBOARDING_PATHS = ['/onboarding']

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const profiles = useProfileStore((s) => s.profiles)
  const ensureActiveProfile = useProfileStore((s) => s.ensureActiveProfile)
  const [hasHydrated, setHasHydrated] = useState(false)

  const isOnboarding = ONBOARDING_PATHS.some((p) => pathname.startsWith(p))

  // 1) localStorage 복원(hydration) 완료 감지
  useEffect(() => {
    if (hasHydrated) return
    if (useProfileStore.persist.hasHydrated()) {
      setHasHydrated(true)
      return
    }
    const unsub = useProfileStore.persist.onFinishHydration(() => {
      setHasHydrated(true)
    })
    return unsub
  }, [hasHydrated])

  // 2) 복원 완료 후 라우팅 결정
  useEffect(() => {
    if (!hasHydrated) return

    if (profiles.length === 0) {
      // 프로필이 없으면 온보딩으로
      if (!isOnboarding) {
        router.replace('/onboarding')
      }
      return
    }

    // 프로필이 있으면 activeProfileId 자동복구 (온보딩 경로는 그대로 둠 — 프로필 추가 시 /onboarding 진입 허용)
    ensureActiveProfile()
  }, [hasHydrated, profiles.length, isOnboarding, router, ensureActiveProfile])

  // hydration 전: 빈 화면 (레이아웃 깜빡임 방지)
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center">
        <div className="text-4xl animate-pulse">🌟</div>
      </div>
    )
  }

  // 일반 화면: 뷰포트 높이 고정 + 스크롤 방지 → 모든 화면이 한 페이지에 들어가고, 필요한 영역만 내부 스크롤
  return (
    <>
      {!isOnboarding && <TopProfileBar />}
      <main
        className={
          isOnboarding
            ? ''
            : 'pt-14 h-dvh flex flex-col overflow-hidden min-h-0'
        }
      >
        {!isOnboarding ? (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {children}
          </div>
        ) : (
          children
        )}
      </main>
    </>
  )
}
