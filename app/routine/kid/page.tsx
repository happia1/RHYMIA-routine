'use client';

/**
 * 루틴 키드 메인 화면 (체커보드)
 * 상단: 날짜/요일, 아침·저녁·주말 탭, 포인트
 * 리미 상태바 + 오늘 완료율 바
 * 4열 그리드 루틴 카드 → 하단 "오늘 루틴 완료!" 보상 화면
 */

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKidRoutineForProfile } from '@/lib/stores/kidRoutineStore';
import {
  getRoutineByTab,
  getRoutineTemplatesForStore,
  type RoutineTabType,
} from '@/lib/utils/routineData';
import RimiCharacter from '@/components/shared/RimiCharacter';
import RoutineCardImage from '@/components/kid/RoutineCardImage';

const WEEKDAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

const TABS: { key: RoutineTabType; label: string; emoji: string }[] = [
  { key: 'morning', label: '아침', emoji: '🌅' },
  { key: 'evening', label: '저녁', emoji: '🌙' },
  { key: 'weekend', label: '주말', emoji: '🎉' },
];

/** 오늘 요일로 기본 탭 결정: 평일 → 아침, 주말 → 주말 */
function getDefaultTab(): RoutineTabType {
  const day = new Date().getDay();
  if (day === 0 || day === 6) return 'weekend';
  return 'morning';
}

export default function KidRoutinePage() {
  const {
    routines,
    setRoutines,
    completedItemIds,
    fullyCompletedToday,
    points,
    companion,
    completeItem,
  } = useKidRoutineForProfile('kid-default');

  const [activeTab, setActiveTab] = useState<RoutineTabType>(() => getDefaultTab());
  const [showReward, setShowReward] = useState(false);

  // 스토어가 비어 있으면 routineData 기준으로 템플릿 세팅
  useEffect(() => {
    if (routines.length === 0) {
      setRoutines(getRoutineTemplatesForStore('kid-default'));
    }
  }, [routines.length, setRoutines]);

  const currentItems = useMemo(() => getRoutineByTab(activeTab), [activeTab]);
  const routineId = activeTab;
  const completedIds = completedItemIds[routineId] ?? [];
  const totalCount = currentItems.length;
  const completedCount = completedIds.length;
  const isFullyDone = fullyCompletedToday[routineId] ?? false;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // 전체 완료 시 보상 화면 자동 표시 (한 번만)
  useEffect(() => {
    if (isFullyDone && !showReward) {
      const t = setTimeout(() => setShowReward(true), 600);
      return () => clearTimeout(t);
    }
  }, [isFullyDone, showReward]);

  const handleCompleteItem = (itemId: string) => {
    completeItem(routineId, itemId);
    // 스토어에서 마지막 항목 완료 시 completeRoutine() 자동 호출
  };

  const todayStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const week = WEEKDAY_NAMES[d.getDay()];
    return { date: `${y}.${m}.${day}`, week };
  }, []);

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-pink-50 to-blue-50 pb-24"
      style={{ fontFamily: "'Nanum Gothic', sans-serif" }}
    >
      {/* ─── 1. 상단 헤더 ─── */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-pink-100 px-4 py-3 safe-area-inset-top">
        <div className="flex items-center justify-between gap-2">
          <div className="text-left">
            <p className="text-gray-500 text-sm">{todayStr.date}</p>
            <p className="text-gray-800 font-bold text-lg">{todayStr.week}요일</p>
          </div>

          <div className="flex rounded-full bg-gray-100 p-1 gap-0.5">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white shadow text-pink-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.emoji} {tab.label}
              </button>
            ))}
          </div>

          <div className="text-right flex items-center gap-1">
            <span className="text-xl" aria-hidden>⭐</span>
            <span className="font-bold text-gray-800 tabular-nums">{points.totalPoints}P</span>
          </div>
        </div>
      </header>

      {/* ─── 2. 리미 상태바 ─── */}
      <section className="px-4 py-3 border-b border-pink-100/80">
        <div className="flex items-center gap-3">
          <RimiCharacter size="sm" message="오늘도 화이팅!" className="flex-shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">행복도</p>
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
              <p className="text-xs text-gray-500 mb-0.5">오늘 완료율</p>
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
      </section>

      {/* ─── 3. 루틴 체커보드 (4열 그리드) ─── */}
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

      {/* ─── 4. 하단 완료 버튼 ─── */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white to-transparent safe-area-inset-bottom">
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

      {/* ─── 보상 모달 (리미 excited + 포인트) ─── */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gradient-to-b from-amber-50 to-pink-50 flex flex-col items-center justify-center p-6"
          >
            <RimiCharacter mood="excited" size="xl" message="완료 대단해요!" />
            <motion.p
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-2xl font-bold text-gray-800"
            >
              ⭐ {points.totalPoints}P 획득!
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
