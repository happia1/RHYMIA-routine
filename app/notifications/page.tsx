'use client'

/**
 * 알림 페이지 — 상단에 "자녀 루틴 확인" / "알림" 탭, 자녀별 루틴 확인·알림 목록
 * 비개발자: 하단 독바 알림 탭에서 들어와, 자녀 루틴 확인 탭으로 오늘 루틴을 보거나, 알림 탭에서 알림을 확인·삭제해요.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, X, CalendarDays, ChevronRight } from 'lucide-react'
import { useNotificationStore } from '@/lib/stores/notificationStore'
import { useProfileStore } from '@/lib/stores/profileStore'
import { getProfileImageSrc } from '@/types/profile'

type PageTab = 'child_routine' | 'alarm'

export default function NotificationsPage() {
  const router = useRouter()
  const {
    notifications,
    markAllRead,
    deleteNotification,
  } = useNotificationStore()
  const { getChildProfiles } = useProfileStore()
  const children = getChildProfiles()

  const [pageTab, setPageTab] = useState<PageTab>('alarm')
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    markAllRead()
  }, [markAllRead])

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}분 전`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}시간 전`
    return `${Math.floor(hrs / 24)}일 전`
  }

  const alarmTabs = ['전체', ...children.map((c) => c.name)]

  const filteredNotifications =
    activeTab === 0
      ? notifications
      : notifications.filter(
          (n) => n.childProfileId && children[activeTab - 1]?.id === n.childProfileId
        )

  const TYPE_COLOR: Record<string, string> = {
    child_mission: '#FF8FAB',
    system: '#7EB8D4',
    praise: '#FFD93D',
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-5 py-4 border-b border-gray-50 z-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-black text-gray-700">
            {pageTab === 'child_routine' ? '자녀 루틴 확인' : '알림'}
          </h1>
          {pageTab === 'alarm' && (
            <span className="text-xs text-gray-400 ml-auto">
              {notifications.length}개
            </span>
          )}
        </div>

        {/* 상단 탭: 자녀 루틴 확인 | 알림 */}
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={() => setPageTab('child_routine')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 ${
              pageTab === 'child_routine'
                ? 'bg-[#FF8FAB] text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            자녀 루틴 확인
          </button>
          <button
            type="button"
            onClick={() => setPageTab('alarm')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 ${
              pageTab === 'alarm'
                ? 'bg-[#FF8FAB] text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            알림
          </button>
        </div>

        {pageTab === 'alarm' && children.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto">
            {alarmTabs.map((tab, i) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(i)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold ${
                  i === activeTab
                    ? 'bg-[#FFB3C8] text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 자녀 루틴 확인 탭: 자녀별 카드 → parent-dashboard 이동 */}
      {pageTab === 'child_routine' && (
        <div className="px-5 pt-4 flex flex-col gap-3">
          {children.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">👶</div>
              <p className="text-gray-400">등록된 자녀가 없어요</p>
            </div>
          ) : (
            children.map((child) => (
              <motion.button
                key={child.id}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  router.push(`/routine/parent-dashboard?childId=${child.id}`)
                }
                className="w-full bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-left flex items-center gap-4"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-[#FFF0F5]"
                  style={{ backgroundColor: (child.avatarColor ?? '#FF8FAB') + '33' }}
                >
                  {getProfileImageSrc(child) ? (
                    <img
                      src={getProfileImageSrc(child)!}
                      alt={child.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">{child.avatarEmoji}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-800 text-lg">
                    {child.name}의 오늘 루틴
                  </p>
                  <p className="text-sm text-gray-400">
                    탭해서 확인하기
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
              </motion.button>
            ))
          )}
        </div>
      )}

      {/* 알림 탭: 기존 알림 목록 */}
      {pageTab === 'alarm' && (
      <div className="px-5 pt-3 flex flex-col gap-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔔</div>
            <p className="text-gray-400">새 알림이 없어요</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredNotifications.map((notif) => (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-3 p-4 rounded-2xl border relative ${
                  notif.isRead
                    ? 'bg-gray-50 border-gray-100'
                    : 'bg-white border-pink-100 shadow-sm'
                }`}
              >
                <div className="w-11 h-11 rounded-2xl bg-[#FFF0F5] flex items-center justify-center text-2xl flex-shrink-0">
                  {notif.fromEmoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-black text-gray-700 text-sm">
                      {notif.fromName}
                    </p>
                    {!notif.isRead && (
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: TYPE_COLOR[notif.type],
                        }}
                      />
                    )}
                    <p className="text-xs text-gray-400 ml-auto">
                      {timeAgo(notif.timestamp)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {notif.content}
                  </p>
                </div>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.85 }}
                  onClick={() => deleteNotification(notif.id)}
                  className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
      )}
    </div>
  )
}
