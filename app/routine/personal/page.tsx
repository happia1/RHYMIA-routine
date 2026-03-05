'use client';

/**
 * 나의 루틴 (app/routine/personal/page.tsx)
 * 학생/성인용 개인 루틴 관리 화면. 시간대별 탭과 체크 가능한 루틴 항목, 추가/삭제 기능을 제공합니다.
 */

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

/** 시간대 타입 */
type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';

/** 루틴 항목 */
interface RoutineEntry {
  id: string;
  label: string;
  tag: '건강' | '운동' | '공부' | '자기관리';
  done: boolean;
}

/** 태그별 색상 (요청대로) */
const TAG_COLORS: Record<RoutineEntry['tag'], string> = {
  건강: '#22c55e',   // 초록
  운동: '#3b82f6',   // 파랑
  공부: '#a855f7',   // 보라
  자기관리: '#FF8FAB', // 핑크
};

/** 탭 메타 */
const TABS: { key: TimeSlot; label: string; emoji: string }[] = [
  { key: 'morning', label: '아침', emoji: '🌅' },
  { key: 'afternoon', label: '오후', emoji: '☀️' },
  { key: 'evening', label: '저녁', emoji: '🌆' },
  { key: 'night', label: '밤', emoji: '🌙' },
];

/** 기본 루틴 데이터 */
const DEFAULT_ROUTINES: Record<TimeSlot, RoutineEntry[]> = {
  morning: [
    { id: 'm1', label: '물 한 잔', tag: '건강', done: true },
    { id: 'm2', label: '스트레칭', tag: '운동', done: true },
    { id: 'm3', label: '할 일 3가지', tag: '자기관리', done: false },
  ],
  afternoon: [
    { id: 'a1', label: '독서', tag: '공부', done: false },
    { id: 'a2', label: '산책', tag: '운동', done: false },
  ],
  evening: [
    { id: 'e1', label: '하루 돌아보기', tag: '자기관리', done: false },
    { id: 'e2', label: '내일 준비', tag: '자기관리', done: false },
  ],
  night: [
    { id: 'n1', label: '핸드폰 끄기', tag: '자기관리', done: false },
    { id: 'n2', label: '수면 준비', tag: '건강', done: false },
  ],
};

function generateId() {
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export default function PersonalRoutinePage() {
  const [routines, setRoutines] = useState<Record<TimeSlot, RoutineEntry[]>>(DEFAULT_ROUTINES);
  const [activeTab, setActiveTab] = useState<TimeSlot>('morning');
  const [showAddInput, setShowAddInput] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newTag, setNewTag] = useState<RoutineEntry['tag']>('자기관리');

  const currentItems = routines[activeTab];
  const completedCount = currentItems.filter((i) => i.done).length;
  const totalCount = currentItems.length;
  const streakDays = 4;

  const toggleDone = (slot: TimeSlot, id: string) => {
    setRoutines((prev) => ({
      ...prev,
      [slot]: prev[slot].map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      ),
    }));
  };

  const deleteItem = (slot: TimeSlot, id: string) => {
    setRoutines((prev) => ({
      ...prev,
      [slot]: prev[slot].filter((item) => item.id !== id),
    }));
  };

  const addItem = () => {
    if (!newLabel.trim()) return;
    const newItem: RoutineEntry = {
      id: generateId(),
      label: newLabel.trim(),
      tag: newTag,
      done: false,
    };
    setRoutines((prev) => ({
      ...prev,
      [activeTab]: [...prev[activeTab], newItem],
    }));
    setNewLabel('');
    setNewTag('자기관리');
    setShowAddInput(false);
  };

  /** 원형 완료율 (0~100) */
  const completionPercent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-teal-50/50 via-white to-cyan-50/30 pb-28">
      {/* 상단: 뒤로가기 + 제목 + 스트릭 + 원형 완료율 */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <Link
            href="/routine"
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
            aria-label="뒤로 가기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-800 flex-1">나의 루틴</h1>
          <span className="text-sm text-gray-500">🔥 {streakDays}일</span>
          {/* 원형 완료율 */}
          <div className="relative w-10 h-10 flex items-center justify-center">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="#e5e7eb" strokeWidth="3" />
              <motion.circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="#A8E6CF"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="100 100"
                initial={{ strokeDashoffset: 100 }}
                animate={{ strokeDashoffset: 100 - completionPercent }}
                transition={{ duration: 0.5 }}
              />
            </svg>
            <span className="absolute text-xs font-bold text-gray-700">{completionPercent}%</span>
          </div>
        </div>
      </motion.header>

      {/* 시간대 탭 */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex border-b border-gray-200 bg-white/80 px-2"
      >
        {TABS.map((tab) => {
          const items = routines[tab.key];
          const done = items.filter((i) => i.done).length;
          const total = items.length;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex-1 py-3 px-2 text-sm font-medium transition-colors
                ${isActive ? 'text-teal-600 border-b-2 border-teal-500' : 'text-gray-500'}
              `}
            >
              <span className="block">{tab.emoji} {tab.label}</span>
              <span className="text-xs opacity-80">{done}/{total}</span>
            </button>
          );
        })}
      </motion.nav>

      {/* 선택된 시간대 루틴 목록 */}
      <div className="p-4 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          <motion.ul
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {currentItems.map((item, i) => (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3"
              >
                <button
                  onClick={() => toggleDone(activeTab, item.id)}
                  className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
                  style={{
                    borderColor: item.done ? TAG_COLORS[item.tag] : '#d1d5db',
                    backgroundColor: item.done ? TAG_COLORS[item.tag] : 'transparent',
                  }}
                >
                  {item.done && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                <span className={`flex-1 ${item.done ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                  {item.label}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                  style={{ backgroundColor: TAG_COLORS[item.tag] }}
                >
                  #{item.tag}
                </span>
                <button
                  onClick={() => deleteItem(activeTab, item.id)}
                  className="p-1 text-gray-400 hover:text-red-500 rounded"
                  aria-label="삭제"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </motion.li>
            ))}
          </motion.ul>
        </AnimatePresence>

        {/* 루틴 추가 입력창 */}
        <AnimatePresence>
          {showAddInput ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 bg-white rounded-xl border border-gray-200 p-4 space-y-3"
            >
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="루틴 이름"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:border-teal-500 outline-none"
                autoFocus
              />
              <div className="flex flex-wrap gap-2">
                {(Object.keys(TAG_COLORS) as RoutineEntry['tag'][]).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setNewTag(tag)}
                    className="text-xs px-2 py-1 rounded-full text-white"
                    style={{
                      backgroundColor: newTag === tag ? TAG_COLORS[tag] : '#9ca3af',
                    }}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowAddInput(false); setNewLabel(''); }}
                  className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600"
                >
                  취소
                </button>
                <button
                  onClick={addItem}
                  className="flex-1 py-2 rounded-lg bg-teal-500 text-white font-medium"
                >
                  추가
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* 하단: ＋ 루틴 추가 버튼 */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur border-t border-gray-100">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddInput(true)}
          className="w-full max-w-lg mx-auto flex py-3 rounded-xl border-2 border-dashed border-teal-300 text-teal-600 font-medium justify-center items-center gap-2"
        >
          ＋ 루틴 추가
        </motion.button>
      </footer>
    </main>
  );
}
