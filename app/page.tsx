/**
 * 홈(/) — 가족 현황 대시보드
 * 비개발자: 상단에 오늘의 메시지·현재 시간·날씨, 그 아래 가족 프로필 카드(자녀/성인)를 보여주고,
 * 각 카드를 탭하면 해당 루틴 화면으로 이동해요.
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useProfileStore } from '@/lib/stores/profileStore'
import { useWeatherStore } from '@/lib/stores/weatherStore'
import { FamilyChildCard } from '@/components/home/FamilyChildCard'
import { FamilyParentCard } from '@/components/home/FamilyParentCard'
import { DailyMessageBanner } from '@/components/home/DailyMessageBanner'

export default function HomePage() {
  const router = useRouter()
  const { profiles } = useProfileStore()
  const { weather, fetchWeather } = useWeatherStore()

  const [now, setNow] = useState(new Date())

  // 1분마다 시각 갱신, 마운트 시 날씨 조회
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000)
    fetchWeather()
    return () => clearInterval(id)
  }, [fetchWeather])

  // ko-KR hour12: "오전 9:00" / "오후 2:30" 형태 → 오전/오후만 20px로 줄여서 표시하기 위해 분리
  const timeStr = now.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
  const [ampmStr, timePartStr] = timeStr.includes(' ') ? timeStr.split(' ', 2) : ['', timeStr]
  const dateStr = now.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  // 현재 시간대 (아침 6–12, 오후 12–18, 저녁 18–22, 밤 22–6) — 인사·이모지·부모 카드용
  const h = now.getHours()
  type BlockKey = 'morning' | 'afternoon' | 'evening' | 'night'
  const currentBlock: BlockKey =
    h >= 6 && h < 12
      ? 'morning'
      : h >= 12 && h < 18
        ? 'afternoon'
        : h >= 18 && h < 22
          ? 'evening'
          : 'night'
  // 한 화면에 맞춤: 뷰포트 높이 고정, 아래 영역만 내부 스크롤
  return (
    <div
      className="h-full min-h-0 flex flex-col overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url(/background/ground.png)' }}
    >
      {/* 상단 헤더: 시간·날짜 / 날씨 (고정) */}
      <div className="flex-shrink-0 px-5 pt-8 pb-4 bg-white/15 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex items-stretch justify-between gap-4"
        >
          {/* 화면 중앙: 시간 / 줄바꿈 / 날짜 — 숫자를 기준으로 화면 가운데에 고정해서 보여줘요 */}
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col justify-end items-center text-center min-h-[72px] h-[72px]">
            <h1 className="font-black text-gray-800 tracking-tight flex items-baseline gap-2 leading-none">
              {ampmStr && <span className="text-[20px] font-black">{ampmStr}</span>}
              <span className="text-[4rem]">{timePartStr}</span>
            </h1>
            <p className="text-gray-400 text-sm leading-tight mt-0.5 text-center">{dateStr}</p>
          </div>

          {/* 오른쪽 상단: 날씨 — 아이콘 위, 텍스트 아래 세로 배치, 크기 확대 */}
          <div className="flex flex-col items-center justify-center gap-1 px-3 py-2 min-h-[72px] box-border">
            <span className="text-4xl leading-none">{weather?.emoji ?? '🌤'}</span>
            <div className="flex flex-col items-center text-center">
              <p className="text-sm font-black text-gray-700 leading-tight">{weather?.temp ?? '--'}°</p>
              <p className="text-xs text-gray-400 leading-tight">{weather?.desc ?? '날씨'}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 오늘의 메시지 + 가족 카드: 영역만 스크롤, 페이지 자체는 스크롤 없음 */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <div className="px-5 mb-5">
          <DailyMessageBanner />
        </div>
        <div className="px-5 flex flex-col gap-3 pb-6">
        <p className="text-xs font-black text-gray-400 tracking-wider uppercase">우리 가족</p>

        {profiles.map((profile, i) => {
          const isChild =
            profile.role === 'child_preschool' || profile.role === 'child_school'
          return (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              {isChild ? (
                <FamilyChildCard profile={profile} />
              ) : (
                <FamilyParentCard profile={profile} currentBlock={currentBlock} />
              )}
            </motion.div>
          )
        })}

        {profiles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">👨‍👩‍👧‍👦</div>
            <p className="text-gray-400 font-semibold">프로필을 추가해주세요</p>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
