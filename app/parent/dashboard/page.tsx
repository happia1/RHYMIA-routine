'use client';

/**
 * 부모 대시보드 (PIN 인증 후 진입)
 * 자녀 프로필 탭, 선택된 아이 현황, 칭찬 스티커, 루틴 편집, 주간 리포트, 설정
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useProfileStore } from '@/lib/stores/profileStore';
import { useKidRoutineForProfile } from '@/lib/stores/kidRoutineStore';
import { isKidProfile } from '@/types/profile';
import { getRoutineByTab, type RoutineTabType } from '@/lib/utils/routineData';
import StickerPicker from '@/components/parent/StickerPicker';
import type { StickerType } from '@/types/routine';

const CHARACTER_EMOJI: Record<string, string> = {
  penguin: '🐧',
  dog: '🐶',
  cat: '🐱',
  rabbit: '🐰',
  hamster: '🐹',
  sunflower: '🌻',
};

export default function ParentDashboardPage() {
  const profiles = useProfileStore((s) => s.profiles);
  const kidProfiles = useMemo(() => profiles.filter(isKidProfile), [profiles]);
  const [selectedKidId, setSelectedKidId] = useState<string | null>(
    () => kidProfiles[0]?.id ?? null
  );
  const [showStickerPicker, setShowStickerPicker] = useState(false);

  const selectedProfile = useMemo(
    () => (selectedKidId ? kidProfiles.find((p) => p.id === selectedKidId) : null),
    [selectedKidId, kidProfiles]
  );

  const {
    routines,
    completedItemIds,
    points,
    companion,
    fullyCompletedToday,
  } = useKidRoutineForProfile(selectedKidId ?? undefined);

  const morningItems = useMemo(() => getRoutineByTab('morning'), []);
  const eveningItems = useMemo(() => getRoutineByTab('evening'), []);
  const weekendItems = useMemo(() => getRoutineByTab('weekend'), []);

  const completedMorning = completedItemIds.morning ?? [];
  const completedEvening = completedItemIds.evening ?? [];
  const completedWeekend = completedItemIds.weekend ?? [];
  const day = new Date().getDay();
  const isWeekend = day === 0 || day === 6;
  const currentTab: RoutineTabType = isWeekend ? 'weekend' : 'morning';
  const currentItems = isWeekend ? weekendItems : morningItems;
  const completedCurrent = isWeekend ? completedWeekend : completedMorning;
  const totalCount = currentItems.length;
  const completedCount = completedCurrent.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleStickerSend = (stickerType: StickerType, message: string) => {
    // TODO: 실제 스티커 전송 로직 (자녀에게 푸시 등)
    setShowStickerPicker(false);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-pink-50 to-blue-50 pb-24"
      style={{ fontFamily: "'Nanum Gothic', sans-serif" }}
    >
      {/* 상단: 제목 + 로그아웃 */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-pink-100 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">부모 대시보드 👨‍👩‍👧</h1>
        <Link
          href="/"
          className="px-3 py-2 rounded-xl border-2 border-gray-200 text-gray-600 font-medium"
        >
          ← 로그아웃
        </Link>
      </header>

      {/* 자녀 프로필 탭 */}
      {kidProfiles.length > 0 && (
        <div className="flex gap-2 p-4 overflow-x-auto">
          {kidProfiles.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedKidId(p.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl border-2 flex items-center gap-2 ${
                selectedKidId === p.id ? 'border-pink-400 bg-pink-50' : 'border-gray-200'
              }`}
            >
              <span className="text-xl">{CHARACTER_EMOJI[p.character ?? 'penguin'] ?? '👶'}</span>
              <span className="font-medium">{p.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* 선택된 아이 현황 카드 */}
      {selectedProfile && (
        <motion.section
          key={selectedProfile.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-4 p-4 rounded-2xl bg-white border-2 border-pink-100 shadow-sm"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-3">{selectedProfile.name} 현황</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">오늘 완료율</p>
              <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-teal-400"
                  initial={false}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {completedCount}/{totalCount} (오늘: {isWeekend ? '주말' : '아침'} 루틴)
              </p>
            </div>
            <div className="flex gap-4">
              <p className="text-sm">
                <span className="text-gray-500">스트릭 </span>
                <span className="font-bold text-pink-600">🔥 {points.streakDays}일</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-500">행복도 </span>
                <span className="font-bold">{companion?.happiness ?? 0}%</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-500">포인트 </span>
                <span className="font-bold">⭐ {points.totalPoints}P</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">항목별 완료</p>
              <ul className="space-y-1 text-sm">
                {currentItems.slice(0, 8).map((item) => (
                  <li key={item.id} className="flex items-center gap-2">
                    {completedCurrent.includes(item.id) ? (
                      <span className="text-green-500">✓</span>
                    ) : (
                      <span className="text-gray-300">○</span>
                    )}
                    <span className={completedCurrent.includes(item.id) ? 'text-gray-700' : 'text-gray-400'}>
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>
      )}

      {/* 기능 버튼 */}
      <div className="px-4 space-y-2 max-w-md mx-auto">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowStickerPicker(true)}
          className="w-full py-4 rounded-xl border-2 border-pink-200 bg-white flex items-center gap-3 px-4"
        >
          <span className="text-2xl">🌟</span>
          <span className="font-medium">칭찬 스티커 주기</span>
        </motion.button>
        <Link href={selectedKidId ? `/parent/edit/${selectedKidId}` : '#'}>
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-xl border-2 border-gray-200 bg-white flex items-center gap-3 px-4"
          >
            <span className="text-2xl">✏️</span>
            <span className="font-medium">루틴 편집</span>
          </motion.div>
        </Link>
        <div className="w-full py-4 rounded-xl border-2 border-gray-200 bg-white flex items-center gap-3 px-4 opacity-90">
          <span className="text-2xl">📊</span>
          <span className="font-medium">주간 리포트 (완료율 차트)</span>
        </div>
      </div>

      {/* 하단: 설정, 자녀 추가 */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white to-transparent flex justify-center gap-4">
        <span className="text-gray-500 text-sm">⚙️ 앱 설정</span>
        <Link href="/onboarding" className="text-pink-600 font-medium text-sm">
          👶 자녀 프로필 추가
        </Link>
      </footer>

      {/* 스티커 피커 모달 */}
      {showStickerPicker && (
        <StickerPicker
          onSend={handleStickerSend}
          onClose={() => setShowStickerPicker(false)}
        />
      )}
    </div>
  );
}
