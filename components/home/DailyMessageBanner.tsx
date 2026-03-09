/**
 * 오늘의 메시지 배너 (요일별 메시지 + 짧은 격려 문구)
 * 비개발자: 홈 상단에서 요일에 따라 다른 한 줄 메시지와 격려 문구를 보여줘요.
 */

'use client'

import { motion } from 'framer-motion'

/** 일(0)~토(6) 순서의 요일별 메시지 */
const DAILY_MESSAGES = [
  '이번 주도 우리 가족 파이팅! 💪', // 일
  '월요일, 새로운 한 주의 시작이에요 🌱', // 월
  '화요일, 어제보다 조금 더 나아가요 ✨', // 화
  '수요일, 절반 왔어요! 잘 하고 있어요 🎯', // 수
  '목요일, 이제 주말이 코앞이에요 🏃', // 목
  '금요일, 오늘도 함께 잘 해봐요 🌟', // 금
  '토요일, 가족과 함께하는 특별한 날 🏡', // 토
]

/** 격려 문구 (요일 인덱스로 순환해서 사용) */
const MOTIVATIONAL = [
  '루틴이 쌓이면 습관이 되고, 습관이 쌓이면 삶이 바뀌어요.',
  '작은 실천이 큰 변화를 만들어요.',
  '오늘 하루도 최선을 다하는 우리 가족 응원해요!',
  '함께라서 더 잘할 수 있어요 🤝',
  '꾸준함이 재능보다 강해요.',
]

export function DailyMessageBanner() {
  const day = new Date().getDay()
  const msg = DAILY_MESSAGES[day]
  const sub = MOTIVATIONAL[day % MOTIVATIONAL.length]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.15 }}
      className="bg-gradient-to-r from-[#FF8FAB] to-[#FFB347] rounded-3xl px-5 py-4 shadow-md"
    >
      <p className="text-white font-black text-base leading-snug">{msg}</p>
      <p className="text-white/70 text-xs mt-1">{sub}</p>
    </motion.div>
  )
}
