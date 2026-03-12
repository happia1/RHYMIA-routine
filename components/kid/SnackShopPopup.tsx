/**
 * 간식 상점 슬라이딩 팝업
 * 비개발자: 상점 아이콘을 누르면 화면 아래에서 올라오는 팝업으로, 코인으로 간식을 고를 수 있습니다.
 * 각 간식은 필요한 코인 개수가 표시되며, 구매 시 코인이 차감됩니다.
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'

/** 간식 한 종류: 이름, 필요 코인, 아이콘(선택) */
export interface SnackItem {
  id: string
  name: string
  coins: number
  emoji?: string
}

/** 기본 간식 목록 (초코렛, 츄잉캔디, 푸딩젤리, 초코우유, 조각케이크) */
export const DEFAULT_SNACKS: SnackItem[] = [
  { id: 'chocolate', name: '초코렛', coins: 100, emoji: '🍫' },
  { id: 'chewing', name: '츄잉캔디', coins: 150, emoji: '🍬' },
  { id: 'pudding', name: '푸딩젤리', coins: 300, emoji: '🍮' },
  { id: 'chocomilk', name: '초코우유', coins: 500, emoji: '🥛' },
  { id: 'cake', name: '조각케이크', coins: 1000, emoji: '🍰' },
]

export interface SnackShopPopupProps {
  /** 팝업 열림 여부 */
  isOpen: boolean
  /** 닫기 콜백 */
  onClose: () => void
  /** 현재 보유 코인 */
  currentCoins: number
  /** 구매 시 호출 (필요 코인만큼 차감, 성공 시 true) */
  onPurchase: (coinsRequired: number) => boolean
  /** 표시할 간식 목록 (없으면 기본 목록) */
  snacks?: SnackItem[]
}

export function SnackShopPopup({
  isOpen,
  onClose,
  currentCoins,
  onPurchase,
  snacks = DEFAULT_SNACKS,
}: SnackShopPopupProps) {
  const handleBuy = (coinsRequired: number) => {
    if (currentCoins < coinsRequired) return
    const ok = onPurchase(coinsRequired)
    if (ok) {
      // 구매 성공 시 짧은 피드백 후 유지 (여러 개 살 수 있음)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 딤드: 클릭 시 닫기 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* 아래에서 올라오는 슬라이딩 패널 */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed left-0 right-0 bottom-0 z-50 rounded-t-3xl bg-[#FFF9F0] shadow-2xl border-t border-amber-100 max-h-[70vh] flex flex-col"
            role="dialog"
            aria-label="간식 상점"
          >
            {/* 상단 손잡이 + 제목 */}
            <div className="flex-shrink-0 pt-3 pb-2 px-4">
              <div className="w-10 h-1 rounded-full bg-amber-200 mx-auto mb-3" aria-hidden="true" />
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-amber-800">간식 상점</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-amber-600 font-bold text-sm px-3 py-1 rounded-lg hover:bg-amber-100"
                >
                  닫기
                </button>
              </div>
            </div>

            {/* 간식 목록: 세로로 긴 카드가 가로로 슬라이드되는 영역 */}
            <div className="flex-1 px-4 pb-6 overflow-x-auto overflow-y-hidden">
              <div className="flex gap-4 pb-2">
                {snacks.map((snack) => {
                  const canBuy = currentCoins >= snack.coins
                  return (
                    <div
                      key={snack.id}
                      className="flex-shrink-0 w-[170px] h-[230px] rounded-3xl bg-white border border-amber-100 shadow-sm flex flex-col justify-between items-center px-4 py-4 text-center"
                    >
                      {/* 카드 상단: 아이콘 + 이름 (중앙 정렬) */}
                      <div className="flex flex-col items-center gap-2">
                        {snack.emoji && (
                          <span className="text-6xl leading-none" aria-hidden="true">
                            {snack.emoji}
                          </span>
                        )}
                        <span className="font-extrabold text-base text-gray-900">{snack.name}</span>
                      </div>

                      {/* 카드 하단: 가격 + 구매 버튼 (중앙 정렬) */}
                      <div className="mt-4 flex flex-col items-center gap-2 w-full">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-lg text-amber-700 font-black tabular-nums">
                            {snack.coins}
                          </span>
                          <span className="text-amber-600 text-xs font-bold">코인</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleBuy(snack.coins)}
                          disabled={!canBuy}
                          className={`w-full mt-1 py-2.5 rounded-2xl font-bold text-sm transition-colors ${
                            canBuy
                              ? 'bg-amber-500 text-white hover:bg-amber-600 active:scale-95'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {canBuy ? '구매' : '부족'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
