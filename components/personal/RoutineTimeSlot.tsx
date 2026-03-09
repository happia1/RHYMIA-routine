'use client'

/**
 * 시간대별 루틴 입력 카드 (아침/오후/저녁/밤 구간 하나)
 * 비개발자: 선택한 구간의 루틴 목록을 보여주고, + 버튼으로 새 루틴을 추가할 수 있어요. 각 항목은 완료 체크·삭제 가능해요.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Check } from 'lucide-react'
import { usePersonalRoutineStore, TIME_BLOCK_META, type TimeBlock, type FreeRoutineSlot } from '@/lib/stores/personalRoutineStore'

interface RoutineTimeSlotProps {
  block: TimeBlock
}

export function RoutineTimeSlot({ block }: RoutineTimeSlotProps) {
  const { getSlotsByBlock, addSlot, deleteSlot, toggleComplete } = usePersonalRoutineStore()
  const meta = TIME_BLOCK_META[block]
  const slots = getSlotsByBlock(block)

  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [startHour, setStartHour] = useState(meta.hours[0])
  const [endHour, setEndHour] = useState(
    meta.hours[1] > 24 ? meta.hours[0] + 1 : meta.hours[0] + 1
  )

  const handleAdd = () => {
    if (!title.trim()) return
    addSlot({
      startHour,
      startMin: 0,
      endHour: endHour >= 24 ? 23 : endHour,
      endMin: endHour >= 24 ? 30 : 0,
      title: title.trim(),
      detail: detail.trim(),
    })
    setTitle('')
    setDetail('')
    setShowForm(false)
  }

  const getSlotColor = (startHour: number) => {
    if (startHour >= 6 && startHour < 12) return '#FFD93D'
    if (startHour >= 12 && startHour < 18) return '#A8E6CF'
    if (startHour >= 18 && startHour < 22) return '#FF8FAB'
    return '#B8A9E3'
  }

  return (
    <div className="mb-4">
      {/* 구간 헤더 (색 점 + 이모지 + 라벨 + 시간 범위 + 추가 버튼) */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: meta.color }} />
          <span className="font-black text-gray-700">{meta.emoji} {meta.label}</span>
          <span className="text-xs text-gray-400">
            {meta.hours[0]}:00 ~ {meta.hours[1] === 6 ? '익일 06:00' : `${meta.hours[1]}:00`}
          </span>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowForm(!showForm)}
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ backgroundColor: meta.color + '33' }}
        >
          <Plus className="w-4 h-4" style={{ color: meta.color }} />
        </motion.button>
      </div>

      {/* 슬롯 목록 */}
      <AnimatePresence>
        {slots.map((slot) => (
          <motion.div
            key={slot.id}
            layout
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20, height: 0 }}
            className="flex items-start gap-3 mb-2"
          >
            {/* 시간 라벨 */}
            <div className="w-14 text-right flex-shrink-0 pt-0.5">
              <p className="text-xs font-bold text-gray-400">
                {slot.startHour}:{String(slot.startMin).padStart(2, '0')}
              </p>
            </div>

            {/* 색상 점 + 세로 라인 */}
            {(() => {
              const slotColor = getSlotColor(slot.startHour)
              return (
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: slotColor }}
                  />
                  <div
                    className="w-0.5 h-8 mt-1 rounded-full opacity-30"
                    style={{ backgroundColor: slotColor }}
                  />
                </div>
              )
            })()}

            {/* 카드 내용 (제목, 상세, 완료/삭제 버튼) */}
            <div
              className={`flex-1 bg-white rounded-2xl px-4 py-3 shadow-sm border-l-4 transition-opacity ${
                slot.isCompleted ? 'opacity-40' : ''
              }`}
              style={{ borderLeftColor: getSlotColor(slot.startHour) }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className={`font-black text-gray-700 text-sm ${slot.isCompleted ? 'line-through' : ''}`}>
                    {slot.title}
                  </p>
                  {slot.detail && (
                    <p className="text-xs text-gray-400 mt-0.5">{slot.detail}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => toggleComplete(slot.id)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                      slot.isCompleted ? 'border-transparent' : 'border-gray-200'
                    }`}
                    style={slot.isCompleted ? { backgroundColor: getSlotColor(slot.startHour) } : {}}>
                    {slot.isCompleted && <Check className="w-3 h-3 text-white" />}
                  </button>
                  {!slot.isFixed && (
                    <button onClick={() => deleteSlot(slot.id)}
                      className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center">
                      <Trash2 className="w-3 h-3 text-gray-300" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 추가 폼 (시간 선택 + 주요/상세 입력 + 취소·추가 버튼) */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-17 bg-white rounded-2xl p-4 shadow-sm border-2 mb-2"
            style={{ borderColor: meta.color + '66', marginLeft: '68px' }}
          >
            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <label className="text-xs text-gray-400 font-semibold">시작</label>
                <select value={startHour} onChange={(e) => setStartHour(Number(e.target.value))}
                  className="w-full text-sm font-bold text-gray-700 bg-gray-50 rounded-xl px-2 py-1.5 focus:outline-none mt-1">
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{String(i).padStart(2,'0')}:00</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-400 font-semibold">종료</label>
                <select value={endHour} onChange={(e) => setEndHour(Number(e.target.value))}
                  className="w-full text-sm font-bold text-gray-700 bg-gray-50 rounded-xl px-2 py-1.5 focus:outline-none mt-1">
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{String(i).padStart(2,'0')}:00</option>
                  ))}
                </select>
              </div>
            </div>

            <input
              value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="주요 내용 (예: 운동, 독서)"
              className="w-full text-sm font-semibold text-gray-700 bg-gray-50 rounded-xl px-3 py-2 focus:outline-none mb-2 placeholder:text-gray-300"
            />
            <input
              value={detail} onChange={(e) => setDetail(e.target.value)}
              placeholder="상세 내용 (선택)"
              className="w-full text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2 focus:outline-none mb-3 placeholder:text-gray-300"
            />

            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2 rounded-xl text-sm font-bold text-gray-400 bg-gray-50">
                취소
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAdd}
                disabled={!title.trim()}
                className="flex-1 py-2 rounded-xl text-sm font-black text-white disabled:opacity-40"
                style={{ backgroundColor: meta.color }}
              >
                추가
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
