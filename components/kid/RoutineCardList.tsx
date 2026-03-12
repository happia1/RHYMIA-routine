/**
 * 루틴 카드 리스트 — 수정 모드에서만 드래그 앤 드롭·추가·삭제
 * 비개발자: 기본은 완료만 가능. '수정' 버튼을 누르면 순서 변경·루틴 추가·휴지통 삭제가 활성화됩니다.
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { RoutineItem } from '@/types/routine'
import { ROUTINE_IMAGES } from '@/lib/utils/defaultRoutines'
import { EXTRA_ROUTINE_ITEMS } from '@/lib/utils/defaultRoutines'

const ROUTINE_TYPE_META: Record<string, { emoji: string }> = {
  morning: { emoji: '🌅' },
  afternoon: { emoji: '☀️' },
  evening: { emoji: '🌙' },
  weekend: { emoji: '🎉' },
  special: { emoji: '⭐' },
}

export interface RoutineItemEntry {
  routineId: string
  routineType: string
  item: RoutineItem
}

/** 카드에 표시할 이미지 URL (routine-icons 매핑) */
function getItemImageUrl(item: RoutineItem): string | null {
  const path = item.imagePath ?? (item.imageKey ? ROUTINE_IMAGES[item.imageKey] ?? null : null)
  return path ?? null
}

