'use client'

/**
 * 루틴 수정 페이지 (부모용)
 * 비개발자: 자녀의 아침/저녁 루틴에 항목을 추가·삭제·순서 변경할 수 있어요.
 * 추가 가능한 항목은 미리 정의된 풀(등원하기, 버스타러가기, 인사하기, 가글하기 등)에서 고릅니다.
 * (자녀 루틴 화면에서 연필 버튼으로 바로 수정할 수도 있고, 이 URL로 직접 들어올 수도 있어요.)
 */

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useProfileStore } from '@/lib/stores/profileStore'
import { RoutineEditPanel } from '@/components/parent/RoutineEditPanel'

/** 루틴 수정 페이지 본문 (searchParams 사용) */
function ParentDashboardEditContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { getChildProfiles } = useProfileStore()
  const children = getChildProfiles()
  const queryChildId = searchParams.get('childId')
  const selectedChild = queryChildId
    ? children.find((c) => c.id === queryChildId) ?? children[0]
    : children[0]
  const childId = selectedChild?.id ?? null
  const childName = selectedChild?.name ?? '우리 아이'

  return (
    <div className="min-h-screen bg-[#FFF9F0] pb-24">
      <div className="sticky top-0 bg-[#FFF9F0]/95 backdrop-blur-sm px-5 py-4 border-b border-gray-100 z-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-black text-gray-700 text-lg">루틴 수정</p>
            <p className="text-xs text-gray-400">{childName}의 루틴을 편집해요</p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-4">
        <RoutineEditPanel childId={childId} childName={childName} />
      </div>
    </div>
  )
}

export default function ParentDashboardEditPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center">
          <div className="text-4xl animate-bounce">🌸</div>
        </div>
      }
    >
      <ParentDashboardEditContent />
    </Suspense>
  )
}
