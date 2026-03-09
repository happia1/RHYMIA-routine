'use client'

/**
 * 자녀 루틴 대시보드 (엄마용)
 * 비개발자: 부모가 자녀 이름으로 들어와서 "확인 대기 중" 미션을 승인/거절하고, 전체 완료 시 보상(먹이)으로 넘어가요.
 * 알림 페이지 "자녀 루틴 확인"에서 ?childId= 로 특정 자녀를 지정할 수 있어요.
 */

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'
import { useKidRoutineStore, selectRoutines } from '@/lib/stores/kidRoutineStore'
import { useProfileStore } from '@/lib/stores/profileStore'
import { usePetStore } from '@/lib/stores/petStore'
import { GiveStickerPanel } from '@/components/parent/GiveStickerPanel'
import confetti from 'canvas-confetti'

/** useSearchParams()를 쓰는 실제 대시보드 내용 — Suspense 경계 안에서만 렌더링됩니다 */
function ParentDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { getChildProfiles } = useProfileStore()
  const children = getChildProfiles()
  const queryChildId = searchParams.get('childId')
  const selectedChild = queryChildId
    ? children.find((c) => c.id === queryChildId) ?? children[0]
    : children[0]
  const childId = selectedChild?.id ?? null
  const childName = selectedChild?.name ?? '우리 아이'

  const setCurrentProfileId = useKidRoutineStore((s) => s.setCurrentProfileId)
  const initRoutines = useKidRoutineStore((s) => s.initRoutines)
  const routines = useKidRoutineStore(selectRoutines)
  const pendingConfirmItems = useKidRoutineStore((s) => s.pendingConfirmItems)
  const parentApproveForRoutine = useKidRoutineStore((s) => s.parentApproveForRoutine)
  const parentReject = useKidRoutineStore((s) => s.parentReject)
  const getTodayLogForProfile = useKidRoutineStore((s) => s.getTodayLogForProfile)
  const { addFood } = usePetStore()
  const [allDone, setAllDone] = useState(false)

  // 자녀 프로필로 전환하고 루틴 초기화 (학령기면 학령기 기본 루틴)
  useEffect(() => {
    if (childId) {
      setCurrentProfileId(childId)
      initRoutines(selectedChild?.role)
    }
  }, [childId, selectedChild?.role, setCurrentProfileId, initRoutines])

  // 오늘 완료된 항목 ID 목록 (모든 루틴 로그에서 합침)
  const sessionCompletedItems = childId
    ? routines.flatMap((r) => getTodayLogForProfile(childId, r.id)?.completedItems ?? [])
    : []

  const allItems = routines.flatMap((r) => r.items)
  const totalCount = allItems.length
  const completedCount = sessionCompletedItems.length
  const pendingCount = pendingConfirmItems.length

  // 전체 완료 시 먹이 지급 + 컨페티 + 보상 페이지 이동
  useEffect(() => {
    if (totalCount > 0 && completedCount >= totalCount && !allDone) {
      setAllDone(true)
      addFood(1)
      const end = Date.now() + 2000
      const frame = () => {
        confetti({ particleCount: 4, angle: 60, spread: 50, origin: { x: 0 } })
        confetti({ particleCount: 4, angle: 120, spread: 50, origin: { x: 1 } })
        if (Date.now() < end) requestAnimationFrame(frame)
      }
      frame()
      setTimeout(() => router.push('/routine/parent-dashboard/reward'), 2500)
    }
  }, [completedCount, totalCount, allDone, addFood, router])

  const pendingItemDetails = routines
    .flatMap((r) => r.items.map((item) => ({ ...item, routineId: r.id, routineTitle: r.title })))
    .filter((item) => pendingConfirmItems.includes(item.id))

  const completedItemDetails = routines
    .flatMap((r) => r.items.map((item) => ({ ...item, routineTitle: r.title })))
    .filter((item) => sessionCompletedItems.includes(item.id))

  return (
    <div className="min-h-screen bg-[#FFF9F0] pb-24">
      <div className="sticky top-0 bg-[#FFF9F0]/95 backdrop-blur-sm px-5 py-4 z-10">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center flex-shrink-0">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-black text-gray-700 text-lg">{childName}의 오늘 루틴</p>
            <p className="text-xs text-gray-400">
              {completedCount}/{totalCount} 완료
              {pendingCount > 0 && <span className="text-amber-400 ml-2">· {pendingCount}개 확인 대기</span>}
            </p>
          </div>
          <div className="flex-shrink-0">
            <GiveStickerPanel compact selectedChild={selectedChild ?? null} />
          </div>
        </div>

        <div className="mt-3 h-2 bg-pink-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#FF8FAB] to-[#FFD93D] rounded-full"
            animate={{ width: `${(completedCount / Math.max(totalCount, 1)) * 100}%` }}
            transition={{ type: 'spring', stiffness: 80 }}
          />
        </div>
      </div>

      <div className="px-5 pt-2">
        {pendingItemDetails.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-black text-amber-500 mb-3">⏳ 확인 대기 중</p>
            <div className="flex flex-col gap-3">
              <AnimatePresence>
                {pendingItemDetails.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{
                      opacity: 0, scale: 0.85,
                      x: 60,
                      transition: { duration: 0.4 }
                    }}
                    className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border-2 border-amber-100"
                  >
                    <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.imagePath ? (
                        <img src={item.imagePath} alt={item.label}
                          className="w-full h-full object-contain p-1" />
                      ) : (
                        <span className="text-3xl">{item.icon}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-black text-gray-700">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.routineTitle}</p>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <motion.button
                        whileTap={{ scale: 0.88 }}
                        onClick={() => parentApproveForRoutine(item.routineId, item.id)}
                        className="w-12 h-12 bg-[#A8E6CF] rounded-2xl flex items-center justify-center shadow-sm"
                      >
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.88 }}
                        onClick={() => parentReject(item.id)}
                        className="w-12 h-12 bg-[#FFB3C8] rounded-2xl flex items-center justify-center shadow-sm"
                      >
                        <XCircle className="w-6 h-6 text-white" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {completedItemDetails.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-black text-[#A8E6CF] mb-3">✅ 완료됨</p>
            <div className="flex flex-col gap-2">
              {completedItemDetails.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  className="flex items-center gap-3 bg-white/60 rounded-2xl p-3 opacity-50"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.imagePath ? (
                      <img src={item.imagePath} alt={item.label}
                        className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-2xl">{item.icon}</span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-gray-500 line-through">{item.label}</p>
                  <div className="ml-auto w-5 h-5 rounded-full bg-[#A8E6CF] flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {pendingItemDetails.length === 0 && completedItemDetails.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌟</div>
            <p className="text-xl font-black text-gray-500">아직 완료된 미션이 없어요</p>
            <p className="text-gray-400 text-sm mt-2">{childName}이 루틴을 시작하면 여기서 확인할 수 있어요</p>
          </div>
        )}
      </div>
    </div>
  )
}

/** 페이지 기본 내보내기: useSearchParams 사용 구간을 Suspense로 감싸 빌드/프리렌더 오류를 방지합니다 */
export default function ParentDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center">
          <div className="text-4xl animate-bounce">🌸</div>
        </div>
      }
    >
      <ParentDashboardContent />
    </Suspense>
  )
}
