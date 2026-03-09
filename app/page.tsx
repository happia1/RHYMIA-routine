/**
 * 홈(/) — 가족 현황 대시보드
 * 비개발자: 상단에 오늘의 메시지·현재 시간·날씨, 그 아래 가족 프로필 카드(자녀/성인)를 보여주고,
 * 각 카드를 탭하면 해당 루틴 화면으로 이동해요.
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import { useProfileStore } from '@/lib/stores/profileStore'
import { useNotificationStore } from '@/lib/stores/notificationStore'
import { useWeatherStore } from '@/lib/stores/weatherStore'
import { FamilyChildCard } from '@/components/home/FamilyChildCard'
import { FamilyParentCard } from '@/components/home/FamilyParentCard'
import { DailyMessageBanner } from '@/components/home/DailyMessageBanner'

export default function HomePage() {
  const router = useRouter()
  const { profiles } = useProfileStore()
  const { unreadCount } = useNotificationStore()
  const { weather, fetchWeather } = useWeatherStore()

  const [now, setNow] = useState(new Date())

  // 1분마다 시각 갱신, 마운트 시 날씨 조회
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000)
    fetchWeather()
    return () => clearInterval(id)
  }, [fetchWeather])

  const timeStr = now.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
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
  const blockMeta =
    currentBlock === 'morning'
      ? { emoji: '☀️' }
      : currentBlock === 'afternoon'
        ? { emoji: '🌤' }
        : currentBlock === 'evening'
          ? { emoji: '🌆' }
          : { emoji: '🌙' }

  // 시간대별 인사말
  const greeting =
    h < 12
      ? '좋은 아침이에요'
      : h < 18
        ? '좋은 오후예요'
        : h < 22
          ? '좋은 저녁이에요'
          : '편안한 밤이에요'

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-28">
      {/* ── 상단 헤더: 인사·시간·날짜 / 날씨·메시지 아이콘 ── */}
      <div className="px-5 pt-8 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between"
        >
          <div>
            <p className="text-gray-400 text-sm font-medium">
              {greeting} {blockMeta?.emoji}
            </p>
            <h1 className="text-3xl font-black text-gray-800 mt-0.5 tracking-tight">{timeStr}</h1>
            <p className="text-gray-400 text-sm mt-0.5">{dateStr}</p>
          </div>

          <div className="flex items-center gap-2 mt-1">
            {/* 날씨 */}
            <div className="flex items-center gap-1.5 bg-white rounded-2xl px-3 py-2 shadow-sm border border-gray-100">
              <span className="text-xl">{weather?.emoji ?? '🌤'}</span>
              <div>
                <p className="text-xs font-black text-gray-700">{weather?.temp ?? '--'}°</p>
                <p className="text-[10px] text-gray-400">{weather?.desc ?? '날씨'}</p>
              </div>
            </div>

            {/* 알림 (탭 시 /notifications 이동) */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => router.push('/notifications')}
              className="relative w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100"
            >
              <Bell className="w-5 h-5 text-gray-500" />
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF8FAB] rounded-full flex items-center justify-center"
                >
                  <span className="text-white text-[10px] font-black">{unreadCount}</span>
                </motion.div>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* ── 오늘의 메시지 배너 ── */}
      <div className="px-5 mb-5">
        <DailyMessageBanner />
      </div>

      {/* ── 가족 카드 목록 ── */}
      <div className="px-5 flex flex-col gap-3">
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
  )
}
