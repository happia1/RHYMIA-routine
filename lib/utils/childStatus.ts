/**
 * 자녀 시간대별 상태 유틸
 * 비개발자: 등원 전/등원 후(유치원·학교 활동 중)/저녁(잠자리까지 남은 시간)을 현재 시각 기준으로 계산해요.
 */

import type { FamilyProfile } from '@/types/profile'

export type ChildStatusType =
  | 'departure'      // 등원 전: 출발까지 N분
  | 'at_institution' // 등원 후 ~ 하원 전: 유치원/학교 활동 중
  | 'bedtime'        // 저녁: 잠자리까지 N분
  | null             // 표시할 상태 없음

export interface ChildStatusResult {
  type: ChildStatusType
  /** 표시 문구 (예: "유치원 활동 중", "잠자리까지 1시간 30분") */
  label: string
  /** 출발/잠자리까지 남은 분 (타입이 departure 또는 bedtime일 때) */
  minutesRemaining?: number
}

const INSTITUTION_LABELS: Record<string, string> = {
  kindergarten: '유치원',
  daycare: '어린이집',
  elementary: '학교',
}

/**
 * 현재 시각 기준 자녀의 시간대별 상태와 표시 문구를 반환합니다.
 */
export function getChildStatus(profile: FamilyProfile): ChildStatusResult | null {
  const settings = profile.childSettings
  if (!settings) return null

  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const arrival = settings.arrivalTime
  const returnTime = settings.returnTime
  const departureTime = settings.departureTime
  const bedtime = settings.bedtime

  // 등원·하원 시간이 있으면: 등원 전 → 출발 카운트다운, 등원~하원 → 활동 중, 저녁 → 잠자리 카운트다운
  if (arrival && departureTime) {
    const [ah, am] = arrival.split(':').map(Number)
    const arrivalMinutes = ah * 60 + am
    const [dh, dm] = departureTime.split(':').map(Number)
    const departureMinutes = dh * 60 + dm

    // 등원 시간 지남 ~ 하원 전: 유치원/학교 활동 중
    if (returnTime) {
      const [rh, rm] = returnTime.split(':').map(Number)
      const returnMinutes = rh * 60 + rm
      if (currentMinutes >= arrivalMinutes && currentMinutes < returnMinutes) {
        const inst = settings.institutionType
        const place = inst ? INSTITUTION_LABELS[inst] ?? '기관' : '유치원'
        return {
          type: 'at_institution',
          label: `${place} 활동 중`,
        }
      }
    } else if (currentMinutes >= arrivalMinutes && currentMinutes < 18 * 60) {
      const inst = settings.institutionType
      const place = inst ? INSTITUTION_LABELS[inst] ?? '기관' : '유치원'
      return { type: 'at_institution', label: `${place} 활동 중` }
    }

    // 등원 전: 출발까지 남은 시간 (출발 2시간 전부터 표시, 아침 시간대 5~12시)
    const morningStart = 5 * 60
    const morningEnd = 12 * 60
    if (
      currentMinutes < departureMinutes &&
      currentMinutes >= Math.max(morningStart, departureMinutes - 120) &&
      currentMinutes < arrivalMinutes
    ) {
      const diff = departureMinutes - currentMinutes
      if (diff > 0) {
        const m = Math.floor(diff / 60)
        const s = diff % 60
        const timeStr = m > 0 ? `${m}시간 ${s}분` : `${s}분`
        return {
          type: 'departure',
          label: `출발까지 ${timeStr}`,
          minutesRemaining: diff,
        }
      }
      return {
        type: 'departure',
        label: '지금 출발하세요!',
        minutesRemaining: 0,
      }
    }
  }

  // 저녁: 잠자리까지 남은 시간 (취침 2시간 전부터 표시)
  if (bedtime) {
    const [bh, bm] = bedtime.split(':').map(Number)
    let bedtimeMinutes = bh * 60 + bm
    if (bedtimeMinutes < 12 * 60) bedtimeMinutes += 24 * 60
    const twoHoursBefore = bedtimeMinutes - 120
    const eveningStart = 17 * 60
    if (currentMinutes >= eveningStart && currentMinutes < bedtimeMinutes) {
      const diff = bedtimeMinutes - currentMinutes
      const m = Math.floor(diff / 60)
      const s = diff % 60
      const timeStr = m > 0 ? `${m}시간 ${s}분` : `${s}분`
      return {
        type: 'bedtime',
        label: `잠자리까지 ${timeStr}`,
        minutesRemaining: diff,
      }
    }
  }

  return null
}
