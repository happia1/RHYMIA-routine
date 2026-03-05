'use client';

/**
 * 앱 루트 홈: 프로필 선택 화면
 * 프로필 카드 탭 시 kid/[id] 또는 personal/[id]로 이동.
 * 프로필 없으면 /onboarding으로 리다이렉트.
 * ⚙️ 3초 길게 누르면 PIN 입력 → /parent/dashboard
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useProfileStore } from '@/lib/stores/profileStore';
import { isKidProfile, isPersonalProfile } from '@/types/profile';
import RimiCharacter from '@/components/shared/RimiCharacter';

const LONG_PRESS_MS = 3000;

/** 캐릭터 이모지 매핑 */
const CHARACTER_EMOJI: Record<string, string> = {
  penguin: '🐧',
  dog: '🐶',
  cat: '🐱',
  rabbit: '🐰',
  hamster: '🐹',
  sunflower: '🌻',
};

export default function HomePage() {
  const router = useRouter();
  const profiles = useProfileStore((s) => s.profiles);
  const [pinModal, setPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [pressProgress, setPressProgress] = useState(0);

  // 프로필 없으면 온보딩으로
  useEffect(() => {
    if (profiles.length === 0) {
      router.replace('/onboarding');
    }
  }, [profiles.length, router]);

  const longPressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const longPressStart = useRef<number>(0);

  const clearLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearInterval(longPressTimer.current);
      longPressTimer.current = null;
    }
    setPressProgress(0);
  }, []);

  const handleLongPressStart = useCallback(() => {
    clearLongPress();
    longPressStart.current = Date.now();
    longPressTimer.current = setInterval(() => {
      const elapsed = Date.now() - longPressStart.current;
      setPressProgress(Math.min((elapsed / LONG_PRESS_MS) * 100, 100));
      if (elapsed >= LONG_PRESS_MS) {
        clearLongPress();
        setPinModal(true);
      }
    }, 50);
  }, [clearLongPress]);

  const handleLongPressEnd = useCallback(() => {
    clearLongPress();
  }, [clearLongPress]);

  useEffect(() => {
    return () => clearLongPress();
  }, [clearLongPress]);

  const handlePinSubmit = useCallback(() => {
    const kid = profiles.find((p) => isKidProfile(p) && p.pin === pinInput);
    if (kid) {
      setPinError(false);
      setPinModal(false);
      setPinInput('');
      router.push('/parent/dashboard');
    } else {
      setPinError(true);
    }
  }, [profiles, pinInput, router]);

  if (profiles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-teal-50 flex items-center justify-center">
        <p className="text-gray-500">이동 중...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-pink-100 via-white to-teal-100 pb-24"
      style={{ fontFamily: "'Nanum Gothic', sans-serif" }}
    >
      {/* 상단: 로고 + 리미 */}
      <header className="pt-8 pb-6 px-4 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          RIMI <span aria-hidden>🐧</span>
        </h1>
        <div className="mt-2">
          <RimiCharacter size="sm" mood="waving" />
        </div>
      </header>

      {/* 프로필 카드 그리드 */}
      <main className="px-4 max-w-md mx-auto">
        <div className="grid grid-cols-2 gap-4">
          {profiles.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link href={isKidProfile(p) ? `/kid/${p.id}` : `/personal/${p.id}`}>
                <motion.article
                  whileTap={{ scale: 0.97 }}
                  className="rounded-2xl border-2 border-white bg-white/90 shadow-lg p-5 flex flex-col items-center text-center min-h-[120px] justify-center"
                  style={{
                    boxShadow: '0 4px 14px rgba(255,143,171,0.2)',
                  }}
                >
                  <span className="text-4xl mb-2">
                    {isKidProfile(p)
                      ? CHARACTER_EMOJI[p.character] ?? '👶'
                      : '🙋'}
                  </span>
                  <p className="font-bold text-gray-800 text-lg">{p.name}</p>
                  <span
                    className={`mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                      isKidProfile(p)
                        ? 'bg-pink-100 text-pink-700'
                        : 'bg-teal-100 text-teal-700'
                    }`}
                  >
                    {isKidProfile(p) ? '어린이' : '나의 루틴'}
                  </span>
                </motion.article>
              </Link>
            </motion.div>
          ))}

          {/* + 프로필 추가 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: profiles.length * 0.08 }}
          >
            <Link href="/onboarding">
              <motion.article
                whileTap={{ scale: 0.97 }}
                className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/80 p-5 flex flex-col items-center justify-center min-h-[120px] text-gray-500"
              >
                <span className="text-3xl mb-2">+</span>
                <p className="font-medium">프로필 추가</p>
              </motion.article>
            </Link>
          </motion.div>
        </div>
      </main>

      {/* 하단: ⚙️ 길게 누르기 */}
      <footer className="fixed bottom-6 left-0 right-0 flex justify-center">
        <div className="relative">
          <button
            type="button"
            onMouseDown={handleLongPressStart}
            onMouseUp={handleLongPressEnd}
            onMouseLeave={handleLongPressEnd}
            onTouchStart={handleLongPressStart}
            onTouchEnd={handleLongPressEnd}
            onTouchCancel={handleLongPressEnd}
            className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-2xl active:bg-gray-300"
            aria-label="설정 (3초 길게 누르면 부모 대시보드)"
          >
            ⚙️
          </button>
          {pressProgress > 0 && pressProgress < 100 && (
            <div
              className="absolute inset-0 rounded-full bg-pink-200 opacity-50"
              style={{ clipPath: `inset(0 ${100 - pressProgress}% 0 0)` }}
            />
          )}
        </div>
      </footer>

      {/* PIN 입력 모달 */}
      {pinModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setPinModal(false);
            setPinInput('');
            setPinError(false);
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-2">부모 PIN</h2>
            <p className="text-sm text-gray-500 mb-4">4자리 비밀번호를 입력하세요</p>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4));
                setPinError(false);
              }}
              className="w-full border-2 rounded-xl p-3 text-center text-xl tracking-widest focus:border-pink-400 outline-none"
              placeholder="····"
              autoFocus
            />
            {pinError && (
              <p className="text-red-500 text-sm mt-2">PIN이 올바르지 않아요.</p>
            )}
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setPinModal(false);
                  setPinInput('');
                  setPinError(false);
                }}
                className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-600"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handlePinSubmit}
                className="flex-1 py-2 rounded-xl bg-pink-500 text-white font-medium"
              >
                확인
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
