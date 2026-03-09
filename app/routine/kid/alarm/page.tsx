/**
 * 아이용 기상 알람 설정 화면
 * 비개발자: 아침에 알람이 울릴 시간을 정하고, 알람을 켜거나 끌 수 있어요.
 */

'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useKidRoutineStore, selectWakeAlarmTime, selectAlarmEnabled } from '@/lib/stores/kidRoutineStore'
import { useProfileStore } from '@/lib/stores/profileStore'
import { useEffect } from 'react'

export default function KidAlarmSettingsPage() {
  const router = useRouter()
  const activeProfile = useProfileStore((s) => s.getActiveProfile())
  const setCurrentProfileId = useKidRoutineStore((s) => s.setCurrentProfileId)
  const wakeAlarmTime = useKidRoutineStore(selectWakeAlarmTime)
  const alarmEnabled = useKidRoutineStore(selectAlarmEnabled)
  const setWakeAlarmTime = useKidRoutineStore((s) => s.setWakeAlarmTime)
  const setAlarmEnabled = useKidRoutineStore((s) => s.setAlarmEnabled)

  useEffect(() => {
    setCurrentProfileId(activeProfile?.id ?? null)
  }, [activeProfile?.id, setCurrentProfileId])

  // "07:00" → { hour: 7, minute: 0 } 로 분리
  const [hour, minute] = wakeAlarmTime.split(':').map(Number)

  const handleHourChange = (h: number) => {
    const hh = Math.min(23, Math.max(0, h))
    setWakeAlarmTime(`${String(hh).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)
  }

  const handleMinuteChange = (m: number) => {
    const mm = Math.min(59, Math.max(0, m))
    setWakeAlarmTime(`${String(hour).padStart(2, '0')}:${String(mm).padStart(2, '0')}`)
  }

  return (
    <div className="min-h-screen bg-[#FFF9F0] px-5 py-8">
      {/* 상단: 뒤로가기 + 제목 */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.replace('/routine/kid')}
          className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-700">알람 설정</h1>
          <p className="text-gray-400 text-sm">아침 기상 시간을 정해요</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 shadow-lg border border-pink-50"
      >
        {/* 알람 on/off */}
        <div className="flex items-center justify-between py-4 border-b border-gray-100">
          <div>
            <p className="font-bold text-gray-700">기상 알람</p>
            <p className="text-sm text-gray-400">설정한 시간에 알람이 울려요</p>
          </div>
          <button
            role="switch"
            aria-checked={alarmEnabled}
            onClick={() => setAlarmEnabled(!alarmEnabled)}
            className={`
              relative w-14 h-8 rounded-full transition-colors
              ${alarmEnabled ? 'bg-[#FF8FAB]' : 'bg-gray-200'}
            `}
          >
            <span
              className="absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform duration-200"
              style={{ left: alarmEnabled ? '1.5rem' : '0.25rem' }}
            />
          </button>
        </div>

        {/* 기상 시간 선택 */}
        <div className="py-6">
          <p className="font-bold text-gray-700 mb-3">기상 시간</p>
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={23}
                value={hour}
                onChange={(e) => handleHourChange(Number(e.target.value) || 0)}
                className="w-16 h-14 text-center text-2xl font-black rounded-xl border-2 border-pink-100 bg-[#FFF9F0]"
              />
              <span className="text-gray-500 font-bold">시</span>
            </div>
            <span className="text-2xl font-black text-gray-300">:</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={59}
                value={minute}
                onChange={(e) => handleMinuteChange(Number(e.target.value) || 0)}
                className="w-16 h-14 text-center text-2xl font-black rounded-xl border-2 border-pink-100 bg-[#FFF9F0]"
              />
              <span className="text-gray-500 font-bold">분</span>
            </div>
          </div>
          <p className="text-center text-gray-400 text-sm mt-3">
            {hour < 12 ? '오전' : '오후'} {hour % 12 || 12}시 {minute}분에 알람이 울려요
          </p>
        </div>
      </motion.div>

      <p className="text-gray-400 text-sm mt-6 text-center">
        밤 9시~새벽 6시에는 잠자는 화면이 보이고,<br />
        기상 시간이 되면 미션 화면으로 바뀌며 알람이 울려요.
      </p>
    </div>
  )
}
