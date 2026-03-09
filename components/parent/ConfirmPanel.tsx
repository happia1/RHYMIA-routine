/**
 * 부모용 미션 승인/거절 패널
 * 비개발자: 아이가 "완료했어요!"를 누르면 이 패널이 화면 하단에 올라와서, 부모가 ✅ 승인 또는 ❌ 거절을 할 수 있습니다.
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useKidRoutineStore, selectRoutines } from '@/lib/stores/kidRoutineStore'
import { CheckCircle2, XCircle } from 'lucide-react'
import { RoutineItemIcon } from '@/components/kid/RoutineItemIcon'

export function ConfirmPanel() {
  const pendingConfirmItems = useKidRoutineStore((s) => s.pendingConfirmItems)
  const routines = useKidRoutineStore(selectRoutines)
  const parentApprove = useKidRoutineStore((s) => s.parentApprove)
  const parentReject = useKidRoutineStore((s) => s.parentReject)
  const activeRoutineId = useKidRoutineStore((s) => s.activeRoutineId)

  // 현재 루틴에서 "승인 대기 중"인 항목만 필터
  const routine = routines.find((r) => r.id === activeRoutineId)
  const pendingItemDetails = routine?.items.filter((item) => pendingConfirmItems.includes(item.id)) ?? []

  if (pendingItemDetails.length === 0) return null

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl p-6"
    >
      {/* 위쪽 드래그 핸들 (시각적 구분) */}
      <div className="w-10 h-1.5 bg-gray-200 rounded-full mx-auto mb-5" />

      <h2 className="text-xl font-black text-gray-700 mb-1">
        👋 자녀가 미션 완료를 요청했어요!
      </h2>
      <p className="text-gray-400 text-sm mb-5">실제로 했는지 확인해주세요 ✅</p>

      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {pendingItemDetails.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              className="flex items-center gap-4 bg-[#FFF9F0] rounded-2xl p-4"
            >
              <RoutineItemIcon item={item} className="w-12 h-12 text-3xl" imageClassName="w-12 h-12 object-contain" />
              <div className="flex-1">
                <p className="font-bold text-gray-700">{item.label}</p>
                <p className="text-xs text-gray-400">{item.ttsText}</p>
              </div>
              <div className="flex gap-2">
                {/* 승인 버튼 (초록) → 아이 화면에서 카드 "펑" 사라짐 */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => parentApprove(item.id)}
                  className="w-12 h-12 bg-[#A8E6CF] rounded-2xl flex items-center justify-center"
                >
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </motion.button>
                {/* 거절 버튼 (빨강) → 아이 화면 원상복귀, 다시 해야 함 */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => parentReject(item.id)}
                  className="w-12 h-12 bg-[#FFB3B3] rounded-2xl flex items-center justify-center"
                >
                  <XCircle className="w-6 h-6 text-white" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
