'use client';

/**
 * RimiCharacter.tsx
 * RHYMIA 루틴 앱의 마스코트 '리미' 펭귄 캐릭터를 SVG로 그린 공유 컴포넌트입니다.
 * mood에 따라 눈 모양과 애니메이션이 바뀌고, 말풍선으로 메시지를 띄울 수 있습니다.
 */

import { motion } from 'framer-motion';

/** 리미의 기분 타입: happy=기본, excited=별눈, sleepy=선눈, proud=뿌듯, waving=손흔들기 */
export type RimiMood = 'happy' | 'excited' | 'sleepy' | 'proud' | 'waving';

/** 리미 크기 (sm ~ xl) */
export type RimiSize = 'sm' | 'md' | 'lg' | 'xl';

export interface RimiCharacterProps {
  /** 기분에 따라 눈 모양·애니메이션이 달라짐 */
  mood?: RimiMood;
  /** 캐릭터 크기 */
  size?: RimiSize;
  /** 말풍선에 표시할 텍스트 (없으면 말풍선 미표시) */
  message?: string;
  /** 추가 CSS 클래스 */
  className?: string;
}

/** size에 따른 픽셀 너비 */
const SIZE_MAP: Record<RimiSize, number> = {
  sm: 80,
  md: 120,
  lg: 160,
  xl: 200,
};

/** mood에 따른 메인 애니메이션: 둥실둥실(floating) vs 흔들림(wiggle) */
function getMotionVariant(mood: RimiMood) {
  switch (mood) {
    case 'excited':
    case 'waving':
      return {
        y: [0, -8, 0],
        rotate: [0, -3, 3, 0],
        transition: { repeat: Infinity, duration: 1.2, ease: 'easeInOut' },
      };
    case 'sleepy':
      return {
        y: [0, -4, 0],
        transition: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' },
      };
    case 'proud':
    case 'happy':
    default:
      return {
        y: [0, -6, 0],
        transition: { repeat: Infinity, duration: 1.8, ease: 'easeInOut' },
      };
  }
}

/** RHYMIA 브랜드 색상 */
const COLORS = {
  pink: '#FF8FAB',   // 볼터치, 강조
  mint: '#A8E6CF',   // 목도리
  orange: '#FF9F43', // 부리
  black: '#2D3436',  // 몸통
  white: '#FFFFFF',  // 배
} as const;

export default function RimiCharacter({
  mood = 'happy',
  size = 'md',
  message,
  className = '',
}: RimiCharacterProps) {
  const width = SIZE_MAP[size];

  /** excited면 별눈(★), sleepy면 선눈(─), 나머지는 동그란 눈 */
  const isStarEyes = mood === 'excited';
  const isSleepyEyes = mood === 'sleepy';
  const isWaving = mood === 'waving';

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* 말풍선: message가 있을 때만 표시 */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 px-4 py-2 rounded-2xl bg-white/95 shadow-lg border-2 border-gray-100 text-gray-800 text-center max-w-[260px] relative"
          style={{ borderColor: COLORS.mint }}
        >
          <span className="text-sm md:text-base leading-relaxed">{message}</span>
          {/* 말풍선 꼬리 */}
          <div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px]"
            style={{ borderTopColor: COLORS.mint }}
          />
        </motion.div>
      )}

      {/* 펭귄 SVG + framer-motion으로 mood에 따라 둥실/흔들림 */}
      <motion.div
        animate={getMotionVariant(mood)}
        style={{ width, height: width * 1.1 }}
        className="relative flex items-center justify-center"
      >
        <svg
          viewBox="0 0 120 132"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* 배 (흰색, 몸통보다 먼저 그려서 뒤에 깔림) */}
          <ellipse cx="60" cy="88" rx="32" ry="28" fill={COLORS.white} />
          {/* 몸통 (검정) */}
          <ellipse cx="60" cy="85" rx="34" ry="38" fill={COLORS.black} />
          {/* 배 덮는 흰 영역 (아래만) */}
          <path
            d="M28 72 Q60 95 92 72 L92 120 Q60 100 28 120 Z"
            fill={COLORS.white}
          />

          {/* 목도리 (민트) */}
          <path
            d="M35 62 Q60 78 85 62 L82 72 Q60 85 38 72 Z"
            fill={COLORS.mint}
          />
          {/* 목도리 결 (작은 원) */}
          <circle cx="60" cy="68" r="4" fill="#8DD9B8" />

          {/* 부리 (주황) */}
          <path
            d="M52 52 L60 58 L68 52 L65 56 L60 60 L55 56 Z"
            fill={COLORS.orange}
          />

          {/* 눈: excited=별, sleepy=선, 나머지=동그란 눈 */}
          {isStarEyes ? (
            <>
              <text x="42" y="48" fontSize="14" fill={COLORS.black} textAnchor="middle">★</text>
              <text x="78" y="48" fontSize="14" fill={COLORS.black} textAnchor="middle">★</text>
            </>
          ) : isSleepyEyes ? (
            <>
              <line x1="38" y1="48" x2="48" y2="48" stroke={COLORS.black} strokeWidth="3" strokeLinecap="round" />
              <line x1="72" y1="48" x2="82" y2="48" stroke={COLORS.black} strokeWidth="3" strokeLinecap="round" />
            </>
          ) : (
            <>
              <ellipse cx="45" cy="46" rx="6" ry="7" fill={COLORS.black} />
              <ellipse cx="75" cy="46" rx="6" ry="7" fill={COLORS.black} />
              <ellipse cx="46" cy="44" rx="2" ry="2" fill={COLORS.white} />
              <ellipse cx="76" cy="44" rx="2" ry="2" fill={COLORS.white} />
            </>
          )}

          {/* 볼터치 (핑크) */}
          <ellipse cx="38" cy="62" rx="6" ry="5" fill={COLORS.pink} opacity={0.9} />
          <ellipse cx="82" cy="62" rx="6" ry="5" fill={COLORS.pink} opacity={0.9} />

          {/* waving일 때 날개 대신 팔(손) 흔들기 */}
          {isWaving ? (
            <>
              <path d="M22 70 L12 55 L18 58 L22 70" stroke={COLORS.black} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M98 70 L108 58 L102 55 L98 70" stroke={COLORS.black} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </>
          ) : (
            <>
              <ellipse cx="28" cy="78" rx="10" ry="14" fill={COLORS.black} transform="rotate(-20 28 78)" />
              <ellipse cx="92" cy="78" rx="10" ry="14" fill={COLORS.black} transform="rotate(20 92 78)" />
            </>
          )}
        </svg>
      </motion.div>
    </div>
  );
}
