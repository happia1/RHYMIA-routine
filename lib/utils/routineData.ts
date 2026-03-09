/**
 * routineData.ts
 * 루틴 화면에서 사용하는 루틴 항목 데이터입니다.
 * public/routine-icons/ 폴더의 이미지 파일명과 1:1로 맞춰 두었습니다.
 */

import type { RoutineItem, RoutineTemplate } from '@/types/routine';

// ──────────────────────────────────────────────
// 타입 정의
// ──────────────────────────────────────────────

/** 루틴 데이터 항목 타입 (아이콘 경로 + TTS 텍스트 포함) */
export interface RoutineDataItem {
  /** 고유 ID (스토어 완료 상태 매칭용) */
  id: string;
  /** 화면에 보여줄 한글 라벨 */
  label: string;
  /** 아이콘 이미지 경로 (예: "/routine-icons/wake-up.png") */
  icon: string;
  /** TTS(음성)로 읽어줄 문구 */
  ttsText: string;
  /** 분류 (진행률/필터 등에 활용) */
  category: string;
}

// ──────────────────────────────────────────────
// 아침 루틴 (morningRoutine)
// ──────────────────────────────────────────────

export const morningRoutine: RoutineDataItem[] = [
  { id: 'morning-wake-up', label: '일어나기', icon: '/routine-icons/wake-up.png', ttsText: '일어날 시간이에요! 🌅', category: 'other' },
  { id: 'morning-make-bed', label: '이불 개기', icon: '/routine-icons/make-bed.png', ttsText: '이불을 예쁘게 개어요!', category: 'other' },
  { id: 'morning-wash-face', label: '세수하기', icon: '/routine-icons/wash-face.png', ttsText: '얼굴을 깨끗이 씻어요!', category: 'hygiene' },
  { id: 'morning-brush-teeth', label: '양치하기', icon: '/routine-icons/brush-teeth.png', ttsText: '이를 반짝반짝 닦아요!', category: 'hygiene' },
  { id: 'morning-get-dressed', label: '옷 입기', icon: '/routine-icons/get-dressed.png', ttsText: '오늘 입을 옷을 골라요!', category: 'other' },
  { id: 'morning-breakfast', label: '아침 먹기', icon: '/routine-icons/breakfast.png', ttsText: '맛있는 아침을 먹어요!', category: 'meal' },
  { id: 'morning-go-to-school', label: '등원하기', icon: '/routine-icons/go-to-school.png', ttsText: '신나게 출발해요!', category: 'other' },
];

// ──────────────────────────────────────────────
// 저녁 루틴 (eveningRoutine)
// ──────────────────────────────────────────────

export const eveningRoutine: RoutineDataItem[] = [
  { id: 'evening-wash-hand', label: '손 씻기', icon: '/routine-icons/wash-hand.png', ttsText: '집에 오면 손부터 씻어요!', category: 'hygiene' },
  { id: 'evening-unpack-bag', label: '가방 정리', icon: '/routine-icons/unpack-bag.png', ttsText: '가방을 정리해요!', category: 'other' },
  { id: 'evening-homework', label: '숙제하기', icon: '/routine-icons/homework.png', ttsText: '숙제를 먼저 해요!', category: 'study' },
  { id: 'evening-play-time', label: '놀이 시간', icon: '/routine-icons/play-time.png', ttsText: '신나게 놀아요!', category: 'other' },
  { id: 'evening-tidy-up', label: '장난감 정리', icon: '/routine-icons/tidy-up.png', ttsText: '장난감을 제자리에!', category: 'other' },
  { id: 'evening-bath-time', label: '목욕하기', icon: '/routine-icons/bath-time.png', ttsText: '깨끗하게 씻어요!', category: 'hygiene' },
  { id: 'evening-read-book', label: '책 읽기', icon: '/routine-icons/read-book.png', ttsText: '오늘의 책을 읽어요!', category: 'study' },
  { id: 'evening-bedtime', label: '잠자리 준비', icon: '/routine-icons/bedtime.png', ttsText: '잘 준비를 해요. 잘 자요!', category: 'other' },
];

