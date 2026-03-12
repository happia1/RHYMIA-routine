import { RoutineTemplate, RoutineItem } from '@/types/routine'

const R = '/routine-icons/routines'
/**
 * 미션 키워드(파일명) → 이미지 경로 (public/routine-icons/routines/ 하위 폴더)
 * 비개발자: 아침=morning, 평일오후=afternoon-daytime, 저녁=night, 특별미션=special, 주말=weekend
 */
export const ROUTINE_IMAGES: Record<string, string> = {
  wakeup: `${R}/morning/wake-up.png`,
  sleep: `${R}/night/good-night.png`,
  morning: `${R}/morning/wake-up.png`,
  bus: '/routine-icons/bus.png',
  clock: '/routine-icons/icons/status/clock.png',

  // [아침 루틴] morning 폴더 — 사용자 지정 순서·파일명 그대로 매칭
  'wake-up': `${R}/morning/wake-up.png`,
  'wash-face': `${R}/morning/wash-face.png`,
  'brush-teeth': `${R}/morning/brush-teeth.png`,
  potty: `${R}/morning/potty.png`,
  'self-dress': `${R}/morning/self-dress.png`,
  'pack-bag': `${R}/morning/pack-bag.png`,
  breakfast: `${R}/morning/breakfast.png`,
  'self-tie-shoes': `${R}/morning/self-tie-shoes.png`,
  'go-to-kindergarden': `${R}/morning/go-to-kindergarden.png`,

  // [평일오후] afternoon-daytime 폴더 — 사용자 지정 순서·파일명 그대로 매칭
  'leaving-kindergarten': `${R}/afternoon-daytime/leaving-kindergarten.png`,
  'play-outside': `${R}/afternoon-daytime/play-outside.png`,
  'hanging-cloth': `${R}/afternoon-daytime/hanging-cloth.png`,
  'wash-hand': `${R}/afternoon-daytime/wash-hand.png`,
  'unpack-bag': `${R}/afternoon-daytime/unpack-bag.png`,
  'loundry_basket': `${R}/afternoon-daytime/loundry_basket.png`,
  drawing: `${R}/afternoon-daytime/drawing.png`,
  'play_at_home': `${R}/afternoon-daytime/play-at-home.png`,
  'play-at-home': `${R}/afternoon-daytime/play-at-home.png`,
  'read-book': `${R}/afternoon-daytime/read-book.png`,
  puzzle: `${R}/afternoon-daytime/puzzle.png`,
  tidyup: `${R}/afternoon-daytime/tidyup.png`,
  meal: `${R}/afternoon-daytime/meal.png`,
  'clean-after-meal': `${R}/afternoon-daytime/clean-after-meal.png`,

  // [저녁 루틴] night 폴더 — 사용자 지정 순서·파일명 그대로 매칭
  'change-pajama': `${R}/night/change-pajama.png`,
  'change_pajama': `${R}/night/change-pajama.png`,
  'bath-time': `${R}/night/bath-time.png`,
  'brush-teeth-night': `${R}/night/brush-teeth-night.png`,
  shower: `${R}/night/shower.png`,
  'read-book-before-bed': `${R}/night/read-book-before-bed.png`,
  'good-night': `${R}/night/good-night.png`,

  // [특별미션] special 폴더 — 사용자 지정 순서·파일명 그대로 매칭 (Botton→Button, dringk→drink)
  // 'clean-after-meal'은 위 afternoon-daytime에 이미 정의됨 (동일 키 중복 제거)
  'eat-all': `${R}/special/eat-all.png`,
  'eat-vegitables': `${R}/special/eat-vegitables.png`,
  'Button-up': `${R}/special/Button-up.png`,
  'drink-water': `${R}/special/drink-water.png`,
  'greeting_well': `${R}/special/greeting_well.png`,
  recycle: `${R}/special/recycle.png`,

  // [주말루틴] weekend 폴더 — 사용자 지정 순서·파일명 그대로 매칭
  'change-weekend-morning': `${R}/weekend/change-weekend-morning.png`,
  dinner: `${R}/weekend/dinner.png`,
  'wash-face-weekend': `${R}/weekend/morning%20change.png`,
  'read-book-weekend': `${R}/weekend/read-book.png`,
  'read-book-before-bed-weekend': `${R}/weekend/read-book-before-bed.png`,
  'wake-up-weekend': `${R}/weekend/wake-up.png`,
  'brush-teeth-weekend': `${R}/weekend/brush-teeth.png`,
  'potty-weekend': `${R}/weekend/potty.png`,
  'breakfast-weekend': `${R}/weekend/breakfast.png`,
  'tidyup-weekend': `${R}/weekend/tidyup.png`,
  'change-pajama-weekend': `${R}/weekend/change-pajama.png`,
  'bath-time-weekend': `${R}/weekend/bath-time.png`,
  'brush-teeth-night-weekend': `${R}/weekend/brush-teeth-night.png`,
  'shower-weekend': `${R}/weekend/shower.png`,
  'good-night-weekend': `${R}/weekend/good-night.png`,

  // 호환용
  'get-dressed': `${R}/morning/self-dress.png`,
  'meal-time': `${R}/afternoon-daytime/meal.png`,
  'tidy-up': `${R}/afternoon-daytime/tidyup.png`,
  bedtime: `${R}/night/good-night.png`,
  school: `${R}/afternoon-daytime/leaving-kindergarten.png`,
  dressed: `${R}/morning/self-dress.png`,
  'self-tiedup': `${R}/morning/self-tie-shoes.png`,
  'go-to-school': `${R}/morning/go-to-kindergarden.png`,
  apple: `${R}/special/eat-vegitables.png`,
  greet: `${R}/morning/go-to-kindergarden.png`,
  gargle: `${R}/afternoon-daytime/wash-hand.png`,
}

