'use client'

/**
 * 알림 페이지 — 상단에 "자녀 루틴 확인" / "알림" 탭, 자녀별 루틴 확인·알림 목록
 * 비개발자: 하단 독바 알림 탭에서 들어와, 자녀 루틴 확인 탭으로 오늘 루틴을 보거나, 알림 탭에서 알림을 확인·삭제해요.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CalendarDays, ChevronRight, ChevronDown, ChevronUp, CheckCheck, Check } from 'lucide-react'
import { useNotificationStore } from '@/lib/stores/notificationStore'
import { useProfileStore } from '@/lib/stores/profileStore'
import { useMilestoneStore } from '@/lib/stores/milestoneStore'
import { getProfileImageSrc } from '@/types/profile'

type PageTab = 'child_routine' | 'alarm'

export default function NotificationsPage() {
  const router = useRouter()
  const {
    notifications,
    deleteNotification,
  } = useNotificationStore()
  const { getChildProfiles } = useProfileStore()
  const parentApproveMilestone = useMilestoneStore((s) => s.parentApproveMilestone)
  const children = getChildProfiles()

  const [pageTab, setPageTab] = useState<PageTab>('alarm')
  const [activeTab, setActiveTab] = useState(0)
  /** 프로필별 알림 그룹 펼침 상태 (키: childProfileId 또는 'other') */
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  /** 알림 모두 확인 애니메이션 재생 중 여부 (버튼 중복 클릭 방지) */
  const [isClearingAll, setIsClearingAll] = useState(false)

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

  /** 프로필별로 알림 그룹화 (자녀별로 모아서 토글 섹션에 사용) */
  const notificationGroups = (() => {
    const map = new Map<string | 'other', { key: string; name: string; profile?: (typeof children)[0]; list: typeof filteredNotifications }>()
    for (const n of filteredNotifications) {
      const key = n.childProfileId ?? 'other'
      if (!map.has(key)) {
        const profile = key === 'other' ? undefined : children.find((c) => c.id === key)
        map.set(key, {
          key,
          name: profile?.name ?? '기타',
          profile,
          list: [],
        })
      }
      map.get(key)!.list.push(n)
    }
    // 최신순 정렬을 위해 각 그룹 내 알림도 최신순
    const result = Array.from(map.values())
    result.forEach((g) => g.list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))
    return result.sort((a, b) => (a.key === 'other' ? 1 : b.key === 'other' ? -1 : 0))
  })()

  /** 해당 프로필 그룹이 펼쳐져 있는지 (초기값은 전부 펼침) */
  const isGroupExpanded = (key: string) => expandedGroups.size === 0 || expandedGroups.has(key)
  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (prev.size === 0) {
        notificationGroups.forEach((g) => next.add(g.key))
        next.delete(key)
        return next
      }
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  /** 그룹이 처음 생겼을 때 전부 펼쳐진 상태로 초기화 */
  useEffect(() => {
    if (notificationGroups.length > 0 && expandedGroups.size === 0) {
      setExpandedGroups(new Set(notificationGroups.map((g) => g.key)))
    }
  }, [notificationGroups.length, expandedGroups.size])

  /** 알림 클릭/확인: 마일스톤이면 승인 처리 후 알림 삭제하고, 루틴/마일스톤 확인 화면(부모 대시보드)으로 이동 */
  const handleNotificationClick = (notif: (typeof notifications)[0]) => {
    if (notif.milestoneId && notif.childProfileId) {
      parentApproveMilestone(notif.childProfileId, notif.milestoneId)
    }
    deleteNotification(notif.id)
    if (notif.childProfileId) {
      router.push(`/routine/parent-dashboard?childId=${notif.childProfileId}`)
    }
  }

  const TYPE_COLOR: Record<string, string> = {
    child_mission: '#FF8FAB',
    system: '#7EB8D4',
    praise: '#FFD93D',
  }

  /**
   * 알림 모두 확인: 화면에 보이는 순서대로 알림을 하나씩 빠르게 슬라이드 아웃 후 삭제
   * (그룹 순서 → 각 그룹 내 알림 순서로 ID 수집 후, 70ms 간격으로 순차 삭제)
   */
  const handleClearAllNotifications = () => {
    const idsInOrder = notificationGroups.flatMap((g) => g.list.map((n) => n.id))
    if (idsInOrder.length === 0) return
    setIsClearingAll(true)
    idsInOrder.forEach((id, i) => {
      window.setTimeout(() => {
        deleteNotification(id)
        if (i === idsInOrder.length - 1) setIsClearingAll(false)
      }, i * 70)
    })
  }

  return (
    /* 전체를 세로 flex로 두고, 헤더는 고정·본문만 스크롤되게 해서 스크롤 시 겹침 방지 */
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* 헤더: 스크롤되지 않고 항상 상단에 고정 (flex-shrink-0) */}
      <div className="flex-shrink-0 bg-white px-5 py-4 border-b border-gray-50">
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

        {/* 알림 탭일 때: 전체/자녀 필터 + 알림 모두 확인 버튼 (한 줄) */}
        {pageTab === 'alarm' && (
          <div className="flex items-center gap-2 mt-3 overflow-x-auto">
            <div className="flex gap-2 flex-shrink-0 min-w-0 overflow-x-auto">
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
            <button
              type="button"
              onClick={handleClearAllNotifications}
              disabled={isClearingAll || notifications.length === 0}
              className="flex-shrink-0 ml-auto px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 flex items-center gap-1 disabled:opacity-50 disabled:pointer-events-none"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              알림 모두 확인
            </button>
          </div>
        )}
      </div>

      {/* 스크롤 영역: 헤더 아래만 스크롤되어 겹침 현상 방지, 하단 독바 공간 확보(pb-24) */}
      <div className="flex-1 min-h-0 overflow-y-auto pb-24">
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

      {/* 알림 탭: 프로필별 토글 그룹 + 알림 클릭 시 루틴 확인 페이지 이동 */}
      {pageTab === 'alarm' && (
      <div className="px-5 pt-3 flex flex-col gap-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔔</div>
            <p className="text-gray-400">새 알림이 없어요</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notificationGroups.map((group) => {
              const isExpanded = isGroupExpanded(group.key)
              const childProfile = group.profile
              const profileImageSrc = childProfile ? getProfileImageSrc(childProfile) : null
              const fallbackEmoji = childProfile?.avatarEmoji ?? '👤'

              return (
                <div
                  key={group.key}
                  className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm"
                >
                  {/* 프로필별 그룹 헤더: 클릭 시 펼치기/접기 */}
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.key)}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50/80 transition-colors"
                  >
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-[#FFF0F5]"
                      style={
                        childProfile?.avatarColor
                          ? { backgroundColor: childProfile.avatarColor + '33' }
                          : undefined
                      }
                    >
                      {profileImageSrc ? (
                        <img src={profileImageSrc} alt={group.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">{fallbackEmoji}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-gray-800 text-sm">{group.name}</p>
                      <p className="text-xs text-gray-400">{group.list.length}개의 알림</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>

                  {/* 펼쳤을 때만 해당 프로필 알림 목록 표시 */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-gray-50 overflow-hidden"
                      >
                        {/* 알림 행이 삭제될 때 슬라이드 아웃이 보이도록 AnimatePresence로 감쌈 */}
                        <AnimatePresence>
                        {group.list.map((notif) => {
                          const notifChildProfile = notif.childProfileId
                            ? children.find((c) => c.id === notif.childProfileId)
                            : undefined
                          const notifImageSrc = notifChildProfile ? getProfileImageSrc(notifChildProfile) : null
                          const notifEmoji = notifChildProfile?.avatarEmoji ?? notif.fromEmoji
                          const canNavigate = !!notif.childProfileId

                          return (
                            <motion.div
                              key={notif.id}
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ x: 200, opacity: 0 }}
                              transition={{ duration: 0.2, ease: 'easeInOut' }}
                              className={`flex gap-3 p-4 border-b border-gray-50 last:border-b-0 relative ${
                                notif.isRead ? 'bg-gray-50/50' : 'bg-white'
                              } ${canNavigate ? 'cursor-pointer active:bg-pink-50/50' : ''}`}
                            >
                              {/* 알림 행 클릭 시 알림 삭제 + 루틴/마일스톤 확인 화면(부모 대시보드)으로 이동 */}
                              <button
                                type="button"
                                onClick={() => handleNotificationClick(notif)}
                                className="absolute inset-0 z-0"
                                aria-label={`${notif.fromName} 알림 - 확인하고 화면 이동`}
                              />
                              <div
                                className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-[#FFF0F5] relative z-10"
                                style={
                                  notifChildProfile?.avatarColor
                                    ? { backgroundColor: notifChildProfile.avatarColor + '33' }
                                    : undefined
                                }
                              >
                                {notifImageSrc ? (
                                  <img src={notifImageSrc} alt={notif.fromName} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-2xl">{notifEmoji}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0 relative z-10 pointer-events-none">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <p className="font-black text-gray-700 text-sm">{notif.fromName}</p>
                                  {!notif.isRead && (
                                    <div
                                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: TYPE_COLOR[notif.type] }}
                                    />
                                  )}
                                  <p className="text-xs text-gray-400 ml-auto">{timeAgo(notif.timestamp)}</p>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">{notif.content}</p>
                              </div>
                              {/* 마일스톤 알림: "확인" 버튼도 클릭과 동일하게 처리 (승인 + 삭제 + 확인 화면 이동) */}
                              {notif.milestoneId && notif.childProfileId && (
                                <motion.button
                                  type="button"
                                  whileTap={{ scale: 0.95 }}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleNotificationClick(notif)
                                  }}
                                  className="relative z-20 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FF8FAB] text-white text-xs font-black pointer-events-auto"
                                  aria-label="마일스톤 확인"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  확인
                                </motion.button>
                              )}
                            </motion.div>
                          )
                        })}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        )}
      </div>
      )}
      </div>
    </div>
  )
}
