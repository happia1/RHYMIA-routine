'use client';

/**
 * 아이 루틴 화면 (프로필별)
 * useParams()로 id → useProfileStore에서 프로필 조회, useKidRoutineForProfile(id)로 상태 사용
 */

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfileStore } from '@/lib/stores/profileStore';
import { useKidRoutineForProfile } from '@/lib/stores/kidRoutineStore';
import { isKidProfile } from '@/types/profile';
import {
  getRoutineByTab,
  getRoutineTemplatesForStore,
  type RoutineTabType,
} from '@/lib/utils/routineData';
import RimiCharacter from '@/components/shared/RimiCharacter';
import RoutineCardImage from '@/components/kid/RoutineCardImage';
import type { VirtualCompanion } from '@/types/routine';

const CHARACTER_EMOJI: Record<string, string> = {
  penguin: '🐧',
  dog: '🐶',
  cat: '🐱',
  rabbit: '🐰',
  hamster: '🐹',
  sunflower: '🌻',
};

const TABS: { key: RoutineTabType; label: string; emoji: string }[] = [
  { key: 'morning', label: '아침', emoji: '🌅' },
  { key: 'evening', label: '저녁', emoji: '🌙' },
  { key: 'weekend', label: '주말', emoji: '🎉' },
];

function getDefaultTab(): RoutineTabType {
  const day = new Date().getDay();
  if (day === 0 || day === 6) return 'weekend';
  return 'morning';
}

/** 프로필 캐릭터로 기본 VirtualCompanion 생성 (펭귄=리미는 species를 dog로 저장, 나머지는 그대로) */
function createDefaultCompanion(profileId: string, character: string, name: string): VirtualCompanion {
  const isPlant = character === 'sunflower';
  const species: VirtualCompanion['species'] = isPlant
    ? 'sunflower'
    : character === 'penguin'
      ? 'dog'
      : (character as VirtualCompanion['species']);
  return {
    id: `companion-${profileId}`,
    userId: profileId,
    type: isPlant ? 'plant' : 'pet',
    species,
    name,
    growthStage: 1,
    happiness: 80,
    hunger: 80,
    affection: 50,
    totalExp: 0,
    lastUpdated: new Date().toISOString(),
  };
}

export default function KidRoutineByIdPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === 'string' ? params.id : undefined;
  const profile = useProfileStore((s) => (id ? s.getProfile(id) : undefined));
  const {
    routines,
    setRoutines,
    completedItemIds,
    fullyCompletedToday,
    points,
    companion,
    setCompanion,
    completeItem,
  } = useKidRoutineForProfile(id);

  const [activeTab, setActiveTab] = useState<RoutineTabType>(() => getDefaultTab());
  const [showReward, setShowReward] = useState(false);

  useEffect(() => {
    if (!id || !profile) {
      router.replace('/');
      return;
    }
    if (!isKidProfile(profile)) {
      router.replace('/');
    }
  }, [id, profile, router]);

  useEffect(() => {
    if (!id || !profile || !isKidProfile(profile)) return;
    if (routines.length === 0) {
      setRoutines(getRoutineTemplatesForStore(id));
    }
    if (!companion && profile.character) {
      setCompanion(createDefaultCompanion(id, profile.character, profile.name));
    }
  }, [id, profile, routines.length, companion, setRoutines, setCompanion]);

  const currentItems = useMemo(() => getRoutineByTab(activeTab), [activeTab]);
  const routineId = activeTab;
  const completedIds = completedItemIds[routineId] ?? [];
  const totalCount = currentItems.length;
  const completedCount = completedIds.length;
  const isFullyDone = fullyCompletedToday[routineId] ?? false;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  useEffect(() => {
    if (isFullyDone && !showReward) {
      const t = setTimeout(() => setShowReward(true), 600);
      return () => clearTimeout(t);
    }
  }, [isFullyDone, showReward]);

  const handleCompleteItem = (itemId: string) => {
    completeItem(routineId, itemId);
  };

  if (!id || !profile || !isKidProfile(profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">이동 중...</p>
      </div>
    );
  }

  const isRimi = profile.character === 'penguin';

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-pink-50 to-blue-50 pb-24"
      style={{ fontFamily: "'Nanum Gothic', sans-serif" }}
    >
      {/* 상단: [이름]의 루틴 + 포인트 */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-pink-100 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-gray-500 text-lg">←</Link>
        <h1 className="text-lg font-bold text-gray-800">{profile.name}의 루틴</h1>
        <div className="flex items-center gap-1 w-16 justify-end">
          <span className="text-xl">⭐</span>
          <span className="font-bold text-gray-800 tabular-nums">{points.totalPoints}P</span>
        </div>
      </header>

      {/* 캐릭터 상태바: 리미면 RimiCharacter, 아니면 이모지 + 이름 + 바 */}
      <section className="px-4 py-3 border-b border-pink-100/80">
        <div className="flex items-center gap-3">
          {isRimi ? (
            <RimiCharacter size="sm" message="오늘도 화이팅!" className="flex-shrink-0" />
          ) : (
            <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center text-4xl bg-white rounded-2xl border-2 border-pink-100">
              {CHARACTER_EMOJI[profile.character ?? 'penguin'] ?? '🐧'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-800">{profile.name}</p>
            <div className="space-y-2 mt-1">
              <div>
                <p className="text-xs text-gray-500">행복도</p>
                <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-pink-400"
                    initial={false}
                    animate={{ width: `${companion?.happiness ?? 0}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>
              <div>
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
            </div>
          </div>
        </div>
      </section>

      {/* 루틴 타입 탭 */}
      <div className="flex rounded-full bg-gray-100 p-1 gap-0.5 mx-4 mt-3">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.key ? 'bg-white shadow text-pink-600' : 'text-gray-500'
            }`}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {/* 루틴 체커보드 */}
      <main className="px-4 py-4">
        <div className="grid grid-cols-4 gap-3 max-w-lg mx-auto">
          {currentItems.map((item) => (
            <RoutineCardImage
              key={item.id}
              item={item}
              isCompleted={completedIds.includes(item.id)}
              onComplete={handleCompleteItem}
            />
          ))}
        </div>
      </main>

      {/* 하단 완료 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white to-transparent">
        <motion.button
          type="button"
          onClick={() => setShowReward(true)}
          disabled={!isFullyDone}
          className={`w-full max-w-md mx-auto py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 ${
            isFullyDone
              ? 'bg-gradient-to-r from-pink-400 to-orange-400 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          whileTap={isFullyDone ? { scale: 0.98 } : {}}
        >
          오늘 루틴 완료! 🎉
        </motion.button>
      </div>

      {/* 보상 모달 */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gradient-to-b from-amber-50 to-pink-50 flex flex-col items-center justify-center p-6"
          >
            {isRimi ? (
              <RimiCharacter mood="excited" size="xl" message="완료 대단해요!" />
            ) : (
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                className="text-8xl"
              >
                {CHARACTER_EMOJI[profile.character ?? 'penguin'] ?? '🎉'}
              </motion.span>
            )}
            <motion.p
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-2xl font-bold text-gray-800"
            >
              🎉 오늘 루틴 완료! +50P
            </motion.p>
            <p className="text-gray-600 mt-2">오늘도 루틴을 잘 지켰어요.</p>
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowReward(false)}
              className="mt-8 px-8 py-3 rounded-2xl bg-pink-400 text-white font-bold shadow-lg"
            >
              돌아가기 🏠
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
