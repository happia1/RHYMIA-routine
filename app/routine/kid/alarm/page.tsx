/**
 * 아이용 시간·알람 설정 화면
 * 비개발자: 기상 알람 on/off, 일어날 시간, 집 나서는 시간, 등원·하원·자러 갈 시간을
 * 온보딩에서 설정한 것처럼 여기서 수정할 수 있어요.
 */

'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useKidRoutineStore, selectWakeAlarmTime, selectAlarmEnabled } from '@/lib/stores/kidRoutineStore'
import { useProfileStore } from '@/lib/stores/profileStore'
import { useEffect } from 'react'

function toHHmm(h: number, m: number): string {
  return `${String(Math.min(23, Math.max(0, h))).padStart(2, '0')}:${String(Math.min(59, Math.max(0, m))).padStart(2, '0')}`
}

function parseHHmm(s: string | null | undefined): [number, number] {
  if (!s || !/^\d{1,2}:\d{2}$/.test(s)) return [7, 0]
  const [h, m] = s.split(':').map(Number)
  return [h ?? 7, m ?? 0]
}

/**
 * 한 줄 시간 입력 (라벨 + 시/분)
 * 비개발자: "7시 0분"처럼 시·분을 입력하는 한 줄 블록이에요.
 */
function TimeRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (next: string) => void
}) {
  const [hour, minute] = parseHHmm(value)
  const setHour = (h: number) => onChange(toHHmm(h, minute))
  const setMinute = (m: number) => onChange(toHHmm(hour, m))
  return (
    <div className="py-4 border-b border-gray-100 last:border-b-0">
      <p className="font-bold text-gray-700 mb-2">{label}</p>
      <div className="flex items-center justify-center gap-2">
        <input
          type="number"
          min={0}
          max={23}
          value={hour}
          onChange={(e) => setHour(Number(e.target.value) || 0)}
          className="w-14 h-12 text-center text-xl font-black rounded-xl border-2 border-gray-200 bg-gray-50"
        />
        <span className="text-gray-500 font-bold">시</span>
        <input
          type="number"
          min={0}
          max={59}
          value={minute}
          onChange={(e) => setMinute(Number(e.target.value) || 0)}
          className="w-14 h-12 text-center text-xl font-black rounded-xl border-2 border-gray-200 bg-gray-50"
        />
        <span className="text-gray-500 font-bold">분</span>
      </div>
    </div>
  )
}

/**
 * 시간 입력 + 알람 온/오프 토글이 있는 한 줄
 * 비개발자: 각 설정 시간(집 나서는 시간, 등원 시간 등)마다 "이 시간에 알람 켜기/끄기" 버튼을 붙인 블록이에요.
 */
function TimeRowWithAlarm({
  label,
  value,
  onChange,
  alarmEnabled,
  onAlarmChange,
}: {
  label: string
  value: string
  onChange: (next: string) => void
  alarmEnabled: boolean
  onAlarmChange: (enabled: boolean) => void
}) {
  const [hour, minute] = parseHHmm(value)
  const setHour = (h: number) => onChange(toHHmm(h, minute))
  const setMinute = (m: number) => onChange(toHHmm(hour, m))
  return (
    <div className="py-4 border-b border-gray-100 last:border-b-0">
      {/* 라벨과 알람 토글을 한 줄에 배치 */}
      <div className="flex items-center justify-between mb-2">
        <p className="font-bold text-gray-700">{label}</p>
        <button
          role="switch"
          aria-checked={alarmEnabled}
          aria-label={`${label} 알람 ${alarmEnabled ? '끄기' : '켜기'}`}
          onClick={() => onAlarmChange(!alarmEnabled)}
          className={`relative w-14 h-8 rounded-full transition-colors flex-shrink-0 ${alarmEnabled ? 'bg-amber-500' : 'bg-gray-200'}`}
        >
          <span
            className="absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform duration-200"
            style={{ left: alarmEnabled ? '1.5rem' : '0.25rem' }}
          />
        </button>
      </div>
      <div className="flex items-center justify-center gap-2">
        <input
          type="number"
          min={0}
          max={23}
          value={hour}
          onChange={(e) => setHour(Number(e.target.value) || 0)}
          className="w-14 h-12 text-center text-xl font-black rounded-xl border-2 border-gray-200 bg-gray-50"
        />
        <span className="text-gray-500 font-bold">시</span>
        <input
          type="number"
          min={0}
          max={59}
          value={minute}
          onChange={(e) => setMinute(Number(e.target.value) || 0)}
          className="w-14 h-12 text-center text-xl font-black rounded-xl border-2 border-gray-200 bg-gray-50"
        />
        <span className="text-gray-500 font-bold">분</span>
      </div>
    </div>
  )
}

