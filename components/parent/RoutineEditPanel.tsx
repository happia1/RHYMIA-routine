'use client'

/**
 * 루틴 수정 패널 (재사용 컴포넌트)
 * 비개발자: 자녀의 아침/저녁 루틴 항목을 추가·삭제·순서 변경하는 UI입니다.
 * 자녀 루틴 화면 상단에 접이식으로 넣거나, 별도 수정 페이지에서 전체 화면으로 쓸 수 있어요.
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown, Trash2, Plus, ChevronLeft } from 'lucide-react'
import { useKidRoutineStore, selectRoutinesForProfile } from '@/lib/stores/kidRoutineStore'
import { useProfileStore } from '@/lib/stores/profileStore'
import { RoutineTemplate, RoutineItem } from '@/types/routine'
import { EXTRA_ROUTINE_ITEMS, ROUTINE_IMAGES } from '@/lib/utils/defaultRoutines'
import { RoutineItemIcon } from '@/components/kid/RoutineItemIcon'

/** 새 루틴 항목 ID 생성 (중복 방지) */
function generateItemId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** 추가 풀에서 고른 항목을 새 루틴 항목으로 복사 (새 id, order 부여) */
function cloneExtraAsItem(extra: RoutineItem, order: number): RoutineItem {
  const imagePath = extra.imageKey ? (ROUTINE_IMAGES[extra.imageKey] ?? null) : extra.imagePath ?? null
  return {
    ...extra,
    id: generateItemId(),
    order,
    imagePath: imagePath ?? extra.imagePath ?? null,
  }
}

export interface RoutineEditPanelProps {
  /** 수정할 자녀 프로필 ID (없으면 "자녀를 선택해주세요"만 표시) */
  childId: string | null
  /** 자녀 이름 (표시용, 선택) */
  childName?: string
  /** 접기 버튼 클릭 시 호출. 있으면 상단에 "접기" 버튼이 보입니다 (자녀 루틴 화면에 임베드할 때 사용) */
  onClose?: () => void
}

