/**
 * 루틴 탭 바로 위에 배치되는 주간 날짜 바
 * 비개발자: 오늘 날짜가 포함된 7일을 가로로 보여주며, 오늘은 강조되고 토요일=파랑, 일요일=빨강으로 표시합니다.
 */

'use client'

import { useMemo } from 'react'

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

export function DateBar() {
  const weekDays = useMemo(() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const start = new Date(today)
    start.setDate(today.getDate() - dayOfWeek)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return {
        label: DAY_LABELS[i],
        date: d.getDate(),
        isToday: d.toDateString() === today.toDateString(),
        isSunday: i === 0,
        isSaturday: i === 6,
      }
    })
  }, [])

  return (
    <div className="flex-shrink-0 w-full rounded-2xl bg-[#F5F0E8] px-2 py-2.5 mb-2">
      <div className="flex items-center justify-between gap-1">
        {weekDays.map((day) => (
          <div
            key={`${day.label}-${day.date}`}
            className="flex-1 min-w-0 flex flex-col items-center gap-1"
          >
            <span
              className={`text-[11px] font-bold ${
                day.isToday
                  ? day.isSunday
                    ? 'text-red-500'
                    : day.isSaturday
                      ? 'text-blue-500'
                      : 'text-rose-500'
                  : day.isSunday
                    ? 'text-red-400'
                    : day.isSaturday
                      ? 'text-blue-500'
                      : 'text-gray-600'
              }`}
            >
              {day.label}
            </span>
            {/* 오늘만 흰색 원형 배경, 그 외 날짜는 배경 없이 숫자만 표시 */}
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${day.isToday
                  ? 'bg-white shadow-md border border-gray-200/80 ' +
                    (day.isSunday
                      ? 'text-red-500'
                      : day.isSaturday
                        ? 'text-blue-500'
                        : 'text-rose-500')
                  : day.isSunday
                    ? 'text-red-400'
                    : day.isSaturday
                      ? 'text-blue-500'
                      : 'text-gray-600'
                }
              `}
            >
              {day.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
