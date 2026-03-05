/**
 * profile.ts
 * 앱 프로필(아이/개인) 타입 정의.
 * 프로필 선택 화면·온보딩·라우팅에서 사용합니다.
 */

// ──────────────────────────────────────────────
// 프로필 구분
// ──────────────────────────────────────────────

/** 프로필 종류: 아이용 루틴 vs 나의 루틴 */
export type ProfileType = 'kid' | 'personal';

/** 기관 유형 (아이) */
export type InstitutionType = 'daycare' | 'kindergarten' | 'home';

/** 캐릭터 종류 (아이/개인 게이미피케이션) */
export type ProfileCharacterType =
  | 'penguin'
  | 'dog'
  | 'cat'
  | 'rabbit'
  | 'hamster'
  | 'sunflower';

// ──────────────────────────────────────────────
// 아이 프로필 (KidProfile)
// ──────────────────────────────────────────────

export interface KidProfile {
  type: 'kid';
  id: string;
  name: string;
  age: number;
  /** 가정보육 / 어린이집 / 유치원 */
  institution: InstitutionType;
  /** 키울 캐릭터 (리미=펭귄 등) */
  character: ProfileCharacterType;
  /** 테마 색상 (hex 등) */
  themeColor: string;
  /** 부모 전용 4자리 PIN */
  pin: string;
  createdAt: string;
}

// ──────────────────────────────────────────────
// 개인 프로필 (PersonalProfile)
// ──────────────────────────────────────────────

/** 연령대 (개인) */
export type AgeGroupType = 'elementary' | 'middle-high' | 'adult';

export interface PersonalProfile {
  type: 'personal';
  id: string;
  name: string;
  ageGroup: AgeGroupType;
  /** 루틴 목표 (다중선택) */
  goals: string[];
  /** 캐릭터 키우기 등 게이미피케이션 사용 여부 */
  useGameification: boolean;
  /** 게이미피케이션 사용 시 캐릭터 (kid와 동일 그리드) */
  character?: ProfileCharacterType;
  themeColor: string;
  createdAt: string;
}

// ──────────────────────────────────────────────
// 통합 프로필 (type으로 구분)
// ──────────────────────────────────────────────

export type AppProfile = KidProfile | PersonalProfile;

/** type 가드: 아이 프로필인지 */
export function isKidProfile(p: AppProfile): p is KidProfile {
  return p.type === 'kid';
}

/** type 가드: 개인 프로필인지 */
export function isPersonalProfile(p: AppProfile): p is PersonalProfile {
  return p.type === 'personal';
}