/**
 * 미션 라벨 → imageKey(파일명) 매핑
 * 비개발자: 카드에 표시할 때 "일어나기"면 wake-up 이미지 파일을 찾아 씁니다.
 */
export const LABEL_TO_IMAGE_KEY: Record<string, string> = {
  '일어나기': 'wake-up',
  '세수하기': 'wash-face',
  '양치하기': 'brush-teeth',
  '옷 입기': 'get-dressed',
  '옷입기': 'get-dressed',
  '옷 갈아입기': 'get-dressed',
  '아침 먹기': 'breakfast',
  '아침먹기': 'breakfast',
  '등원하기': 'go-to-kindergarden',
  '밥 먹기': 'meal-time',
  '밥먹기': 'meal-time',
  '침대 정리하기': 'make-bed',
  '침대정리': 'make-bed',
  '침대정리하기': 'organize-bed',
  '야외놀이': 'play-time',
  '야외 놀이': 'play-time',
  '놀이 시간': 'play-time',
  '놀이시간': 'play-time',
  '책 읽기': 'read-book',
  '책읽기': 'read-book',
  '독서하기': 'read-book',
  '정리하기': 'tidy-up',
  '정리 정돈 하기': 'tidy-up',
  '장난감 제자리 정리': 'tidy-up',
  '가방 정리': 'unpack-bag',
  '가방 챙기기': 'unpack-bag',
  '가방정리': 'unpack-bag',
  '하원하기': 'school',
  '목욕하기': 'bath-time',
  '잠자기': 'bedtime',
  '잠자러 가기': 'bedtime',
  '손 씻기': 'wash-hand',
  '손씻기': 'wash-hand',
  '원복입기': 'dressed',
  '물 마시기': 'drink-water',
  '물마시기': 'drink-water',
  '신발끈묶기': 'self-tiedup',
  '등교/등원 준비 완료': 'go-to-kindergarden',
  '인사하기': 'greet',
  '점심 먹기': 'meal-time',
  '저녁 먹기': 'meal-time',
  '브런치': 'brunch',
  '숙제하기': 'homework',
  '음악 듣기': 'listen-music',
  '학교 가기': 'school',
  '간식 먹기': 'apple',
  '버스타러가기': 'bus',
  '인사하기(다녀오겠습니다)': 'greet',
  '가글하기': 'gargle',
  '영양제 먹기': 'apple',
  '운동하기': 'outdoor-play',
  '야채 먹기': 'apple',
  '명상하기': 'sleep',
  '엄마 심부름 하기': 'bus',
  '혼자서 옷 입기': 'button',
  '스스로 일어나기': 'wake-up',
  '편식 없이 식사하기': 'meal-time',
  '단추 잠그기': 'button',
  '이불 개기': 'make-bed',
  // ── 새 루틴 라벨 (아침/하원/밤) ──
  '화장실가기': 'potty',
  '원복 갈아입기': 'self-dress',
  '가방준비': 'pack-bag',
  '신발 신고': 'self-tie-shoes',
  '등원!': 'go-to-kindergarden',
  '하원버스내리기': 'leaving-kindergarten',
  '야외 활동하기': 'play-outside',
  '외투 걸어놓기': 'hanging-cloth',
  '가방 정리하기': 'unpack-bag',
  '그림그리기': 'drawing',
  '장난감놀이': 'play-at-home',
  '퍼즐놀이': 'puzzle',
  '장난감 정리하기': 'tidyup',
  '내 수저 챙기기': 'meal',
  '저녁먹기': 'meal',
  '식탁 정리 돕기': 'clean-after-meal',
  '잠옷 갈아입기': 'change-pajama',
  '샤워하기': 'shower',
  // '잠자기'는 위쪽에서 이미 'bedtime'으로 매핑됨 (중복 제거)
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

// ── [아침 루틴 탭] morning 폴더, 평일만, 보상: 하트 ──
export const DEFAULT_KID_MORNING: RoutineTemplate = {
  id: 'default-kid-morning',
  mode: 'kid',
  type: 'morning',
  title: '아침 루틴',
  isActive: true,
  createdAt: new Date().toISOString(),
  schedule: { days: [1, 2, 3, 4, 5], time: '07:00' },
  items: [
    makeItem('km-1', 'wake-up', '🌅', '일어나기', 1),
    makeItem('km-2', 'brush-teeth', '🪥', '양치하기', 2),
    makeItem('km-3', 'potty', '🚽', '화장실가기', 3),
    makeItem('km-4', 'self-dress', '👗', '원복 갈아입기', 4),
    makeItem('km-5', 'pack-bag', '🎒', '가방준비', 5),
    makeItem('km-6', 'breakfast', '🍳', '아침 먹기', 6),
    makeItem('km-7', 'self-tie-shoes', '👟', '신발 신기', 7),
    makeItem('km-8', 'go-to-kindergarden', '🏫', '등원하기', 8),
  ],
}

// ── [평일오후] afternoon-daytime 폴더, 평일만, 보상: 하트 ──
export const DEFAULT_KID_AFTERNOON: RoutineTemplate = {
  id: 'default-kid-afternoon',
  mode: 'kid',
  type: 'afternoon',
  title: '평일오후',
  isActive: true,
  createdAt: new Date().toISOString(),
  schedule: { days: [1, 2, 3, 4, 5], time: '15:00' },
  items: [
    makeItem('ka-1', 'leaving-kindergarten', '🚌', '하원버스내리기', 1),
    makeItem('ka-2', 'play-outside', '🌳', '야외 활동하기', 2),
    makeItem('ka-3', 'hanging-cloth', '🧥', '외투 걸어놓기', 3),
    makeItem('ka-4', 'wash-hand', '🧴', '손 씻기', 4),
    makeItem('ka-5', 'unpack-bag', '🎒', '가방 정리하기', 5),
    makeItem('ka-6', 'loundry_basket', '🧺', '옷 빨래통에 넣기', 6),
    makeItem('ka-7', 'drawing', '🖍️', '그림그리기', 7),
    makeItem('ka-8', 'play_at_home', '🧸', '장난감놀이', 8),
    makeItem('ka-9', 'read-book', '📖', '책읽기', 9),
    makeItem('ka-10', 'puzzle', '🧩', '퍼즐놀이', 10),
    makeItem('ka-11', 'tidyup', '📦', '장난감 정리하기', 11),
    makeItem('ka-12', 'meal', '🍽️', '저녁먹기', 12),
  ],
}

// ── [저녁 루틴] night 폴더, 평일만, 보상: 하트 ──
export const DEFAULT_KID_EVENING: RoutineTemplate = {
  id: 'default-kid-evening',
  mode: 'kid',
  type: 'evening',
  title: '저녁 루틴',
  isActive: true,
  createdAt: new Date().toISOString(),
  schedule: { days: [1, 2, 3, 4, 5], time: '19:00' },
  items: [
    makeItem('ke-1', 'bath-time', '🛁', '목욕하기', 1),
    makeItem('ke-2', 'brush-teeth-night', '🪥', '양치하기', 2),
    makeItem('ke-3', 'shower', '🚿', '샤워하기', 3),
    makeItem('ke-4', 'change-pajama', '👘', '잠옷 갈아입기', 4),
    makeItem('ke-5', 'read-book-before-bed', '📖', '책읽기', 5),
    makeItem('ke-6', 'good-night', '🌙', '잠자기', 6),
  ],
}

// ── [특별미션] special 폴더, 매일, 골드 배경·보상: 별 ──
export const DEFAULT_KID_SPECIAL: RoutineTemplate = {
  id: 'default-kid-special',
  mode: 'kid',
  type: 'special',
  title: '특별미션',
  isActive: true,
  createdAt: new Date().toISOString(),
  schedule: { days: [0, 1, 2, 3, 4, 5, 6], time: '12:00' },
  items: [
    makeItem('ks-1', 'eat-all', '🍽️', '밥 다먹기', 1),
    makeItem('ks-2', 'eat-vegitables', '🥬', '야채 먹기', 2),
    makeItem('ks-3', 'clean-after-meal', '🧹', '식탁 정리 돕기', 3),
    makeItem('ks-4', 'Button-up', '🔘', '스스로 단추잠그기', 4),
    makeItem('ks-5', 'drink-water', '💧', '물마시기', 5),
    makeItem('ks-6', 'greeting_well', '🙂', '인사잘하기', 6),
    makeItem('ks-7', 'recycle', '♻️', '분리수거하기', 7),
  ],
}

// ── [주말루틴] weekend 폴더, 토·일만, 보상: 하트 ──
export const DEFAULT_KID_WEEKEND: RoutineTemplate = {
  id: 'default-kid-weekend',
  mode: 'kid',
  type: 'weekend',
  title: '주말루틴',
  isActive: true,
  createdAt: new Date().toISOString(),
  schedule: { days: [0, 6], time: '09:00' },
  items: [
    makeItem('kw-1', 'wake-up-weekend', '🌅', '일어나기', 1),
    makeItem('kw-2', 'wash-face-weekend', '🫧', '세수하기', 2),
    makeItem('kw-3', 'brush-teeth-weekend', '🪥', '양치하기', 3),
    makeItem('kw-4', 'potty-weekend', '🚽', '화장실가기', 4),
    makeItem('kw-5', 'breakfast-weekend', '🍳', '아침 먹기', 5),
    makeItem('kw-6', 'change-weekend-morning', '👗', '옷입기', 6),
    makeItem('kw-7', 'read-book-weekend', '📖', '책읽기', 7),
    makeItem('kw-8', 'tidyup-weekend', '📦', '장난감 정리하기', 8),
    makeItem('kw-9', 'dinner', '🍽️', '저녁먹기', 9),
    makeItem('kw-10', 'change-pajama-weekend', '👘', '잠옷 갈아입기', 10),
    makeItem('kw-11', 'bath-time-weekend', '🛁', '목욕하기', 11),
    makeItem('kw-12', 'brush-teeth-night-weekend', '🪥', '양치하기', 12),
    makeItem('kw-13', 'shower-weekend', '🚿', '샤워하기', 13),
    makeItem('kw-14', 'read-book-before-bed-weekend', '📖', '책읽기', 14),
    makeItem('kw-15', 'good-night-weekend', '🌙', '잠자기', 15),
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
    makeItem('sk-2', 'brush-teeth', '🪥', '양치하기',    2),
    makeItem('sk-3', 'get-dressed', '👗', '옷 입기',     3),
    makeItem('sk-4', 'breakfast',   '🍳', '아침 먹기',   4),
    makeItem('sk-5', 'unpack-bag',  '🎒', '가방 챙기기', 5),
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

// ── 건강 습관 루틴 (weekend 타입으로 탭에서 '건강 습관'에 노출) ──
export const DEFAULT_KID_HEALTH: RoutineTemplate = {
  id: 'default-kid-health',
  mode: 'kid',
  type: 'weekend',
  title: '건강 습관',
  isActive: true,
  createdAt: new Date().toISOString(),
  schedule: { days: [1, 2, 3, 4, 5, 6, 0], time: '12:00' },
  items: [
    makeItem('kh-1', 'wash-hand', '💧', '물 마시기', 1),
    makeItem('kh-2', 'apple', '💊', '영양제 먹기', 2),
    makeItem('kh-3', 'outdoor-play', '🏃', '운동하기', 3),
    makeItem('kh-4', 'apple', '🥬', '야채 먹기', 4),
    makeItem('kh-5', 'sleep', '🧘', '명상하기', 5),
  ],
}

// ── 마일스톤 (특별 보상, special 타입) ──
export const DEFAULT_KID_MILESTONE: RoutineTemplate = {
  id: 'default-kid-milestone',
  mode: 'kid',
  type: 'special',
  title: '마일스톤',
  isActive: true,
  createdAt: new Date().toISOString(),
  schedule: { days: [1, 2, 3, 4, 5, 6, 0], time: '00:00' },
  items: [
    makeItem('kms-1', 'bus', '🛒', '엄마 심부름 하기', 1),
    makeItem('kms-2', 'button', '👕', '혼자서 옷 입기', 2),
    makeItem('kms-3', 'wakeup', '⏰', '스스로 일어나기', 3),
    makeItem('kms-4', 'meal-time', '🍽️', '편식 없이 식사하기', 4),
    makeItem('kms-5', 'button', '🔘', '단추 잠그기', 5),
  ],
}

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
  makeItem('ex-9',  'go-to-kindergarden', '🏫', '등원하기', 0),
  makeItem('ex-10', 'apple',       '🍎',  '간식 먹기',     0),
  makeItem('ex-11', 'bus',         '🚌',  '버스타러가기',  0),
  makeItem('ex-12', 'greet',       '🤗',  '인사하기(다녀오겠습니다)', 0, 0, '안녕히 다녀오겠습니다!'),
  makeItem('ex-13', 'gargle',      '💧',  '가글하기',      0),
  makeItem('ex-14', 'tidy-up',     '📦',  '정리 정돈 하기', 0),
  makeItem('ex-15', 'brush-teeth', '🪥',  '양치하기',      0),
  makeItem('ex-16', 'get-dressed', '👗',  '옷 갈아입기',   0),
]

/** 아침·평일오후·저녁·특별미션·주말 기본 루틴 (init 시 프로필에 세팅되는 기본값) */
export const ALL_DEFAULT_KID_ROUTINES = [
  DEFAULT_KID_MORNING,
  DEFAULT_KID_AFTERNOON,
  DEFAULT_KID_EVENING,
  DEFAULT_KID_SPECIAL,
  DEFAULT_KID_WEEKEND,
]

export function getTodayRoutines(routines: RoutineTemplate[]): RoutineTemplate[] {
  const today = new Date().getDay()
  return routines.filter(
    (r) => r.isActive && (!r.schedule || r.schedule.days.includes(today))
  )
}
