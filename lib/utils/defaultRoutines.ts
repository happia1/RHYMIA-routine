import { RoutineTemplate, RoutineItem } from '@/types/routine'

// ── 실제 파일명 기준 매핑 (public/routine-icons/) ──
export const ROUTINE_IMAGES: Record<string, string> = {
  'wake-up':     '/routine-icons/wake-up.png',       // 일어나기
  'make-bed':    '/routine-icons/make-bed.png',       // 이불 개기
  'brush-teeth': '/routine-icons/brush-teeth.png',    // 양치하기
  'wash-face':   '/routine-icons/wash-face.png',      // 세수하기
  'get-dressed': '/routine-icons/get-dressed.png',    // 옷 입기
  'breakfast':   '/routine-icons/breakfast.png',      // 아침 먹기
  'brunch':      '/routine-icons/brunch.png',         // 브런치
  'meal-time':   '/routine-icons/meal-time.png',      // 식사 시간
  'unpack-bag':  '/routine-icons/unpack-bag.png',     // 가방 챙기기/풀기
  'go-to-school':'/routine-icons/go-to-school.png',   // 등원
  'school':      '/routine-icons/school.png',         // 학교
  'wash-hand':   '/routine-icons/wash-hand.png',      // 손 씻기
  'tidy-up':     '/routine-icons/tidy-up.png',        // 정리하기
  'bath-time':   '/routine-icons/bath-time.png',      // 목욕하기
  'read-book':   '/routine-icons/read-book.png',      // 책 읽기
  'bedtime':     '/routine-icons/bedtime.png',        // 잠자러 가기
  'homework':    '/routine-icons/homework.png',       // 숙제
  'play-time':   '/routine-icons/play-time.png',      // 놀이 시간
  'outdoor-play':'/routine-icons/outdoor-play.png',   // 야외 놀이
  'listen-music':'/routine-icons/listen-music.png',   // 음악 듣기
  'apple':       '/routine-icons/apple.png',          // 간식
  'greet':       '/routine-icons/greet.png',          // 인사하기 (다녀오겠습니다)
  'bus':         '/routine-icons/bus.png',            // 버스타러가기 (이미지 추가 예정)
  'gargle':      '/routine-icons/gargle.png',         // 가글하기 (이미지 추가 예정)
}

/** 미션 라벨 → imageKey 매핑 (저장된 데이터 보정 시, id가 아닌 라벨로 올바른 이미지 매칭) */
export const LABEL_TO_IMAGE_KEY: Record<string, string> = {
  '일어나기': 'wake-up',
  '세수하기': 'wash-face',
  '양치하기': 'brush-teeth',
  '옷 입기': 'get-dressed',
  '옷 갈아입기': 'get-dressed',
  '아침 먹기': 'breakfast',
  '가방 챙기기': 'unpack-bag',
  '인사하기': 'greet',
  '손 씻기': 'wash-hand',
  '가방 정리': 'tidy-up',
  '정리 정돈 하기': 'tidy-up',
  '목욕하기': 'bath-time',
  '책 읽기': 'read-book',
  '잠자러 가기': 'bedtime',
  '이불 개기': 'make-bed',
  '점심 먹기': 'meal-time',
  '밥 먹기': 'meal-time',
  '저녁 먹기': 'meal-time',
  '브런치': 'brunch',
  '숙제하기': 'homework',
  '놀이 시간': 'play-time',
  '야외 놀이': 'outdoor-play',
  '음악 듣기': 'listen-music',
  '학교 가기': 'school',
  '등원하기': 'go-to-school',
  '간식 먹기': 'apple',
  '버스타러가기': 'bus',
  '인사하기(다녀오겠습니다)': 'greet',
  '가글하기': 'gargle',
}

const makeItem = (
  id: string,
  imageKey: string,
  icon: string,        // 이미지 없을 때 fallback 이모지
  label: string,
  order: number,
  timerSeconds: number = 0,
  ttsText: string = '',  // 카드 설명/TTS 문장 (예: "안녕히 다녀오겠습니다!")
): RoutineItem => {
  const imagePath = ROUTINE_IMAGES[imageKey] ?? null
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development' && !imagePath) {
    console.warn(`[ROUTINE] 이미지 없음: key="${imageKey}"`)
  }
  return {
    id,
    imageKey,
    imagePath,
    icon,
    label,
    ttsText,
    order,
    timerEnabled: timerSeconds > 0,
    timerSeconds,
    isCompleted: false,
  }
}

// ── 아침 루틴 ──
// 일어나기 → 세수/양치 → 옷입기 → 아침먹기 → 가방챙기기 (인사하기는 제거, 필요 시 루틴 수정에서 추가)
export const DEFAULT_KID_MORNING: RoutineTemplate = {
  id: 'default-kid-morning',
  mode: 'kid',
  type: 'morning',
  title: '아침 루틴',
  isActive: true,
  createdAt: new Date().toISOString(),
  schedule: { days: [1, 2, 3, 4, 5], time: '07:00' },
  items: [
    makeItem('km-1', 'wake-up',     '🌅', '일어나기',    1),
    makeItem('km-2', 'wash-face',   '🫧', '세수하기',    2),
    makeItem('km-3', 'brush-teeth', '🪥', '양치하기',    3),
    makeItem('km-4', 'get-dressed', '👗', '옷 입기',     4),
    makeItem('km-5', 'breakfast',   '🍳', '아침 먹기',   5),
    makeItem('km-6', 'unpack-bag',  '🎒', '가방 챙기기', 6),
  ],
}

