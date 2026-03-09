/**
 * 루틴 탭 진입 — 활성 프로필 기준 자동 라우팅
 * 비개발자: "루틴" 탭을 누르면 현재 선택된 프로필에 따라 /routine/kid 또는 /routine/personal로 넘겨요.
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProfileStore } from '@/lib/stores/profileStore'

export default function RoutinePage() {
  const router = useRouter()
  const { getActiveProfile } = useProfileStore()
  const active = getActiveProfile()

  useEffect(() => {
    if (!active) {
      router.replace('/')
      return
    }
    // 미취학·학령기 자녀 모두 같은 아이 루틴 보드(/routine/kid) 사용
    if (active.role === 'child_preschool' || active.role === 'child_school') {
      router.replace('/routine/kid')
    } else {
      router.replace('/routine/personal')
    }
  }, [active, router])

  return (
    <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center">
      <div className="text-4xl animate-pulse">🌟</div>
    </div>
  )
}
