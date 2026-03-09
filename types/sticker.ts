/**
 * 칭찬 스티커·여행 지도 타입 정의
 * 비개발자: 엄마가 아이에게 주는 스티커(별/트로피 등)와, 스티커를 붙여 나가는 20칸 여행 지도 타일 정보예요.
 */

export interface Sticker {
  id: string
  emoji: string
  label: string
  fromName: string
  receivedAt: string
  isPlaced: boolean
  mapPosition?: number
}

export type StickerEmoji =
  | '⭐'
  | '🌟'
  | '💫'
  | '🏆'
  | '❤️'
  | '🎖️'

export const STICKER_LABELS: Record<StickerEmoji, string> = {
  '⭐': '루틴 완료',
  '🌟': '특별히 잘했어요',
  '💫': '스스로 해냈어요',
  '🏆': '마일스톤 달성',
  '❤️': '사랑을 담아서',
  '🎖️': '도전 성공',
}

export interface MapTile {
  position: number
  label: string
  emoji: string
  rewardEmoji: string
  isCheckpoint: boolean
}

export const MAP_TILES: MapTile[] = [
  { position: 0, label: '우리집', emoji: '🏠', rewardEmoji: '🎀', isCheckpoint: false },
  { position: 1, label: '꽃밭', emoji: '🌸', rewardEmoji: '🌷', isCheckpoint: false },
  { position: 2, label: '냇가', emoji: '🌊', rewardEmoji: '🐟', isCheckpoint: false },
  { position: 3, label: '숲속', emoji: '🌲', rewardEmoji: '🍄', isCheckpoint: false },
  { position: 4, label: '언덕', emoji: '⛰️', rewardEmoji: '🌈', isCheckpoint: false },
  { position: 5, label: '마을', emoji: '🏡', rewardEmoji: '🍰', isCheckpoint: true },
  { position: 6, label: '시장', emoji: '🏪', rewardEmoji: '🍬', isCheckpoint: false },
  { position: 7, label: '강가', emoji: '🏞️', rewardEmoji: '🦋', isCheckpoint: false },
  { position: 8, label: '동굴', emoji: '🗿', rewardEmoji: '💎', isCheckpoint: false },
  { position: 9, label: '해변', emoji: '🏖️', rewardEmoji: '🐚', isCheckpoint: false },
  { position: 10, label: '섬', emoji: '🏝️', rewardEmoji: '🌴', isCheckpoint: true },
  { position: 11, label: '구름위', emoji: '☁️', rewardEmoji: '🌟', isCheckpoint: false },
  { position: 12, label: '설산', emoji: '🏔️', rewardEmoji: '❄️', isCheckpoint: false },
  { position: 13, label: '사막', emoji: '🏜️', rewardEmoji: '🌵', isCheckpoint: false },
  { position: 14, label: '정글', emoji: '🌴', rewardEmoji: '🦜', isCheckpoint: false },
  { position: 15, label: '왕국', emoji: '🏰', rewardEmoji: '👑', isCheckpoint: true },
  { position: 16, label: '우주선', emoji: '🚀', rewardEmoji: '🛸', isCheckpoint: false },
  { position: 17, label: '달나라', emoji: '🌙', rewardEmoji: '🌕', isCheckpoint: false },
  { position: 18, label: '별나라', emoji: '⭐', rewardEmoji: '🌠', isCheckpoint: false },
  { position: 19, label: '무지개 끝', emoji: '🌈', rewardEmoji: '🏆', isCheckpoint: true },
]
