'use client';

/**
 * 개인 루틴 화면
 * 시간대 탭(아침/오후/저녁/밤), 체크리스트, 게이미피케이션 ON/OFF에 따른 UI
 */

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useProfileStore } from '@/lib/stores/profileStore';
import {
  usePersonalRoutineForProfile,
  getDefaultPersonalItems,
  type PersonalSlot,
} from '@/lib/stores/personalRoutineByProfileStore';
import { isPersonalProfile } from '@/types/profile';
import type { RoutineItem } from '@/types/routine';
import RimiCharacter from '@/components/shared/RimiCharacter';
import { RoutineItemIcon } from '@/components/kid/RoutineItemIcon';

const SLOTS: { key: PersonalSlot; label: string; emoji: string }[] = [
  { key: 'morning', label: '아침', emoji: '☀️' },
  { key: 'afternoon', label: '오후', emoji: '🌤' },
  { key: 'evening', label: '저녁', emoji: '🌆' },
  { key: 'night', label: '밤', emoji: '🌙' },
];

const CHARACTER_EMOJI: Record<string, string> = {
  penguin: '🐧',
  dog: '🐶',
  cat: '🐱',
  rabbit: '🐰',
  hamster: '🐹',
  sunflower: '🌻',
};

export default function PersonalRoutineByIdPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === 'string' ? params.id : undefined;
  const profile = useProfileStore((s) => (id ? s.getProfile(id) : undefined));
  const {
    itemsBySlot,
    completedItemIds,
    totalPoints,
    streakDays,
    exp,
    setItemsForSlot,
    completeItem,
    uncompleteItem,
    addItem,
    removeItem,
  } = usePersonalRoutineForProfile(id);

  const [activeSlot, setActiveSlot] = useState<PersonalSlot>('morning');
  const [newItemLabel, setNewItemLabel] = useState('');

  // 엄마/아빠 또는 학령기 자녀만 이 화면 사용 (미취학은 /routine/kid)
  const canUsePersonal = profile && (isPersonalProfile(profile) || profile.role === 'child_school');

  useEffect(() => {
    if (!id || !profile) {
      router.replace('/');
      return;
    }
    if (profile.role === 'child_preschool') {
      router.replace('/routine/kid');
      return;
    }
    if (!isPersonalProfile(profile) && profile.role !== 'child_school') {
      router.replace('/');
    }
  }, [id, profile, router]);

  // 목표 기반 기본 루틴 세팅 (최초 1회, 엄마/아빠만)
  useEffect(() => {
    if (!id || !profile || !isPersonalProfile(profile)) return;
    const morningItems = itemsBySlot.morning;
    if (morningItems.length === 0 && (profile.goals?.length ?? 0) > 0) {
      const defaultItems = getDefaultPersonalItems(profile.goals ?? []);
      setItemsForSlot('morning', defaultItems);
    }
  }, [id, profile, itemsBySlot.morning.length, setItemsForSlot]);

  const currentItems = itemsBySlot[activeSlot] ?? [];
  const completedIds = completedItemIds[activeSlot] ?? [];
  const totalCount = currentItems.length;
  const completedCount = completedIds.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleToggle = (itemId: string) => {
    if (completedIds.includes(itemId)) {
      uncompleteItem(activeSlot, itemId);
    } else {
      completeItem(activeSlot, itemId);
    }
  };

  const handleAddItem = () => {
    if (!newItemLabel.trim()) return;
    const item: RoutineItem = {
      id: `item-${Date.now()}`,
      label: newItemLabel.trim(),
      icon: '✅',
      ttsText: newItemLabel.trim(),
      category: 'other',
      order: currentItems.length + 1,
      timerSeconds: 180, // 개인 루틴 추가 항목 기본 3분
    };
    addItem(activeSlot, item);
    setNewItemLabel('');
  };

  if (!id || !profile || !canUsePersonal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">이동 중...</p>
      </div>
    );
  }

  const useGame = profile.useGameification;
  const hasCharacter = useGame && profile.character;

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-teal-50 to-blue-50 pb-24"
      style={{ fontFamily: "'Nanum Gothic', sans-serif" }}
    >
      {/* 상단: [이름]의 루틴, 스트릭, 완료율 */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-teal-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-gray-500 text-lg">←</Link>
          <h1 className="text-lg font-bold text-gray-800">{profile.name}의 루틴</h1>
          <div className="w-20 text-right flex items-center justify-end gap-1">
            <span className="text-sm">🔥 {streakDays}일</span>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex-1">
            <p className="text-xs text-gray-500">오늘 완료율</p>
            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-teal-400"
                initial={false}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-lg font-bold text-teal-700">
            {Math.round(progressPercent)}%
          </div>
        </div>
      </header>

      {/* 게이미피케이션 ON: 캐릭터 + 경험치 바 */}
      {useGame && hasCharacter && (
        <section className="px-4 py-3 border-b border-teal-100/80 flex items-center gap-3">
          {profile.character === 'penguin' ? (
            <RimiCharacter size="sm" message="화이팅!" />
          ) : (
            <div className="text-4xl">{CHARACTER_EMOJI[profile.character ?? 'penguin'] ?? '🐧'}</div>
          )}
          <div className="flex-1">
            <p className="text-xs text-gray-500">경험치</p>
            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-amber-400"
                initial={false}
                animate={{ width: `${Math.min(100, (exp % 100))}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
          <span className="font-bold text-gray-700">{totalPoints}P</span>
        </section>
      )}

      {/* 시간대 탭 */}
      <div className="flex rounded-full bg-gray-100 p-1 gap-0.5 mx-4 mt-3">
        {SLOTS.map((slot) => (
          <button
            key={slot.key}
            type="button"
            onClick={() => setActiveSlot(slot.key)}
            className={`flex-1 py-2 rounded-full text-xs font-medium transition-colors ${
              activeSlot === slot.key ? 'bg-white shadow text-teal-600' : 'text-gray-500'
            }`}
          >
            {slot.emoji} {slot.label}
          </button>
        ))}
      </div>

      {/* 루틴 카드 목록 (체크리스트) */}
      <main className="px-4 py-4">
        <div className="space-y-2 max-w-lg mx-auto">
          {currentItems.map((item) => {
            const isCompleted = completedIds.includes(item.id);
            return (
              <motion.div
                key={item.id}
                layout
                className={`flex items-center gap-3 p-4 rounded-xl border-2 ${
                  isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleToggle(item.id)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isCompleted ? 'bg-green-400 border-green-500' : 'border-gray-300'
                  }`}
                >
                  {isCompleted && <span className="text-white text-sm font-bold">✓</span>}
                </button>
                <span
                  className={`flex-1 font-medium ${
                    isCompleted ? 'text-green-700 line-through' : 'text-gray-800'
                  }`}
                >
                  {item.label}
                </span>
                <RoutineItemIcon item={item} className="w-8 h-8 text-gray-400 text-sm" imageClassName="w-6 h-6 object-contain" />
                <button
                  type="button"
                  onClick={() => removeItem(activeSlot, item.id)}
                  className="text-gray-400 hover:text-red-500 text-lg"
                  aria-label="삭제"
                >
                  ×
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* 항목 추가 */}
        <div className="max-w-lg mx-auto mt-4 flex gap-2">
          <input
            type="text"
            value={newItemLabel}
            onChange={(e) => setNewItemLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            placeholder="새 루틴 추가..."
            className="flex-1 border-2 border-gray-200 rounded-xl p-3 focus:border-teal-400 outline-none"
          />
          <button
            type="button"
            onClick={handleAddItem}
            className="px-4 py-3 rounded-xl bg-teal-400 text-white font-medium"
          >
            추가
          </button>
        </div>
      </main>
    </div>
  );
}
