/**
 * 밤/낮·기상 시간 판별 유틸
 * 비개발자: "지금이 밤인지", "기상 알람 시간이 됐는지"를 판단할 때 씁니다.
 */

/** 밤 시간대: 21:00(오후 9시) ~ 05:59(다음날 새벽 5시 59분) → 캐릭터 잠자는 화면 표시 */
const NIGHT_START_HOUR = 21
const NIGHT_END_HOUR = 6

/**
 * 현재 시간이 "밤"인지 (캐릭터 잠자는 화면을 보여줄 시간인지)
 * 21:00 ~ 05:59 사이면 true
 */
export function isNightTime(): boolean {
  const now = new Date()
  const hour = now.getHours()
  if (hour >= NIGHT_START_HOUR) return true
  if (hour < NIGHT_END_HOUR) return true
  return false
}

/**
 * 현재 시간이 설정한 기상 알람 시간에 도달했는지 (아침에 미션 화면 + 알람 재생할 시점인지)
 * wakeTime "07:00" 형식, 오전 5시~11시 사이만 "기상 시간대"로 봄
 */
export function isWakeTimeNow(wakeTime: string): boolean {
  const [wh, wm] = wakeTime.split(':').map(Number)
  const now = new Date()
  const hour = now.getHours()
  const min = now.getMinutes()
  // 설정한 시각이 되었거나, 그 시각이 지났고 아직 오전(12시 전)인 경우
  if (hour > wh) return hour < 12
  if (hour === wh && min >= wm) return true
  return false
}

/**
 * 오늘이 기상 시간대(알람 울릴 수 있는 구간)인지
 * 예: 07:00 설정이면 06:00~12:00 사이를 "기상 시간대"로 봄
 */
export function isInWakeWindow(wakeTime: string): boolean {
  const [wh] = wakeTime.split(':').map(Number)
  const now = new Date()
  const hour = now.getHours()
  return hour >= wh - 1 && hour < 12
}

/** 아침 시간대: 05:00 ~ 11:59 → 아침 루틴 화면 자동 표시용 */
const MORNING_START_HOUR = 5
const MORNING_END_HOUR = 12

/** 저녁 시간대: 17:00 ~ 20:59 → 저녁 루틴 화면 자동 표시용 */
const EVENING_START_HOUR = 17
const EVENING_END_HOUR = 21

/**
 * 현재가 아침 시간대인지 (자동으로 아침 루틴 화면을 보여줄 시간인지)
 * 05:00 ~ 11:59 사이면 true
 */
export function isMorningTime(): boolean {
  const hour = new Date().getHours()
  return hour >= MORNING_START_HOUR && hour < MORNING_END_HOUR
}

/**
 * 현재가 저녁 시간대인지 (자동으로 저녁 루틴 화면을 보여줄 시간인지)
 * 17:00 ~ 20:59 사이면 true
 */
export function isEveningTime(): boolean {
  const hour = new Date().getHours()
  return hour >= EVENING_START_HOUR && hour < EVENING_END_HOUR
}
