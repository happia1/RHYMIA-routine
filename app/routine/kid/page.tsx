// app/routine/kid/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKidRoutineStore } from '@/lib/stores/kidRoutineStore';
import { getTodayRoutines } from '@/lib/utils/defaultRoutines';
import { RoutineType } from '@/types/routine';
import RoutineCard from '@/components/kid/RoutineCard';
import PetWidget from '@/components/kid/PetWidget';
import { useTTS } from '@/lib/hooks/useTTS';

const ROUTINE_TYPE_META: Record<RoutineType, { label: string; emoji: string; color: string }> = {
  morning: { label: '아침 루틴', emoji: '🌅', color: 'from-orange-300 to-pink-300' },
  evening: { label: '저녁 루틴', emoji: '🌙', color: 'from-indigo-400 to-purple-400' },
  weekend: { label: '주말 루틴', emoji: '🎉', color: 'from-green-300 to-teal-300' },
  special: { label: '특별 루틴', emoji: '⭐', color: 'from-yellow-300 to-orange-300' },
};

export default function KidRoutinePage() {
  const { routines, completedItemIds, fullyCompletedToday, companion, completeItem, feedCompanion } =
    useKidRoutineStore();
  const { speakRoutineStart, speakItemComplete, speakRoutineComplete } = useTTS();

  const todayRoutines = getTodayRoutines(routines);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);
  const [showReward, setShowReward] = useState(false);

  const selectedRoutine = routines.find((r) => r.id === selectedRoutineId);
  const completedIds = selectedRoutineId ? (completedItemIds[selectedRoutineId] ?? []) : [];
  const isFullyDone = selectedRoutineId ? fullyCompletedToday[selectedRoutineId] : false;

  // 전체 완료 감지 → 보상 화면
  useEffect(() => {
    if (isFullyDone && !showReward) {
      setTimeout(() => {
        speakRoutineComplete();
        setShowReward(true);
      }, 500);
    }
  }, [isFullyDone]);

  const handleSelectRoutine = (id: string, title: string) => {
    setSelectedRoutineId(id);
    setShowReward(false);
    speakRoutineStart(title);
  };

  const handleCompleteItem = (itemId: string) => {
    if (!selectedRoutineId) return;
    const item = selectedRoutine?.items.find((i) => i.id === itemId);
    completeItem(selectedRoutineId, itemId);
    if (item) speakItemComplete(item.label);
  };

  // 진행률 계산
  const progress = selectedRoutine
    ? (completedIds.length / selectedRoutine.items.length) * 100
    : 0;

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-pink-50 to-blue-50 p-4"
      style={{ fontFamily: "'Nanum Gothic', sans-serif" }}
    >
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-gray-700">
          {selectedRoutine ? selectedRoutine.title : '오늘의 루틴 📋'}
        </h1>
        {selectedRoutineId && (
          <button
            onClick={() => setSelectedRoutineId(null)}
            className="text-gray-400 text-2xl"
          >
            ✕
          </button>
        )}
      </div>

      {/* 펫 위젯 (항상 상단) */}
      {companion && (
        <div className="mb-6">
          <PetWidget
            companion={companion}
            onFeed={() => feedCompanion(10)}
          />
        </div>
      )}

      {/* 루틴 선택 화면 */}
      {!selectedRoutineId && (
        <div className="space-y-4">
          {todayRoutines.length === 0 ? (
            <p className="text-center text-gray-400 text-xl mt-10">
              오늘 예정된 루틴이 없어요 😴
            </p>
          ) : (
            todayRoutines.map((routine) => {
              const meta = ROUTINE_TYPE_META[routine.type];
              const completed = completedItemIds[routine.id]?.length ?? 0;
              const total = routine.items.length;
              const isDone = fullyCompletedToday[routine.id];

              return (
                <motion.button
                  key={routine.id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleSelectRoutine(routine.id, routine.title)}
                  className={`
                    w-full p-6 rounded-3xl shadow-lg text-left
                    bg-gradient-to-r ${meta.color}
                    ${isDone ? 'opacity-70' : ''}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{meta.emoji}</span>
                    <div className="flex-1">
                      <p className="text-2xl font-bold text-white">{routine.title}</p>
                      <p className="text-white text-opacity-80 text-lg">
                        {completed}/{total}개 완료
                      </p>
                      {/* 미니 프로그레스 바 */}
                      <div className="w-full bg-white bg-opacity-40 rounded-full h-2 mt-2">
                        <div
                          className="h-2 bg-white rounded-full transition-all"
                          style={{ width: `${(completed / total) * 100}%` }}
                        />
                      </div>
                    </div>
                    {isDone && <span className="text-4xl">✅</span>}
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      )}

      {/* 루틴 실행 화면 */}
      {selectedRoutine && !showReward && (
        <div>
          {/* 진행 바 */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>{completedIds.length}/{selectedRoutine.items.length}개 완료</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
                className="h-4 rounded-full bg-gradient-to-r from-pink-400 to-orange-400"
              />
            </div>
          </div>

          {/* 루틴 카드 목록 */}
          <div className="space-y-3">
            {selectedRoutine.items.map((item) => (
              <RoutineCard
                key={item.id}
                item={item}
                isCompleted={completedIds.includes(item.id)}
                onComplete={handleCompleteItem}
              />
            ))}
          </div>
        </div>
      )}

      {/* 보상 화면 (전체 완료) */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-b from-yellow-100 to-pink-100 flex flex-col items-center justify-center z-50 p-8"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.6 }}
              className="text-8xl mb-6"
            >
              🎉
            </motion.div>
            <h2 className="text-4xl font-extrabold text-pink-600 text-center mb-4">
              완료! 최고야!
            </h2>
            <p className="text-xl text-gray-600 text-center mb-8">
              오늘 루틴을 모두 마쳤어요!<br />부모님께 확인 받아요 💕
            </p>

            {/* 별 파티클 */}
            <div className="flex gap-4 text-5xl mb-10">
              {['⭐', '🌟', '✨', '🌟', '⭐'].map((s, i) => (
                <motion.span
                  key={i}
                  animate={{ y: [0, -15, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.15 }}
                >
                  {s}
                </motion.span>
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowReward(false)}
              className="w-full max-w-xs py-5 rounded-3xl bg-gradient-to-r from-pink-400 to-orange-400 text-white text-2xl font-bold shadow-xl"
            >
              돌아가기 🏠
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
