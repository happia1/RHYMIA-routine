/**
 * 가족 프로필 타입 정의
 * 비개발자: "엄마", "아빠", "미취학 자녀", "학령기 자녀" 등 앱에서 사용하는 프로필의 형태를 정의해요.
 */

export type ProfileRole = 'mom' | 'dad' | 'child_preschool' | 'child_school'

/** 자녀 프로필용 성별 (기본 이미지 girl.png / boy.png 선택) */
export type ChildGender = 'girl' | 'boy' | null

export interface FamilyProfile {
  id: string
  name: string                    // 예: "지수", "엄마", "아빠"
  role: ProfileRole
  avatarEmoji: string             // 예: "🧒", "👩", "👨"
  avatarColor: string             // 배경색 hex
  /** 자녀 전용: 여아/남아 (기본 프로필 이미지 결정) */
  gender?: ChildGender
  /** 업로드한 사진 (base64). useCustomPhoto가 true일 때 표시 */
  customPhotoBase64?: string
  /** true면 customPhotoBase64 사용, false면 기본 이미지 또는 이모지 */
  useCustomPhoto?: boolean
  createdAt: string

  // 자녀 전용: 등원·하원 시간·기관 정보 (등원 카운트다운 배너에 사용)
  childSettings?: {
    institutionType: 'kindergarten' | 'daycare' | 'elementary' | null
    departureTime: string | null   // 집 나서는 시간 "HH:mm"
    arrivalTime: string | null     // 등원 시간 "HH:mm"
    returnTime: string | null      // 하원 시간 "HH:mm"
    /** 미션별 타이머(초). { 'km-2': 120, 'ke-3': 600, ... } */
    missionTimers?: Record<string, number>
    institutionName?: string
  }

  // 나의 루틴(개인) 전용: 목표 키워드 (기본 루틴 추천용)
  goals?: string[]

  // 개인 루틴 게이미피케이션: 캐릭터 표시 여부 및 종류
  useGameification?: boolean
  character?: string   // 예: 'penguin', 'dog', 'cat'
}

export interface ProfileStore {
  profiles: FamilyProfile[]
  activeProfileId: string | null
}

/** 역할별 표시용 메타 (라벨, 이모지, 색상, 설명) */
export const ROLE_META: Record<ProfileRole, {
  label: string
  emoji: string
  color: string
  description: string
}> = {
  mom:             { label: '엄마',       emoji: '👩', color: '#FF8FAB', description: '나의 하루 루틴 관리' },
  dad:             { label: '아빠',       emoji: '👨', color: '#7EB8D4', description: '나의 하루 루틴 관리' },
  child_preschool: { label: '미취학 자녀', emoji: '🧒', color: '#FFD93D', description: '유치원·어린이집' },
  child_school:    { label: '학령기 자녀', emoji: '🎒', color: '#A8E6CF', description: '초등학생 이상' },
}

/** 아바타 배경 선택용 색상 팔레트 */
export const AVATAR_COLORS = [
  '#FF8FAB', '#FFD93D', '#A8E6CF', '#7EB8D4',
  '#C77DFF', '#FF9A3C', '#B5EAD7', '#FFDAC1',
]

/** 엄마/아빠 등 "나의 루틴"용 프로필인지 (개인 루틴 화면 /personal/[id] 사용) */
export function isPersonalProfile(p: FamilyProfile): boolean {
  return p.role === 'mom' || p.role === 'dad'
}

/** 미취학·학령기 자녀 프로필인지 (아이 루틴 화면 /routine/kid 사용) */
export function isKidProfile(p: FamilyProfile): boolean {
  return p.role === 'child_preschool' || p.role === 'child_school'
}

/**
 * 프로필 표시용 이미지 소스 반환 (커스텀 사진 → 자녀 기본 이미지 → null이면 이모지 사용)
 * 비개발자: 업로드한 사진이 있으면 그걸, 자녀면 여아/남아 기본 이미지 경로를, 없으면 null(이모지 fallback)을 줘요.
 */
export function getProfileImageSrc(profile: FamilyProfile): string | null {
  if (profile.useCustomPhoto && profile.customPhotoBase64) {
    return profile.customPhotoBase64
  }
  // 엄마/아빠: 선택한 프로필 이미지 그대로 사용
  if (profile.role === 'mom') return '/profile/mom.png'
  if (profile.role === 'dad') return '/profile/dad.png'
  const isChild = profile.role === 'child_preschool' || profile.role === 'child_school'
  if (!isChild) return null
  // 학령기: 여학생/남학생 이미지, 미취학: 여아/남아 이미지
  if (profile.role === 'child_school') {
    if (profile.gender === 'girl') return '/profile/girl_student.png'
    if (profile.gender === 'boy') return '/profile/boy_student.png'
  } else {
    if (profile.gender === 'girl') return '/profile/girl.png'
    if (profile.gender === 'boy') return '/profile/boy.png'
  }
  return null
}
