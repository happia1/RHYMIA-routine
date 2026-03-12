/**
 * 상점 페이지 (다이아몬드/포인트 사용)
 * 비개발자: HUD의 다이아 아이콘을 누르면 이 페이지로 이동합니다. 추후 상점 콘텐츠 연동 가능.
 */

'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function KidShopPage() {
  return (
    <div className="min-h-screen bg-[#FFF9F0] p-4">
      <Link href="/routine/kid" className="inline-flex items-center gap-1 text-gray-600 mb-4">
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-semibold">루틴으로</span>
      </Link>
      <div className="text-center py-12">
        <div className="text-5xl mb-4">💎</div>
        <h1 className="text-lg font-black text-gray-800">상점</h1>
        <p className="text-sm text-gray-500 mt-2">준비 중이에요! 곧 만나요.</p>
      </div>
    </div>
  )
}