export function RoutineEditPanel({ childId, childName = '우리 아이', onClose }: RoutineEditPanelProps) {
  const { getChildProfiles } = useProfileStore()
  const children = getChildProfiles()
  const selectedChild = childId ? children.find((c) => c.id === childId) : undefined

  const setCurrentProfileId = useKidRoutineStore((s) => s.setCurrentProfileId)
  const initRoutines = useKidRoutineStore((s) => s.initRoutines)
  const routines = useKidRoutineStore(selectRoutinesForProfile(childId ?? null))
  const setRoutines = useKidRoutineStore((s) => s.setRoutines)
  const addDeletedItemTemplate = useKidRoutineStore((s) => s.addDeletedItemTemplate)
  const getDeletedItemTemplates = useKidRoutineStore((s) => s.getDeletedItemTemplates)
  const removeDeletedItemTemplate = useKidRoutineStore((s) => s.removeDeletedItemTemplate)

  const [activeRoutineId, setActiveRoutineId] = useState<string | null>(null)
  const [showAddSheet, setShowAddSheet] = useState(false)

  // 자녀가 바뀌면 해당 자녀 루틴으로 초기화
  useEffect(() => {
    if (childId) {
      setCurrentProfileId(childId)
      initRoutines(selectedChild?.role)
    }
  }, [childId, selectedChild?.role, setCurrentProfileId, initRoutines])

  const updateRoutines = (next: RoutineTemplate[]) => {
    if (childId) setRoutines(next, childId)
  }

  const getRoutine = (routineId: string) => routines.find((r) => r.id === routineId)

  /** 항목 순서 위/아래로 이동 */
  const moveItem = (routineId: string, itemIndex: number, direction: 'up' | 'down') => {
    const routine = getRoutine(routineId)
    if (!routine || routine.items.length === 0) return
    const sorted = [...routine.items].sort((a, b) => a.order - b.order)
    const target = direction === 'up' ? itemIndex - 1 : itemIndex + 1
    if (target < 0 || target >= sorted.length) return
    ;[sorted[itemIndex], sorted[target]] = [sorted[target], sorted[itemIndex]]
    const reordered = sorted.map((it, i) => ({ ...it, order: i + 1 }))
    updateRoutines(
      routines.map((r) => (r.id === routineId ? { ...r, items: reordered } : r))
    )
  }

  /** 루틴에서 항목 삭제 → 삭제 풀에 넣어서 나중에 "항목 추가"로 다시 넣을 수 있게 함 */
  const removeItem = (routineId: string, itemId: string) => {
    const routine = getRoutine(routineId)
    if (!routine || !childId) return
    const deleted = routine.items.find((it) => it.id === itemId)
    const newItems = routine.items.filter((it) => it.id !== itemId).map((it, i) => ({ ...it, order: i + 1 }))
    updateRoutines(routines.map((r) => (r.id === routineId ? { ...r, items: newItems } : r)))
    if (deleted) addDeletedItemTemplate(childId, routineId, deleted)
  }

  /** 루틴에 항목 추가 (고정 풀 또는 삭제 풀에서 선택한 항목) */
  const addItemToRoutine = (routineId: string, extra: RoutineItem) => {
    const routine = getRoutine(routineId)
    if (!routine || !childId) return
    const newItem = cloneExtraAsItem(extra, routine.items.length + 1)
    const newItems = [...routine.items, newItem]
    updateRoutines(routines.map((r) => (r.id === routineId ? { ...r, items: newItems } : r)))
    const label = (extra.label ?? '').trim()
    if (label) removeDeletedItemTemplate(childId, routineId, label)
    setShowAddSheet(false)
  }

  if (!childId) {
    return (
      <div className="py-8 flex items-center justify-center">
        <p className="text-gray-400 text-sm">자녀를 선택해주세요</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 접기 버튼: 자녀 루틴 화면에 임베드했을 때만 표시 */}
      {onClose && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">{childName}의 루틴을 편집해요</p>
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-bold"
          >
            <ChevronLeft className="w-4 h-4" />
            접기
          </motion.button>
        </div>
      )}

      {/* 루틴별 카드 (아침/저녁 등) */}
      <div className="flex flex-col gap-6">
        {routines.map((routine) => (
          <motion.div
            key={routine.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-3 bg-gradient-to-r from-pink-50 to-amber-50 border-b border-gray-100 flex items-center justify-between">
              <p className="font-black text-gray-700">{routine.title}</p>
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveRoutineId(routine.id)
                  setShowAddSheet(true)
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF8FAB] text-white text-sm font-bold"
              >
                <Plus className="w-4 h-4" />
                항목 추가
              </motion.button>
            </div>

            <div className="divide-y divide-gray-50">
              {routine.items.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-400 text-sm">
                  항목이 없어요. 위에서 &quot;항목 추가&quot;로 넣어보세요.
                </div>
              ) : (
                routine.items
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((item, index) => (
                    <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                      <span className="text-gray-400 text-sm w-6">{index + 1}</span>
                      <div className="w-12 h-12 rounded-xl bg-[#FFF9F0] flex items-center justify-center overflow-hidden flex-shrink-0">
                        <RoutineItemIcon
                          item={item}
                          className="w-12 h-12"
                          imageClassName="w-10 h-10 object-contain"
                        />
                      </div>
                      <p className="flex-1 font-bold truncate text-gray-700">{item.label}</p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => moveItem(routine.id, index, 'up')}
                          disabled={index === 0}
                          className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center disabled:opacity-30"
                        >
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveItem(routine.id, index, 'down')}
                          disabled={index === routine.items.length - 1}
                          className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center disabled:opacity-30"
                        >
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(routine.id, item.id)}
                          className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 항목 추가 바텀 시트: 추가 가능한 루틴 풀 표시 */}
      <AnimatePresence>
        {showAddSheet && activeRoutineId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddSheet(false)}
              className="fixed inset-0 bg-black/40 z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 right-0 bottom-0 bg-white rounded-t-3xl shadow-xl z-50 max-h-[70vh] flex flex-col"
            >
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <p className="font-black text-gray-700">추가할 항목을 골라주세요</p>
                <button
                  type="button"
                  onClick={() => setShowAddSheet(false)}
                  className="text-gray-400 text-sm"
                >
                  닫기
                </button>
              </div>
              <div className="overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* 고정 추가 풀 + 이 루틴에서 삭제한 항목(다시 추가 가능) */}
                {[
                  ...EXTRA_ROUTINE_ITEMS,
                  ...(childId && activeRoutineId
                    ? getDeletedItemTemplates(childId, activeRoutineId)
                    : []),
                ].map((extra, idx) => (
                  <motion.button
                    key={extra.id || `deleted-${idx}-${(extra.label ?? '').trim()}`}
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => addItemToRoutine(activeRoutineId!, extra)}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[#FFF9F0] border-2 border-pink-50 hover:border-[#FF8FAB]"
                  >
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden bg-white">
                      <RoutineItemIcon
                        item={extra}
                        className="w-14 h-14"
                        imageClassName="w-12 h-12 object-contain"
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-700 text-center line-clamp-2">
                      {extra.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
