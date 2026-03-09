'use client'

/**
 * 엄마가 아이에게 칭찬 스티커를 주는 패널 (전체화면 모달)
 * 비개발자: "칭찬 스티커 주기" 버튼을 누르면 전체화면으로 루틴 완료 / 특별 행동 / 마일스톤을 고르고, 스티커를 선택해 아이 스티커함으로 보내요.
 * 마일스톤 탭: 자녀 연령대별 풀 목록을 보여주고, 부모가 원하는 마일스톤을 "추가"하면 자녀 미션 페이지에 연동됩니다. 추가된 미달성 마일스톤을 골라 스티커를 줄 수 있어요.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, X, Plus } from 'lucide-react'
import { useStickerStore } from '@/lib/stores/stickerStore'
import { useMilestoneStore, getPoolForAge } from '@/lib/stores/milestoneStore'
import { useProfileStore } from '@/lib/stores/profileStore'
import type { StickerEmoji } from '@/types/sticker'
import { STICKER_LABELS } from '@/types/sticker'
import type { FamilyProfile } from '@/types/profile'

const STICKER_OPTIONS: StickerEmoji[] = [
  '⭐',
  '🌟',
  '💫',
  '🏆',
  '❤️',
  '🎖️',
]

/** compact: 헤더 등 좁은 공간용 작은 버튼. selectedChild: 부모 대시보드에서 선택한 자녀 (마일스톤 탭 연령 필터·추가 시 사용) */
export function GiveStickerPanel({
  compact,
  selectedChild,
}: {
  compact?: boolean
  selectedChild?: FamilyProfile | null
}) {
  const { giveSticker } = useStickerStore()
  const {
    getMilestones,
    addMilestoneFromPool,
    achieveMilestone,
  } = useMilestoneStore()
  const parentName =
    useProfileStore((s) => s.getActiveProfile())?.name ?? '엄마'

  const [show, setShow] = useState(false)
  const [selectedEmoji, setSelectedEmoji] = useState<StickerEmoji>('⭐')
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(
    null
  )
  const [mode, setMode] = useState<'routine' | 'special' | 'milestone'>(
    'routine'
  )
  const [justGiven, setJustGiven] = useState(false)
  const [givenEmoji, setGivenEmoji] = useState<StickerEmoji>('⭐')

  // 자녀가 선택돼 있으면 해당 자녀 마일스톤, 없으면 레거시 단일 목록
  const childProfileId = selectedChild?.id ?? null
  const milestones = getMilestones(childProfileId)
  const unachieved = milestones.filter((m) => !m.isAchieved)
  // 연령대별 풀 (마일스톤 탭에서 "추가"할 수 있는 후보). 자녀 역할이 child_preschool / child_school일 때만 의미 있음
  const pool =
    selectedChild?.role === 'child_preschool' ||
    selectedChild?.role === 'child_school'
      ? getPoolForAge(selectedChild.role)
      : []
  const addedImageKeys = new Set(milestones.map((m) => m.imageKey))

  const handleGive = () => {
    if (mode === 'milestone' && selectedMilestone) {
      achieveMilestone(childProfileId, selectedMilestone)
      const ms = milestones.find((m) => m.id === selectedMilestone)
      const emoji = (ms?.stickerEmoji ?? '🏆') as StickerEmoji
      giveSticker(emoji, parentName, `마일스톤: ${ms?.title}`)
      setGivenEmoji(emoji)
    } else {
      const label =
        mode === 'routine' ? '루틴 완료' : '특별히 잘했어요'
      giveSticker(selectedEmoji, parentName, label)
      setGivenEmoji(selectedEmoji)
    }
    setJustGiven(true)
    setTimeout(() => {
      setJustGiven(false)
      setShow(false)
    }, 1500)
  }

  return (
    <>
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={() => setShow(true)}
        className={`flex items-center gap-1.5 bg-gradient-to-r from-[#FFD93D] to-[#FF8FAB] text-white font-black rounded-2xl shadow-lg whitespace-nowrap ${compact ? 'px-3 py-2 text-xs' : 'px-5 py-3'}`}
      >
        <Star className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        칭찬 스티커 주기
      </motion.button>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col min-h-[100dvh] h-full w-full"
            style={{ minHeight: '100dvh' }}
          >
            {/* 헤더: 제목 + 닫기 (세이프에리어 반영) */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-2 border-b border-gray-100">
              <p className="font-black text-gray-700 text-lg">칭찬 스티커 주기 ⭐</p>
              <button
                type="button"
                onClick={() => setShow(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
                aria-label="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 스크롤 가능한 본문 (min-h-0으로 flex 영역에서 스크롤 보장) */}
            <div className="flex-1 min-h-0 overflow-y-auto p-5 pb-[max(2rem,env(safe-area-inset-bottom))]">
              <AnimatePresence mode="wait">
                {justGiven ? (
                  <motion.div
                    key="done"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    className="flex flex-col items-center justify-center min-h-[60vh]"
                  >
                    <span className="text-7xl mb-3">{givenEmoji}</span>
                    <p className="text-2xl font-black text-gray-700">
                      스티커를 줬어요!
                    </p>
                    <p className="text-gray-400 mt-1">
                      아이의 스티커함에 도착했어요 ⭐
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p className="text-sm text-gray-400 mb-5">
                      아이에게 스티커를 선물해요!
                    </p>

                    <div className="flex gap-2 mb-5">
                      {[
                        { key: 'routine', label: '루틴 완료' },
                        { key: 'special', label: '특별 행동' },
                        { key: 'milestone', label: '마일스톤' },
                      ].map(({ key, label }) => (
                        <button
                          type="button"
                          key={key}
                          onClick={() =>
                            setMode(key as 'routine' | 'special' | 'milestone')
                          }
                          className={`flex-1 py-2 rounded-xl text-xs font-black border-2 transition-all ${
                            mode === key
                              ? 'border-[#FF8FAB] bg-[#FFF0F5] text-[#FF8FAB]'
                              : 'border-gray-100 text-gray-400'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {mode === 'milestone' && (
                      <div className="mb-4 space-y-4">
                        {/* 자녀가 선택되지 않았을 때 안내 */}
                        {!selectedChild && (
                          <p className="text-sm text-amber-600 bg-amber-50 rounded-xl p-3">
                            마일스톤은 자녀 대시보드에서 자녀를 선택한 뒤 사용할 수 있어요.
                          </p>
                        )}
                        {selectedChild && (
                          <>
                            {/* 1) 이미 추가된 마일스톤 중 미달성 — 선택 후 스티커 주기 */}
                            <div>
                              <p className="text-xs font-bold text-gray-500 mb-2">
                                🏆 달성하면 스티커 줄 마일스톤 (선택)
                              </p>
                              <div className="max-h-[28vh] overflow-y-auto flex flex-col gap-2">
                                {unachieved.length === 0 ? (
                                  <p className="text-sm text-gray-400 py-2">
                                    추가된 미달성 마일스톤이 없어요. 아래에서 마일스톤을 추가해보세요.
                                  </p>
                                ) : (
                                  unachieved.map((ms) => (
                                    <button
                                      type="button"
                                      key={ms.id}
                                      onClick={() => setSelectedMilestone(ms.id)}
                                      className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                                        selectedMilestone === ms.id
                                          ? 'border-[#FF8FAB] bg-[#FFF0F5]'
                                          : 'border-gray-100'
                                      }`}
                                    >
                                      <span className="text-2xl">
                                        {ms.stickerEmoji}
                                      </span>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-gray-700">
                                          {ms.title}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                          {ms.description}
                                        </p>
                                      </div>
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>
                            {/* 2) 연령대별 풀 — 부모가 "추가"하면 자녀 미션 페이지에 연동 */}
                            <div>
                              <p className="text-xs font-bold text-gray-500 mb-2">
                                ➕ 아이 미션에 추가할 마일스톤 ({selectedChild.role === 'child_school' ? '학령기' : '미취학'} 기준)
                              </p>
                              <div className="max-h-[28vh] overflow-y-auto flex flex-col gap-2">
                                {pool.map((t) => {
                                  const alreadyAdded = addedImageKeys.has(t.imageKey)
                                  return (
                                    <div
                                      key={t.imageKey}
                                      className="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-100 bg-white"
                                    >
                                      <span className="text-2xl flex-shrink-0">
                                        {t.stickerEmoji}
                                      </span>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-gray-700">
                                          {t.title}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                          {t.description}
                                        </p>
                                      </div>
                                      <button
                                        type="button"
                                        disabled={alreadyAdded}
                                        onClick={() =>
                                          addMilestoneFromPool(selectedChild.id, t)
                                        }
                                        className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                                          alreadyAdded
                                            ? 'bg-gray-100 text-gray-400 cursor-default'
                                            : 'bg-[#FF8FAB] text-white'
                                        }`}
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                        {alreadyAdded ? '추가됨' : '추가'}
                                      </button>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {mode !== 'milestone' && (
                      <div className="mb-5">
                        <p className="text-xs text-gray-400 mb-2">
                          스티커 선택
                        </p>
                        <div className="flex gap-2">
                          {STICKER_OPTIONS.map((emoji) => (
                            <button
                              type="button"
                              key={emoji}
                              onClick={() => setSelectedEmoji(emoji)}
                              className={`flex-1 py-3 rounded-2xl text-2xl border-2 transition-all ${
                                selectedEmoji === emoji
                                  ? 'border-[#FFD93D] bg-[#FFFDE7] scale-110'
                                  : 'border-gray-100 bg-gray-50'
                              }`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-center text-gray-400 mt-2">
                          {STICKER_LABELS[selectedEmoji]}
                        </p>
                      </div>
                    )}

                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={handleGive}
                      disabled={mode === 'milestone' && !selectedMilestone}
                      className="w-full py-4 rounded-2xl font-black text-white text-lg disabled:opacity-40 mt-4"
                      style={{
                        background:
                          'linear-gradient(135deg, #FFD93D, #FF8FAB)',
                      }}
                    >
                      ⭐ 스티커 주기!
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
