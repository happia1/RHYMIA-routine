'use client';

/**
 * 부모 대시보드 (app/routine/parent/page.tsx)
 * 부모가 자녀 루틴 완료 현황을 보고, 칭찬 스티커를 보낼 수 있는 화면입니다.
 */

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import RimiCharacter from '@/components/shared/RimiCharacter';
import StickerPicker from '@/components/parent/StickerPicker';
import type { StickerType } from '@/types/routine';
import { STICKER_META } from '@/types/routine';

/** 아침 루틴 항목 mock */
const MOCK_MORNING_ITEMS = [
  { id: '1', emoji: '🦷', label: '양치하기', done: true },
  { id: '2', emoji: '🧼', label: '손 씻기', done: true },
  { id: '3', emoji: '👕', label: '옷 입기', done: true },
  { id: '4', emoji: '🍳', label: '아침 먹기', done: true },
  { id: '5', emoji: '📚', label: '가방 챙기기', done: true },
  { id: '6', emoji: '👟', label: '신발 신기', done: false },
  { id: '7', emoji: '🎒', label: '출발 준비', done: false },
];

/** 최근 받은 스티커 mock */
const MOCK_RECENT_STICKERS: StickerType[] = ['star', 'heart', 'sparkle'];

export default function ParentDashboardPage() {
  const [showStickerPicker, setShowStickerPicker] = useState(false);

  const completedCount = MOCK_MORNING_ITEMS.filter((i) => i.done).length;
  const totalCount = MOCK_MORNING_ITEMS.length;
  const progressPercent = totalCount ? (completedCount / totalCount) * 100 : 0;

  const handleSendSticker = (stickerType: StickerType, message: string) => {
    console.log('스티커 보냄:', stickerType, message);
    setShowStickerPicker(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50/80 via-white to-pink-50/50 pb-24">
      {/* 상단: 뒤로가기 + 제목 */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3 flex items-center gap-3"
      >
        <Link
          href="/routine"
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
          aria-label="뒤로 가기"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-gray-800 flex-1">부모 대시보드</h1>
      </motion.header>

      <div className="p-4 space-y-5 max-w-lg mx-auto">
        {/* 오늘 현황 카드 */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-5"
        >
          <h2 className="text-sm font-medium text-gray-500 mb-1">오늘 현황</h2>
          <p className="text-xl font-bold text-gray-800 mb-3">
            <span className="text-[#FF8FAB]">하늘</span>이의 루틴
          </p>
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>완료 {completedCount}/{totalCount}개</span>
            <span>🔥 스트릭 {4}일</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="h-full rounded-full bg-gradient-to-r from-[#FF8FAB] to-[#A8E6CF]"
            />
          </div>
        </motion.section>

        {/* 루틴 상세 카드 */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-5"
        >
          <h2 className="text-sm font-medium text-gray-500 mb-3">아침 루틴</h2>
          <ul className="space-y-2">
            {MOCK_MORNING_ITEMS.map((item, i) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className="flex items-center gap-3 py-2"
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className={`flex-1 ${item.done ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                  {item.label}
                </span>
                {item.done ? (
                  <span className="text-green-500 text-sm font-medium">완료</span>
                ) : (
                  <span className="text-gray-400 text-sm">미완료</span>
                )}
              </motion.li>
            ))}
          </ul>
        </motion.section>

        {/* 최근 받은 스티커 카드 */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-5"
        >
          <h2 className="text-sm font-medium text-gray-500 mb-3">최근 받은 스티커</h2>
          <div className="flex gap-3 flex-wrap">
            {MOCK_RECENT_STICKERS.map((type) => (
              <span key={type} className="text-3xl" title={STICKER_META[type].label}>
                {STICKER_META[type].emoji}
              </span>
            ))}
          </div>
        </motion.section>

        {/* 리미 캐릭터 (작게) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center py-4"
        >
          <RimiCharacter mood="proud" size="sm" message="오늘도 잘 하고 있어요!" />
        </motion.div>
      </div>

      {/* 하단 고정 버튼: 칭찬 스티커 주기 */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur border-t border-gray-100"
      >
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowStickerPicker(true)}
          className="w-full max-w-lg mx-auto flex py-4 rounded-2xl bg-gradient-to-r from-[#FF8FAB] to-rose-400 text-white font-bold text-lg shadow-lg justify-center items-center gap-2"
        >
          칭찬 스티커 주기 🎁
        </motion.button>
      </motion.footer>

      {/* 스티커 선택 모달 */}
      <AnimatePresence>
        {showStickerPicker && (
          <StickerPicker
            onSend={handleSendSticker}
            onClose={() => setShowStickerPicker(false)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
