// lib/utils/defaultRoutines.ts
import { RoutineItem, RoutineTemplate } from '@/types/routine';

// ──────────────────────────────────────────────
// 기본 루틴 항목 풀 (아이 모드)
// ──────────────────────────────────────────────
export const DEFAULT_KID_ITEMS = {
  morning: [
    { id: 'm1', label: '이불 개기',       icon: '🛏️', ttsText: '이불을 예쁘게 개어볼까요?',       category: 'other',   order: 1 },
    { id: 'm2', label: '세수하기',         icon: '🚿', ttsText: '얼굴을 깨끗이 씻어요!',             category: 'hygiene', order: 2 },
    { id: 'm3', label: '양치하기',         icon: '🪥', ttsText: '이를 반짝반짝 닦아요!',            category: 'hygiene', order: 3 },
    { id: 'm4', label: '옷 입기',          icon: '👗', ttsText: '오늘 입을 예쁜 옷을 골라요!',      category: 'other',   order: 4 },
    { id: 'm5', label: '아침 먹기',        icon: '🍳', ttsText: '맛있는 아침을 먹어요!',            category: 'meal',    order: 5 },
    { id: 'm6', label: '가방 챙기기',      icon: '👜', ttsText: '오늘 필요한 것들을 챙겼나요?',    category: 'other',   order: 6 },
    { id: 'm7', label: '인사하기',         icon: '🤗', ttsText: '안녕히 다녀오겠습니다!',           category: 'social',  order: 7 },
  ] as RoutineItem[],

  evening: [
    { id: 'e1', label: '손 씻기',          icon: '🧴', ttsText: '집에 돌아왔어요! 손을 씻어요!',   category: 'hygiene', order: 1 },
    { id: 'e2', label: '가방 정리하기',    icon: '🎒', ttsText: '가방 속 물건을 정리해요!',        category: 'other',   order: 2 },
    { id: 'e3', label: '내일 준비물 챙기기', icon: '📋', ttsText: '내일 필요한 것들을 준비해요!', category: 'study',   order: 3 },
    { id: 'e4', label: '목욕하기',         icon: '🛁', ttsText: '깨끗하게 씻을 시간이에요!',       category: 'hygiene', order: 4 },
    { id: 'e5', label: '책 읽기',          icon: '📖', ttsText: '오늘의 책을 함께 읽어볼까요?',   category: 'study',   order: 5 },
    { id: 'e6', label: '장난감 정리하기',  icon: '🧸', ttsText: '장난감 친구들을 제자리에!',      category: 'other',   order: 6 },
    { id: 'e7', label: '잠자리 준비하기',  icon: '😴', ttsText: '이제 잘 준비를 해요. 잘 자요!', category: 'other',   order: 7 },
  ] as RoutineItem[],

  weekend: [
    { id: 'w1', label: '잠자리 정리하기',  icon: '🛏️', ttsText: '주말에도 이불을 개어요!',        category: 'other',   order: 1 },
    { id: 'w2', label: '세수·양치하기',    icon: '🚿', ttsText: '개운하게 씻어요!',                category: 'hygiene', order: 2 },
    { id: 'w3', label: '옷 입기',          icon: '👕', ttsText: '오늘은 어떤 옷을 입을까요?',      category: 'other',   order: 3 },
    { id: 'w4', label: '아침 먹기',        icon: '🥞', ttsText: '주말 아침을 맛있게 먹어요!',      category: 'meal',    order: 4 },
    { id: 'w5', label: '방 청소하기',      icon: '🧹', ttsText: '우리 방을 깨끗이 청소해요!',      category: 'other',   order: 5 },
    { id: 'w6', label: '운동하기',         icon: '🏃', ttsText: '몸을 움직여 신나게 운동해요!',    category: 'exercise',order: 6 },
    { id: 'w7', label: '독서하기',         icon: '📚', ttsText: '주말엔 책을 더 많이 읽어요!',    category: 'study',   order: 7 },
  ] as RoutineItem[],
};

// ──────────────────────────────────────────────
// 기본 루틴 템플릿 생성 함수
// ──────────────────────────────────────────────
export function createDefaultKidRoutines(userId: string): Omit<RoutineTemplate, 'id' | 'createdAt'>[] {
  return [
    {
      userId,
      mode: 'kid',
      type: 'morning',
      title: '아침 루틴 🌅',
      items: DEFAULT_KID_ITEMS.morning,
      schedule: { days: [1, 2, 3, 4, 5], time: '07:00', alarmEnabled: false },
      isActive: true,
    },
    {
      userId,
      mode: 'kid',
      type: 'evening',
      title: '저녁 루틴 🌙',
      items: DEFAULT_KID_ITEMS.evening,
      schedule: { days: [1, 2, 3, 4, 5, 6, 0], time: '19:00', alarmEnabled: false },
      isActive: true,
    },
    {
      userId,
      mode: 'kid',
      type: 'weekend',
      title: '주말 루틴 🎉',
      items: DEFAULT_KID_ITEMS.weekend,
      schedule: { days: [6, 0], time: '09:00', alarmEnabled: false },
      isActive: true,
    },
  ];
}

// ──────────────────────────────────────────────
// 오늘 표시해야 할 루틴 필터링
// ──────────────────────────────────────────────
export function getTodayRoutines(routines: RoutineTemplate[]): RoutineTemplate[] {
  const today = new Date().getDay(); // 0=일, 1=월...
  return routines.filter(
    (r) => r.isActive && r.schedule?.days.includes(today)
  );
}
