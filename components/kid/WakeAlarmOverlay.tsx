/**
 * 아침 기상 시간에 뜨는 알람 오버레이 (소리 재생 + 알람 끄기 버튼)
 * 비개발자: 설정한 기상 시간이 되면 이 화면이 떠서 알람이 울려요. "알람 끄기"를 누르면 소리가 멈춥니다.
 */

'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface WakeAlarmOverlayProps {
  onDismiss: () => void
}

/** 알람 비프음 반복 재생 (언마운트 시 자동 정지) */
function useAlarmSound(playing: boolean) {
  useEffect(() => {
    if (!playing) return
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const playBeep = () => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.setValueAtTime(880, ctx.currentTime)
      o.frequency.setValueAtTime(660, ctx.currentTime + 0.3)
      o.frequency.setValueAtTime(880, ctx.currentTime + 0.6)
      g.gain.setValueAtTime(0.12, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8)
      o.connect(g)
      g.connect(ctx.destination)
      o.start(ctx.currentTime)
      o.stop(ctx.currentTime + 0.8)
    }
    playBeep()
    const id = setInterval(playBeep, 1200)
    return () => {
      clearInterval(id)
      ctx.close()
    }
  }, [playing])
}

export function WakeAlarmOverlay({ onDismiss }: WakeAlarmOverlayProps) {
  useAlarmSound(true)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-b from-[#FFD93D] to-[#FF8FAB] flex flex-col items-center justify-center z-50 p-8"
    >
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="text-8xl mb-6"
      >
        ⏰
      </motion.div>
      <h1 className="text-3xl font-black text-white text-center mb-2">좋은 아침이에요!</h1>
      <p className="text-white/90 text-lg text-center mb-10">오늘의 루틴을 시작해볼까요?</p>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onDismiss}
        className="bg-white text-[#FF8FAB] font-black text-xl px-12 py-4 rounded-full shadow-xl"
      >
        알람 끄기
      </motion.button>
    </motion.div>
  )
}
