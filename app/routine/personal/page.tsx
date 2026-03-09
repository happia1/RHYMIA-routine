'use client'

/**
 * 부모 루틴 메인 — 자유 슬롯 방식 (24h 도넛 + 추가/삭제)
 * 비개발자: 엄마/아빠가 "루틴" 탭에 들어오면 오늘 날짜, 자녀 대시보드·알림 아이콘, 도넛 시계, 오늘의 루틴 목록(+ / 휴지통)이 보여요.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Check } from 'lucide-react'
import { usePersonalRoutineStore } from '@/lib/stores/personalRoutineStore'
import { useProfileStore } from '@/lib/stores/profileStore'
import { DonutClock } from '@/components/personal/DonutClock'
import { isPersonalProfile } from '@/types/profile'

export default function PersonalRoutinePage() {
  const router = useRouter()
  const {
    slots,
    addSlot,
    deleteSlot,
    toggleComplete,
    getSortedSlots,
  } = usePersonalRoutineStore()
  const { getActiveProfile } = useProfileStore()
  const profile = getActiveProfile()
  const [mounted, setMounted] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    startHour: 9,
    startMin: 0,
    endHour: 10,
    endMin: 0,
    title: '',
    detail: '',
  })

  useEffect(() => setMounted(true), [])

  // 프로필에 따라 리다이렉트: 미취학·학령기 자녀는 같은 아이 루틴 보드로
  useEffect(() => {
    if (!mounted || !profile?.id) return
    if (profile.role === 'child_preschool' || profile.role === 'child_school') {
      router.replace('/routine/kid')
      return
    }
  }, [mounted, profile?.id, profile?.role, router])

  const now = new Date()
  const dateLabel = now.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  const sorted = getSortedSlots()

  const handleAdd = () => {
    if (!form.title.trim()) return
    addSlot({ ...form })
    setForm({
      startHour: 9,
      startMin: 0,
      endHour: 10,
      endMin: 0,
      title: '',
      detail: '',
    })
    setShowForm(false)
  }

  const formatTime = (h: number, m: number) =>
    `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`

  // 마운트 전에는 서버와 동일한 로딩 UI만 렌더 (하이드레이션 불일치 방지)
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center">
        <div className="text-4xl animate-pulse">🌟</div>
      </div>
    )
  }

  if (!profile || !isPersonalProfile(profile)) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center">
        <div className="text-4xl animate-pulse">🌟</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-28">
      {/* 헤더: 날짜 (자녀 루틴 확인은 알림 탭에서 진입) */}
      <div className="px-5 pt-6 pb-3">
        <p className="text-xs text-gray-400">오늘</p>
        <p className="text-xl font-black text-gray-800">{dateLabel}</p>
      </div>

      {/* 도넛 차트 (자유 슬롯 기반) */}
      <div className="flex justify-center px-5 mb-4">
        <DonutClock slots={slots} />
      </div>

      {/* 루틴 타임라인 */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-black text-gray-500">오늘의 루틴</p>
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 bg-[#FF8FAB] text-white text-xs font-black px-3 py-2 rounded-full shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            추가
          </motion.button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#FFF0F5] rounded-2xl p-4 mb-4 border border-pink-100"
            >
              <div className="flex gap-2 mb-3">
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">시작</p>
                  <div className="flex gap-1">
                    <select
                      value={form.startHour}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          startHour: Number(e.target.value),
                        }))
                      }
                      className="flex-1 bg-white rounded-xl px-2 py-1.5 text-sm font-bold text-gray-700 focus:outline-none"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>
                          {String(i).padStart(2, '0')}시
                        </option>
                      ))}
                    </select>
                    <select
                      value={form.startMin}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          startMin: Number(e.target.value),
                        }))
                      }
                      className="w-16 bg-white rounded-xl px-2 py-1.5 text-sm font-bold text-gray-700 focus:outline-none"
                    >
                      <option value={0}>00분</option>
                      <option value={30}>30분</option>
                    </select>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">종료</p>
                  <div className="flex gap-1">
                    <select
                      value={form.endHour}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          endHour: Number(e.target.value),
                        }))
                      }
                      className="flex-1 bg-white rounded-xl px-2 py-1.5 text-sm font-bold text-gray-700 focus:outline-none"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>
                          {String(i).padStart(2, '0')}시
                        </option>
                      ))}
                    </select>
                    <select
                      value={form.endMin}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          endMin: Number(e.target.value),
                        }))
                      }
                      className="w-16 bg-white rounded-xl px-2 py-1.5 text-sm font-bold text-gray-700 focus:outline-none"
                    >
                      <option value={0}>00분</option>
                      <option value={30}>30분</option>
                    </select>
                  </div>
                </div>
              </div>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="주요 내용 (예: 운동, 독서, 업무)"
                className="w-full bg-white rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 mb-2 focus:outline-none placeholder:text-gray-300"
              />
              <input
                value={form.detail}
                onChange={(e) =>
                  setForm((f) => ({ ...f, detail: e.target.value }))
                }
                placeholder="상세 내용 (선택사항)"
                className="w-full bg-white rounded-xl px-3 py-2.5 text-sm text-gray-600 mb-3 focus:outline-none placeholder:text-gray-300"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-400 bg-white"
                >
                  취소
                </button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAdd}
                  disabled={!form.title.trim()}
                  className="flex-1 py-2.5 rounded-xl text-sm font-black text-white bg-[#FF8FAB] disabled:opacity-40"
                >
                  추가
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-2">
          <AnimatePresence>
            {sorted.map((slot) => (
              <motion.div
                key={slot.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className={`flex items-center gap-3 bg-white rounded-2xl p-4 border-l-4 shadow-sm ${
                  slot.isCompleted ? 'opacity-50' : ''
                }`}
                style={{
                  borderLeftColor: slot.isFixed ? '#FFD93D' : '#FF8FAB',
                }}
              >
                <div className="w-12 flex-shrink-0 text-right">
                  <p className="text-xs font-black text-gray-400">
                    {formatTime(slot.startHour, slot.startMin)}
                  </p>
                  <p className="text-[10px] text-gray-300">
                    ~{formatTime(slot.endHour, slot.endMin)}
                  </p>
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`font-black text-gray-700 text-sm ${
                      slot.isCompleted ? 'line-through' : ''
                    }`}
                  >
                    {slot.title}
                  </p>
                  {slot.detail && (
                    <p className="text-xs text-gray-400 truncate">
                      {slot.detail}
                    </p>
                  )}
                  {slot.isFixed && (
                    <span className="text-[10px] text-amber-400 font-bold">
                      고정
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.88 }}
                    onClick={() => toggleComplete(slot.id)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      slot.isCompleted
                        ? 'bg-[#A8E6CF] border-[#A8E6CF]'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    {slot.isCompleted && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </motion.button>
                  {!slot.isFixed && (
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.88 }}
                      onClick={() => deleteSlot(slot.id)}
                      className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-gray-300" />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
