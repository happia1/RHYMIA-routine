'use client'

/**
 * 메시지 경로 → 알림으로 리다이렉트
 * 비개발자: 예전 "메시지" 링크로 들어온 경우 알림 페이지로 바로 보내요.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MessagesPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/notifications')
  }, [router])
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <p className="text-gray-400">알림으로 이동 중...</p>
    </div>
  )
}
