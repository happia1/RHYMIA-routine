'use client'

/**
 * 마일스톤 전체 페이지 — 카테고리별 목록 + 엄마 커스텀 미션 추가
 * 비개발자: 도장깨기 미션 목록을 보고, 엄마가 "특별 미션"을 추가할 수 있어요. 달성한 항목은 체크 표시돼요.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useMilestoneStore } from '@/lib/stores/milestoneStore'
import { useProfileStore } from '@/lib/stores/profileStore'

const CATEGORY_META = {
  'self-care': { label: '자기돌봄', emoji: '🪥', color: '#FF8FAB' },
  home: { label: '집안일', emoji: '🏠', color: '#A8E6CF' },
  learning: { label: '학습', emoji: '📚', color: '#7EB8D4' },
  social: { label: '사회성', emoji: '❤️', color: '#FFD93D' },
  custom: { label: '특별 미션', emoji: '⭐', color: '#B8A9E3' },
}

export default function MilestonePage() {
  const router = useRouter()
  const activeProfile = useProfileStore((s) => s.getActiveProfile())
  const profileId = activeProfile?.id ?? null
  const {
    getMilestones,
    addCustomMilestone,
    deleteCustomMilestone,
  } = useMilestoneStore()
  const milestones = getMilestones(profileId)

  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    stickerEmoji: '⭐',
    targetAge: 'both' as 'preschool' | 'school' | 'both',
  })

  const categories = Object.keys(CATEGORY_META) as Array<
    keyof typeof CATEGORY_META
  >

  const handleAdd = () => {
    if (!form.title.trim()) return
    addCustomMilestone(profileId, {
      title: form.title,
      description: form.description,
      imagePath: null,
      targetAge: form.targetAge,
      stickerEmoji: form.stickerEmoji,
    })
    setForm({
      title: '',
      description: '',
      stickerEmoji: '⭐',
      targetAge: 'both',
    })
    setShowAddForm(false)
  }

  return (
    <div className="min-h-screen bg-[#FFF9F0] pb-24">
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-black text-gray-700">마일스톤</h1>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 bg-[#FF8FAB] text-white text-sm font-black px-3 py-2 rounded-2xl shadow"
        >
          <Plus className="w-4 h-4" />
          추가
        </motion.button>
      </div>

      <div className="px-5">
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-pink-100"
            >
              <p className="font-black text-gray-700 mb-3">
                ✨ 특별 미션 만들기
              </p>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="미션 이름 (예: 동생에게 책 읽어줬어요)"
                className="w-full bg-gray-50 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 mb-2 focus:outline-none placeholder:text-gray-300"
              />
              <input
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="설명 (선택사항)"
                className="w-full bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-600 mb-3 focus:outline-none placeholder:text-gray-300"
              />
              <p className="text-xs text-gray-400 mb-2">달성 스티커</p>
              <div className="flex gap-2 mb-4">
                {(
                  ['⭐', '🌟', '💫', '🏆', '❤️', '🎖️'] as const
                ).map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() =>
                      setForm((f) => ({ ...f, stickerEmoji: emoji }))
                    }
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border-2 ${
                      form.stickerEmoji === emoji
                        ? 'border-[#FF8FAB] bg-[#FFF0F5]'
                        : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-400 bg-gray-50"
                >
                  취소
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAdd}
                  disabled={!form.title.trim()}
                  className="flex-1 py-2.5 rounded-xl text-sm font-black text-white bg-[#FF8FAB] disabled:opacity-40"
                >
                  미션 추가
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {milestones.length === 0 && (
          <div className="text-center py-12 px-4">
            <p className="text-4xl mb-3">🎯</p>
            <p className="font-black text-gray-700 mb-1">아직 마일스톤이 없어요</p>
            <p className="text-sm text-gray-400">
              엄마/아빠가 칭찬 스티커 주기 → 마일스톤 탭에서 추가해주시면 여기에 표시돼요. 달성하면 성공 배지를 받아요!
            </p>
          </div>
        )}

        {categories.map((cat) => {
          const catMilestones = milestones.filter((m) => m.category === cat)
          if (catMilestones.length === 0) return null
          const meta = CATEGORY_META[cat]
          return (
            <div key={cat} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{meta.emoji}</span>
                <p className="font-black text-gray-700">{meta.label}</p>
                <span className="text-xs text-gray-400">
                  {catMilestones.filter((m) => m.isAchieved).length}/
                  {catMilestones.length}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {catMilestones.map((ms) => (
                  <motion.div
                    key={ms.id}
                    layout
                    className={`flex items-center gap-4 rounded-2xl p-4 shadow-sm border-l-4 ${
                      ms.isAchieved
                        ? 'bg-gradient-to-r from-amber-50/80 to-white opacity-90'
                        : 'bg-white'
                    }`}
                    style={{ borderLeftColor: meta.color }}
                  >
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0 relative">
                      {ms.imagePath ? (
                        <img
                          src={ms.imagePath}
                          alt={ms.title}
                          className={`w-full h-full object-contain p-1 ${ms.isAchieved ? 'opacity-75' : ''}`}
                        />
                      ) : (
                        <span className="text-3xl">
                          {ms.stickerEmoji ?? '🎯'}
                        </span>
                      )}
                      {ms.isAchieved && (
                        <span className="absolute -top-0.5 -right-0.5 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-xs">
                          🏆
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-black text-gray-700 text-sm ${ms.isAchieved ? 'line-through' : ''}`}
                      >
                        {ms.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {ms.description}
                      </p>
                      {ms.isAchieved && ms.achievedAt && (
                        <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
                          🏅 성공 배지 · {new Date(ms.achievedAt).toLocaleDateString('ko-KR')} 달성
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <span className="text-xl">{ms.stickerEmoji}</span>
                      {ms.isCustom && (
                        <button
                          onClick={() => deleteCustomMilestone(profileId, ms.id)}
                          className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center"
                        >
                          <Trash2 className="w-3 h-3 text-gray-300" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