// ──────────────────────────────────────────────
// 주말 루틴 (weekendRoutine)
// ──────────────────────────────────────────────

export const weekendRoutine: RoutineDataItem[] = [
  { id: 'weekend-wake-up', label: '일어나기', icon: '/routine-icons/wake-up.png', ttsText: '주말 아침이에요!', category: 'other' },
  { id: 'weekend-make-bed', label: '이불 개기', icon: '/routine-icons/make-bed.png', ttsText: '주말에도 이불을 개요!', category: 'other' },
  { id: 'weekend-breakfast', label: '아침 먹기', icon: '/routine-icons/breakfast.png', ttsText: '맛있는 아침을 먹어요!', category: 'meal' },
  { id: 'weekend-outdoor-play', label: '바깥 놀이', icon: '/routine-icons/outdoor-play.png', ttsText: '밖에서 신나게 놀아요!', category: 'exercise' },
  { id: 'weekend-school', label: '특별 활동', icon: '/routine-icons/school.png', ttsText: '오늘은 어디 가볼까요?', category: 'other' },
  { id: 'weekend-listen-music', label: '음악 듣기', icon: '/routine-icons/listen-music.png', ttsText: '좋아하는 음악을 들어요!', category: 'other' },
  { id: 'weekend-read-book', label: '책 읽기', icon: '/routine-icons/read-book.png', ttsText: '책을 읽어요!', category: 'study' },
  { id: 'weekend-bedtime', label: '잠자리 준비', icon: '/routine-icons/bedtime.png', ttsText: '잘 자요!', category: 'other' },
];

// ──────────────────────────────────────────────
// 루틴 타입별 ID (스토어와 매칭)
// ──────────────────────────────────────────────

export type RoutineTabType = 'morning' | 'evening' | 'weekend';

/** 탭 타입에 해당하는 루틴 배열 반환 */
export function getRoutineByTab(tab: RoutineTabType): RoutineDataItem[] {
  switch (tab) {
    case 'morning':
      return morningRoutine;
    case 'evening':
      return eveningRoutine;
    case 'weekend':
      return weekendRoutine;
    default:
      return morningRoutine;
  }
}

// ──────────────────────────────────────────────
// 스토어용 템플릿 변환 (kidRoutineStore와 연동)
// ──────────────────────────────────────────────

/** RoutineDataItem → RoutineItem (order 추가) */
function toRoutineItem(data: RoutineDataItem, order: number): RoutineItem {
  return {
    id: data.id,
    label: data.label,
    icon: data.icon,
    ttsText: data.ttsText,
    category: data.category as RoutineItem['category'],
    order,
    timerSeconds: 0,
  };
}

/**
 * 스토어 초기화용 루틴 템플릿 배열 생성.
 * 빈 스토어일 때 setRoutines()에 넣어 사용합니다.
 */
export function getRoutineTemplatesForStore(userId: string): RoutineTemplate[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'morning',
      userId,
      mode: 'kid',
      type: 'morning',
      title: '아침 루틴 🌅',
      items: morningRoutine.map((item, i) => toRoutineItem(item, i + 1)),
      schedule: { days: [1, 2, 3, 4, 5], time: '07:00', alarmEnabled: false },
      isActive: true,
      createdAt: now,
    },
    {
      id: 'evening',
      userId,
      mode: 'kid',
      type: 'evening',
      title: '저녁 루틴 🌙',
      items: eveningRoutine.map((item, i) => toRoutineItem(item, i + 1)),
      schedule: { days: [1, 2, 3, 4, 5, 6, 0], time: '19:00', alarmEnabled: false },
      isActive: true,
      createdAt: now,
    },
    {
      id: 'weekend',
      userId,
      mode: 'kid',
      type: 'weekend',
      title: '주말 루틴 🎉',
      items: weekendRoutine.map((item, i) => toRoutineItem(item, i + 1)),
      schedule: { days: [6, 0], time: '09:00', alarmEnabled: false },
      isActive: true,
      createdAt: now,
    },
  ];
}
