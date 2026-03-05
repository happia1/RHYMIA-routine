'use client';

/**
 * 루틴 홈 진입점 (app/routine/page.tsx)
 * 리미 루틴 앱의 메인 화면입니다. 리미 캐릭터와 함께 세 가지 모드(어린이/부모/나의 루틴)를 선택할 수 있습니다.
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import RimiCharacter from '@/components/shared/RimiCharacter';

/** 카드 한 개 정의 */
const MODE_CARDS = [
  {
    title: '어린이 루틴',
    emoji: '🌟',
    href: '/routine/kid',
    gradient: 'from-pink-400 to-rose-500',
    delay: 0.2,
  },
  {
    title: '부모 확인',
    emoji: '💝',
    href: '/routine/parent',
    gradient: 'from-purple-500 to-violet-600',
    delay: 0.35,
  },
  {
    title: '나의 루틴',
    emoji: '✨',
    href: '/routine/personal',
    gradient: 'from-teal-400 to-cyan-500',
    delay: 0.5,
  },
] as const;

export default function RoutineHomePage() {
  return (
    <main
      className="min-h-screen bg-gradient-to-b from-[#FF8FAB]/20 via-white to-[#A8E6CF]/30 flex flex-col items-center py-8 px-4"
      style={{
        background: 'linear-gradient(to bottom, rgba(255,143,171,0.2), #fff, rgba(168,230,207,0.3))',
      }}
    >
      {/* 상단 제목 */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-2xl md:text-3xl font-bold text-gray-800 mb-2"
      >
        루틴 with 리미 🐧
      </motion.h1>

      {/* 리미 캐릭터 + 말풍선 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="my-6"
      >
        <RimiCharacter
          mood="waving"
          size="xl"
          message="안녕! 나는 리미야 🐧 오늘도 함께하자!"
          className=""
        />
      </motion.div>

      {/* 3개 모드 선택 카드 - 순차 등장 */}
      <div className="w-full max-w-md space-y-4 mt-4">
        {MODE_CARDS.map((card) => (
          <motion.div
            key={card.href}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: card.delay }}
          >
            <Link href={card.href}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  w-full py-5 px-6 rounded-2xl shadow-lg text-white font-bold text-lg
                  bg-gradient-to-r ${card.gradient}
                  flex items-center justify-center gap-3
                `}
              >
                <span className="text-2xl">{card.emoji}</span>
                <span>{card.title} {card.emoji}</span>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