// ── 저녁 루틴 ──
// 손씻기 → 가방정리 → 목욕 → 책읽기 → 잠자러 가기
export const DEFAULT_KID_EVENING: RoutineTemplate = {
  id: 'default-kid-evening',
  mode: 'kid',
  type: 'evening',
  title: '저녁 루틴',
  isActive: true,
  createdAt: new Date().toISOString(),
  schedule: { days: [1, 2, 3, 4, 5, 6, 0], time: '19:00' },
  items: [
    makeItem('ke-1', 'wash-hand',  '🧴', '손 씻기',     1),
    makeItem('ke-2', 'tidy-up',    '📦', '정리 정돈 하기', 2),
    makeItem('ke-3', 'bath-time',  '🛁', '목욕하기',    3),
    makeItem('ke-4', 'read-book',  '📖', '책 읽기',     4),
    makeItem('ke-5', 'bedtime',    '😴', '잠자러 가기', 5),  // 수면모드 트리거
  ],
}

// ── 학령기 아침 루틴 (이미지 루틴, homework.png 등 사용) ──
export const DEFAULT_SCHOOL_KID_MORNING: RoutineTemplate = {
  id: 'default-school-morning',
  mode: 'kid',
  type: 'morning',
  title: '아침 루틴',
  isActive: true,
  createdAt: new Date().toISOString(),
  schedule: { days: [1, 2, 3, 4, 5], time: '07:00' },
  items: [
    makeItem('sk-1', 'wake-up',     '🌅', '일어나기',    1),
    makeItem('sk-2', 'wash-face',   '🫧', '세수하기',    2),
    makeItem('sk-3', 'brush-teeth', '🪥', '양치하기',    3),
    makeItem('sk-4', 'get-dressed', '👗', '옷 입기',     4),
    makeItem('sk-5', 'breakfast',   '🍳', '아침 먹기',   5),
    makeItem('sk-6', 'unpack-bag',  '🎒', '가방 챙기기', 6),
  ],
}

// ── 학령기 저녁 루틴 (숙제하기 homework.png 포함) ──
export const DEFAULT_SCHOOL_KID_EVENING: RoutineTemplate = {
  id: 'default-school-evening',
  mode: 'kid',
  type: 'evening',
  title: '저녁 루틴',
  isActive: true,
  createdAt: new Date().toISOString(),
  schedule: { days: [1, 2, 3, 4, 5, 6, 0], time: '19:00' },
  items: [
    makeItem('se-1', 'wash-hand',  '🧴', '손 씻기',   1),
    makeItem('se-2', 'homework',   '✏️', '숙제하기',  2),
    makeItem('se-3', 'meal-time',  '🍽️', '저녁 먹기', 3),
    makeItem('se-4', 'bath-time',  '🛁', '목욕하기',  4),
    makeItem('se-5', 'read-book',  '📖', '책 읽기',   5),
    makeItem('se-6', 'bedtime',    '😴', '잠자러 가기', 6),
  ],
}

export const ALL_DEFAULT_SCHOOL_KID_ROUTINES = [
  DEFAULT_SCHOOL_KID_MORNING,
  DEFAULT_SCHOOL_KID_EVENING,
]

// ── 추가 아이템 풀 (루틴 수정 화면에서 추가 가능한 항목들) ──
export const EXTRA_ROUTINE_ITEMS = [
  makeItem('ex-1',  'make-bed',    '🛏️', '이불 개기',     0),
  makeItem('ex-2',  'meal-time',   '🍽️', '밥 먹기',       0),
  makeItem('ex-3',  'brunch',      '🥞',  '브런치',        0),
  makeItem('ex-4',  'homework',    '✏️',  '숙제하기',      0),
  makeItem('ex-5',  'play-time',   '🎮',  '놀이 시간',     0),
  makeItem('ex-6',  'outdoor-play','⚽',  '야외 놀이',     0),
  makeItem('ex-7',  'listen-music','🎵',  '음악 듣기',     0),
  makeItem('ex-8',  'school',      '🏫',  '학교 가기',     0),
  makeItem('ex-9',  'go-to-school','🚌',  '등원하기',      0),
  makeItem('ex-10', 'apple',       '🍎',  '간식 먹기',     0),
  makeItem('ex-11', 'bus',         '🚌',  '버스타러가기',  0),
  makeItem('ex-12', 'greet',       '🤗',  '인사하기(다녀오겠습니다)', 0, 0, '안녕히 다녀오겠습니다!'),
  makeItem('ex-13', 'gargle',      '💧',  '가글하기',      0),
  makeItem('ex-14', 'tidy-up',     '📦',  '정리 정돈 하기', 0),
  makeItem('ex-15', 'brush-teeth', '🪥',  '양치하기',      0),
  makeItem('ex-16', 'get-dressed', '👗',  '옷 갈아입기',   0),
]

export const ALL_DEFAULT_KID_ROUTINES = [DEFAULT_KID_MORNING, DEFAULT_KID_EVENING]

export function getTodayRoutines(routines: RoutineTemplate[]): RoutineTemplate[] {
  const today = new Date().getDay()
  return routines.filter(
    (r) => r.isActive && (!r.schedule || r.schedule.days.includes(today))
  )
}