export default function KidAlarmSettingsPage() {
  const router = useRouter()
  const activeProfile = useProfileStore((s) => s.getActiveProfile())
  const updateProfile = useProfileStore((s) => s.updateProfile)
  const setCurrentProfileId = useKidRoutineStore((s) => s.setCurrentProfileId)
  const wakeAlarmTime = useKidRoutineStore(selectWakeAlarmTime)
  const alarmEnabled = useKidRoutineStore(selectAlarmEnabled)
  const setWakeAlarmTime = useKidRoutineStore((s) => s.setWakeAlarmTime)
  const setAlarmEnabled = useKidRoutineStore((s) => s.setAlarmEnabled)

  useEffect(() => {
    setCurrentProfileId(activeProfile?.id ?? null)
  }, [activeProfile?.id, setCurrentProfileId])

  const cs = activeProfile?.childSettings ?? {}
  const departureTime = cs.departureTime ?? '08:00'
  const arrivalTime = cs.arrivalTime ?? '09:00'
  const returnTime = cs.returnTime ?? '14:00'
  const bedtime = cs.bedtime ?? '21:00'
  // 각 시간별 알람 on/off (없으면 기본 켜짐)
  const alarmDepartureEnabled = cs.alarmDepartureEnabled ?? true
  const alarmArrivalEnabled = cs.alarmArrivalEnabled ?? true
  const alarmReturnEnabled = cs.alarmReturnEnabled ?? true
  const alarmBedtimeEnabled = cs.alarmBedtimeEnabled ?? true

  const updateChildSettings = (patch: Partial<NonNullable<typeof cs>>) => {
    if (!activeProfile?.id) return
    updateProfile(activeProfile.id, {
      childSettings: { ...cs, ...patch },
    })
  }

  const handleWakeChange = (next: string) => {
    setWakeAlarmTime(next)
    updateChildSettings({ wakeTime: next })
  }

  return (
    <div className="min-h-screen bg-[#FFF9F0] px-5 py-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.replace('/routine/kid')}
          className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-700">시간 설정</h1>
          <p className="text-gray-400 text-sm">기상·등하원·취침 시간을 정해요</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
      >
        {/* 안내 문구: 각 시간마다 알람 on/off 가능 */}
        <div className="pb-4 border-b border-gray-100">
          <p className="text-sm text-gray-400">설정한 시간에 알람이 울려요. 각 항목에서 알람을 켜거나 끌 수 있어요.</p>
        </div>

        {/* 일어날 시간 (기상 알람): 행에 토글 포함 */}
        <TimeRowWithAlarm
          label="일어날 시간 (기상 알람)"
          value={wakeAlarmTime}
          onChange={handleWakeChange}
          alarmEnabled={alarmEnabled}
          onAlarmChange={setAlarmEnabled}
        />
        {/* 아래 네 가지 시간은 각각 알람 온/오프 토글 있음 */}
        <TimeRowWithAlarm
          label="집 나서는 시간"
          value={departureTime}
          onChange={(v) => updateChildSettings({ departureTime: v })}
          alarmEnabled={alarmDepartureEnabled}
          onAlarmChange={(enabled) => updateChildSettings({ alarmDepartureEnabled: enabled })}
        />
        <TimeRowWithAlarm
          label="등원 시간"
          value={arrivalTime}
          onChange={(v) => updateChildSettings({ arrivalTime: v })}
          alarmEnabled={alarmArrivalEnabled}
          onAlarmChange={(enabled) => updateChildSettings({ alarmArrivalEnabled: enabled })}
        />
        <TimeRowWithAlarm
          label="하원 시간"
          value={returnTime}
          onChange={(v) => updateChildSettings({ returnTime: v })}
          alarmEnabled={alarmReturnEnabled}
          onAlarmChange={(enabled) => updateChildSettings({ alarmReturnEnabled: enabled })}
        />
        <TimeRowWithAlarm
          label="자러 갈 시간"
          value={bedtime}
          onChange={(v) => updateChildSettings({ bedtime: v })}
          alarmEnabled={alarmBedtimeEnabled}
          onAlarmChange={(enabled) => updateChildSettings({ alarmBedtimeEnabled: enabled })}
        />
      </motion.div>

      <p className="text-gray-400 text-sm mt-6 text-center">
        상단 배너에서 다음 시간까지 남은 시간을 볼 수 있어요.
      </p>
    </div>
  )
}