/** 카드 공통 UI — 지정 컬러 없으면 화이트, 특별미션(special)은 골드 배경·반짝임·보상 별. 수정 모드에서 왼쪽 상단 숨기기/표시하기 버튼 */
function RoutineCardContent({
  entry,
  onComplete,
  onHide,
  isDragging,
  isEditMode,
  dragProps,
}: {
  entry: RoutineItemEntry
  /** 클릭 시 완료 처리. 이벤트를 넘겨서 카드→보상 아이콘 날아가는 효과의 출발 위치로 사용 */
  onComplete: (e?: React.MouseEvent) => void
  /** 수정 모드에서 숨기기/표시하기 토글 (hidden 여부 전달) */
  onHide?: (hidden: boolean) => void
  isDragging?: boolean
  isEditMode: boolean
  dragProps?: { attributes: object; listeners: object }
}) {
  const meta = ROUTINE_TYPE_META[entry.routineType] ?? ROUTINE_TYPE_META.special
  const { item } = entry
  const imageUrl = getItemImageUrl(item)
  const isSpecial = entry.routineType === 'special'
  const rewardEmoji = isSpecial ? '⭐' : '❤️'
  const isHidden = !!item.hidden

  return (
    <div
      {...(isEditMode && dragProps ? dragProps : {})}
      className={`
        relative rounded-xl overflow-hidden aspect-[3/4] flex flex-col
        ${isEditMode ? 'cursor-grab active:cursor-grabbing touch-none' : ''}
        ${isHidden ? 'opacity-75' : ''}
        ${isSpecial
          ? 'bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-100 border-2 border-amber-400 shadow-lg shadow-amber-300/40 ring-2 ring-amber-300/50'
          : 'bg-white border-2 border-gray-200 shadow-md'}
      `}
      onClick={(e) => onComplete(e)}
    >
      {/* 수정 모드: 왼쪽 상단 숨기기/표시하기 버튼 (클릭 시 전파 막아 카드 완료 처리 안 됨) */}
      {isEditMode && onHide && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onHide(!isHidden) }}
          className="absolute top-1 left-1 z-[5] rounded-md px-1.5 py-0.5 text-[10px] font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300"
          aria-label={isHidden ? '표시하기' : '숨기기'}
        >
          {isHidden ? '표시하기' : '숨기기'}
        </button>
      )}
      {/* 보상 우측 상단 — 특별미션=별, 그 외=하트(EXP) */}
      <div className={`absolute top-1 right-1 z-[5] flex items-center gap-0.5 rounded-md px-1.5 py-0.5 border ${isSpecial ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
        <span className="text-sm">{rewardEmoji}</span>
        <span className="text-[10px] font-black">+1</span>
      </div>

      {/* 이미지·라벨: 블록 크기에 맞게 이미지 확대 */}
      <div className="p-2 flex-1 flex flex-col justify-center items-center min-h-0">
        <div className="flex-1 w-full min-h-0 flex items-center justify-center mb-1">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={item.label}
              width={120}
              height={120}
              className="object-contain w-full max-w-[85%] h-full max-h-[85%]"
              unoptimized
            />
          ) : (
            <span className="text-4xl">{item.icon || meta.emoji}</span>
          )}
        </div>
        <p className="text-xs font-black text-gray-800 leading-tight line-clamp-2 text-center w-full px-1">{item.label}</p>
      </div>
    </div>
  )
}

/** 정사각형 루틴 카드 — 수정 모드일 때만 드래그 가능, 왼쪽 상단 숨기기/표시하기 */
function SortableRoutineCard({
  entry,
  onComplete,
  onDelete,
  onHide,
  isDragging,
  isEditMode,
}: {
  entry: RoutineItemEntry
  onComplete: (e?: React.MouseEvent) => void
  onDelete: () => void
  onHide?: (hidden: boolean) => void
  isDragging?: boolean
  isEditMode: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: entry.item.id, disabled: !isEditMode })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const dragging = isEditMode && (isSortableDragging || isDragging)

  // ref와 listeners는 반드시 같은 DOM 요소에 있어야 @dnd-kit 드래그가 동작함
  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...(isEditMode ? { ...attributes, ...listeners } : {})}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: 1,
        scale: dragging ? 1.05 : 1,
        boxShadow: dragging ? '0 12px 24px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.08)',
        zIndex: dragging ? 50 : 0,
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={isEditMode ? 'cursor-grab active:cursor-grabbing touch-none' : ''}
    >
      <RoutineCardContent
        entry={entry}
        onComplete={onComplete}
        onHide={onHide}
        isDragging={dragging}
        isEditMode={isEditMode}
        dragProps={undefined}
      />
    </motion.div>
  )
}

/**
 * 수정 모드가 아닐 때: 클릭 시 부모에서 즉시 완료 처리되어 리스트에서 제거됨.
 * 리스트에서 제거될 때 터지면서(살짝 커졌다가) 사라지는 exit 애니메이션 재생.
 */
function StaticRoutineCard({
  entry,
  onComplete,
}: {
  entry: RoutineItemEntry
  onComplete: (e?: React.MouseEvent) => void
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.35 }}
      transition={{ duration: 0.22, ease: 'easeIn' }}
    >
      <RoutineCardContent
        entry={entry}
        onComplete={onComplete}
        isEditMode={false}
      />
    </motion.div>
  )
}

/** 휴지통 드롭 영역 — 카드를 여기로 드래그하면 삭제 */
function TrashDropZone() {
  const { setNodeRef, isOver } = useDroppable({ id: 'trash' })
  return (
    <div
      ref={setNodeRef}
      className={`
        mt-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 py-3 px-4
        ${isOver ? 'bg-red-100 border-red-400' : 'bg-gray-100 border-gray-200'}
      `}
    >
      <span className="text-2xl">🗑️</span>
      <span className="text-xs font-bold text-gray-600">여기로 드래그하면 삭제</span>
    </div>
  )
}

/** 아이콘 선택 모달 (추가 가능한 항목 그리드) — 필요 시 외부에서 사용 */
export function IconPickerModal({
  open,
  onClose,
  onSelect,
  deletedTemplates,
}: {
  open: boolean
  onClose: () => void
  onSelect: (item: RoutineItem) => void
  deletedTemplates: RoutineItem[]
}) {
  if (!open) return null
  const options = [...EXTRA_ROUTINE_ITEMS]
  deletedTemplates.forEach((t) => {
    if (!options.some((o) => (o.label ?? '').trim() === (t.label ?? '').trim())) {
      options.push({ ...t, id: '', order: 0 })
    }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-h-[70vh] overflow-hidden flex flex-col"
      >
        <div className="p-3 border-b flex justify-between items-center">
          <span className="font-bold text-gray-800">추가할 루틴 선택</span>
          <button type="button" onClick={onClose} className="text-gray-500 p-1">닫기</button>
        </div>
        <div className="p-3 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-2">
          {options.map((item) => (
            <button
              key={item.label + (item.imageKey ?? '')}
              type="button"
              onClick={() => { onSelect(item); onClose() }}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 hover:bg-amber-50 border border-gray-100"
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs font-semibold text-gray-700 line-clamp-2 text-center">{item.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

interface RoutineCardListProps {
  entries: RoutineItemEntry[]
  /** 카드 클릭 시 호출 (부모에서 즉시 완료 처리 + 날아가는 효과) */
  onComplete: (entry: RoutineItemEntry, e?: React.MouseEvent) => void
  onReorder: (newOrder: RoutineItemEntry[]) => void
  onRemove: (entry: RoutineItemEntry) => void
  /** 수정 모드에서 카드 숨기기/표시하기 (설정은 저장되어 다음날에도 유지) */
  onHide?: (entry: RoutineItemEntry, hidden: boolean) => void
  getDeletedTemplates?: (routineId: string) => RoutineItem[]
  editMode: boolean
}

export function RoutineCardList({
  entries,
  onComplete,
  onReorder,
  onRemove,
  onHide,
  getDeletedTemplates = () => [],
  editMode,
}: RoutineCardListProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [orderedEntries, setOrderedEntries] = useState<RoutineItemEntry[]>(entries)
  // 드롭 시 최신 순서를 전달하기 위한 ref (setState 비동기 때문에 클로저의 orderedEntries는 이전 값일 수 있음)
  const orderedEntriesRef = useRef<RoutineItemEntry[]>(entries)

  // 드래그 중이 아닐 때 부모 entries와 동기화
  useEffect(() => {
    if (!activeId) setOrderedEntries(entries)
  }, [entries, activeId])

  const displayEntries = activeId ? orderedEntries : entries

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 300, tolerance: 8 } })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    setOrderedEntries(entries)
    orderedEntriesRef.current = entries
  }, [entries])

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event
      if (!over || over.id === 'trash' || active.id === over.id) return

      setOrderedEntries((prev) => {
        const oldIndex = prev.findIndex((e) => e.item.id === active.id)
        const newIndex = prev.findIndex((e) => e.item.id === over.id)
        if (oldIndex === -1 || newIndex === -1) return prev
        const next = arrayMove(prev, oldIndex, newIndex)
        orderedEntriesRef.current = next
        return next
      })
    },
    []
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      const finalOrder = orderedEntriesRef.current

      setActiveId(null)

      if (!over) return

      if (over.id === 'trash') {
        const entry = finalOrder.find((e) => e.item.id === active.id)
        if (entry) onRemove(entry)
        return
      }

      if (over.id !== active.id) {
        onReorder(finalOrder)
      }
    },
    [onRemove, onReorder]
  )

  const activeEntry = activeId ? orderedEntries.find((e) => e.item.id === activeId) : null
  const itemIds = displayEntries.map((e) => e.item.id)

  /* 가로 슬라이딩 카드 리스트 (Horizontal ScrollView) */
  const cardGrid = (
    <div className="flex gap-3 overflow-x-auto overflow-y-hidden pb-2 -mx-1 px-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
      <AnimatePresence mode="popLayout">
        {displayEntries.map((entry) =>
          editMode ? (
            <div key={entry.item.id} className="flex-shrink-0 w-[min(34vw,172px)] min-h-[min(46vw,230px)]">
              <SortableRoutineCard
                entry={entry}
                onComplete={(e) => onComplete(entry, e)}
                onDelete={() => onRemove(entry)}
                onHide={onHide ? (hidden) => onHide(entry, hidden) : undefined}
                isDragging={false}
                isEditMode
              />
            </div>
          ) : (
            <motion.div
              key={entry.item.id}
              layout
              exit={{ opacity: 0, scale: 0.3, transition: { duration: 0.2 } }}
              className="flex-shrink-0 w-[min(34vw,172px)] min-h-[min(46vw,230px)]"
            >
              {/* 카드 클릭 시 완료 처리 후 리스트에서 제거될 때 exit로 사라짐 */}
              <StaticRoutineCard
                entry={entry}
                onComplete={(e) => onComplete(entry, e)}
              />
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  )

  if (!editMode) {
    return <>{cardGrid}</>
  }

  return (
    <>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <SortableContext items={itemIds} strategy={rectSortingStrategy}>
          {cardGrid}
        </SortableContext>

        <TrashDropZone />

        <DragOverlay dropAnimation={null}>
          {activeEntry ? (
            <motion.div
              animate={{ scale: 1.05, boxShadow: '0 12px 24px rgba(0,0,0,0.15)' }}
              className="rounded-xl overflow-hidden"
            >
              <RoutineCardContent
                entry={activeEntry}
                onComplete={() => {}}
                isDragging
                isEditMode
              />
            </motion.div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  )
}
