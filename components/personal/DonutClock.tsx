'use client'

/**
 * 24시간 도넛 시계 컴포넌트 (자유 슬롯 기반)
 * 비개발자: 한 바퀴가 24시간인 원에 사용자가 추가한 루틴 슬롯을 시간대별 색으로 표시하고, 현재 시각 바늘을 보여줘요.
 */

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { FreeRoutineSlot } from '@/lib/stores/personalRoutineStore'

interface DonutClockProps {
  slots: FreeRoutineSlot[]
}

const SIZE = 280
const CX = SIZE / 2
const CY = SIZE / 2
const OUTER_R = 118
const INNER_R = 72
const STROKE = OUTER_R - INNER_R

const hourToAngle = (hour: number) => (hour / 24) * 360 - 90

/** 시간대별 슬롯 색상 (아침 노랑, 오후 민트, 저녁 핑크, 밤 보라) */
function getSlotColor(startHour: number): string {
  if (startHour >= 6 && startHour < 12) return '#FFD93D'
  if (startHour >= 12 && startHour < 18) return '#A8E6CF'
  if (startHour >= 18 && startHour < 22) return '#FF8FAB'
  return '#B8A9E3'
}

/** 현재 시간대 라벨 (중앙 표시용) */
const PERIOD_META: { start: number; end: number; label: string; emoji: string; color: string }[] = [
  { start: 6, end: 12, label: '아침', emoji: '☀️', color: '#FFD93D' },
  { start: 12, end: 18, label: '오후', emoji: '🌤', color: '#A8E6CF' },
  { start: 18, end: 22, label: '저녁', emoji: '🌆', color: '#FF8FAB' },
  { start: 22, end: 30, label: '밤', emoji: '🌙', color: '#B8A9E3' },
]

/** 슬롯 호(arc)용 dash/offset — startMin·endMin 반영 */
function slotArcPath(
  startHour: number,
  startMin: number,
  endHour: number,
  endMin: number
) {
  const startDecimal = startHour + startMin / 60
  const endDecimal = endHour + endMin / 60
  const r = INNER_R + STROKE * 0.5
  let start = hourToAngle(startDecimal)
  let end = hourToAngle(endDecimal)
  if (end <= start) end += 360
  const circumference = 2 * Math.PI * r
  const fraction = (end - start) / 360
  const dashLen = circumference * fraction
  const offset = ((start + 90) / 360) * circumference
  return { circumference, dashLen, dashOffset: offset, r }
}

export function DonutClock({ slots }: DonutClockProps) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const currentHour = now.getHours() + now.getMinutes() / 60
  const needleAngle = hourToAngle(currentHour)

  const timeStr = now.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const dateStr = now.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })

  const h = now.getHours()
  const currentPeriod =
    PERIOD_META.find(
      (p) => h >= p.start && (p.end > 24 ? h < p.end - 24 || h >= 22 : h < p.end)
    ) ?? PERIOD_META[0]

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="absolute inset-0">
          {/* 배경 링 */}
          <circle
            cx={CX}
            cy={CY}
            r={INNER_R + STROKE / 2}
            fill="none"
            stroke="#F5F5F5"
            strokeWidth={STROKE}
          />

          {/* 루틴 슬롯 (자유 슬롯, 시간대별 색상) */}
          {slots.map((slot) => {
            const { r, circumference, dashLen, dashOffset } = slotArcPath(
              slot.startHour,
              slot.startMin,
              slot.endHour,
              slot.endMin
            )
            const color = getSlotColor(slot.startHour)
            return (
              <circle
                key={slot.id}
                cx={CX}
                cy={CY}
                r={r}
                fill="none"
                stroke={color}
                strokeWidth={4}
                strokeDasharray={`${dashLen} ${circumference}`}
                strokeDashoffset={-dashOffset}
                strokeLinecap="round"
                opacity={slot.isCompleted ? 0.3 : 0.9}
                style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: `${CX}px ${CY}px`,
                }}
              />
            )
          })}

          {/* 시간 눈금 */}
          {[0, 6, 12, 18].map((hr) => {
            const angle = hourToAngle(hr)
            const rad = (angle * Math.PI) / 180
            const x = CX + (OUTER_R + 12) * Math.cos(rad)
            const y = CY + (OUTER_R + 12) * Math.sin(rad)
            return (
              <text
                key={hr}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fill="#BBBBBB"
                fontWeight="600"
              >
                {hr === 0 ? '0' : hr}
              </text>
            )
          })}

          {/* 현재 시간 바늘 */}
          <motion.line
            x1={CX}
            y1={CY}
            x2={
              CX +
              (OUTER_R + 6) * Math.cos((needleAngle * Math.PI) / 180)
            }
            y2={
              CY +
              (OUTER_R + 6) * Math.sin((needleAngle * Math.PI) / 180)
            }
            stroke="#FF8FAB"
            strokeWidth={2.5}
            strokeLinecap="round"
            animate={{
              x2:
                CX +
                (OUTER_R + 6) * Math.cos((needleAngle * Math.PI) / 180),
              y2:
                CY +
                (OUTER_R + 6) * Math.sin((needleAngle * Math.PI) / 180),
            }}
            transition={{ duration: 0.5 }}
          />
          <circle cx={CX} cy={CY} r={5} fill="#FF8FAB" />
        </svg>

        {/* 중앙: 시각 + 날짜 + 현재 시간대 라벨 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-3xl font-black text-gray-700 tracking-tight">
            {timeStr}
          </p>
          <p className="text-xs text-gray-400 mt-1">{dateStr}</p>
          <div
            className="mt-2 flex items-center gap-1 px-3 py-1 rounded-full"
            style={{ backgroundColor: currentPeriod.color + '33' }}
          >
            <span className="text-sm">{currentPeriod.emoji}</span>
            <span
              className="text-xs font-bold"
              style={{ color: currentPeriod.color }}
            >
              {currentPeriod.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
