/**
 * TTS (Text-to-Speech) 훅 - Web Speech API 기반
 * 비개발자: 말하기 기능을 "밝고 귀여운 여자아이" 목소리로 통일합니다.
 * - 기기별로 가장 비슷한 한국어 목소리를 자동 선택 (iOS: Yuna, Android: Google 한국어 등)
 * - pitch/rate 조절로 어린이 느낌 연출 (MVP). 나중에 Clova 등 유료 TTS로 교체 가능.
 */

'use client'

import { useCallback, useRef, useEffect } from 'react'

// ─── 목소리 우선순위 목록 ─────────────────────────────────────
// 밝고 귀여운 여자아이 느낌에 가장 가까운 한국어 목소리 순서
const PREFERRED_VOICES = [
  // iOS / macOS
  'Yuna',           // iOS 한국어 - 가장 자연스러움
  '유나',
  // Google (Android Chrome)
  'Google 한국의',
  'Google Korean',
  // Samsung TTS
  'Samsung Korean',
  // 공통 fallback
  'ko-KR',
]

// pitch/rate 프리셋 - "밝고 귀여운 여자아이"
const KID_VOICE_PRESET = {
  pitch: 1.55,      // 1.0=기본, 2.0=최고. 1.5~1.6이 어린이 느낌
  rate: 1.05,       // 살짝 빠르게 (너무 빠르면 알아듣기 어려움)
  volume: 1.0,
}

// ─── 훅 옵션 타입 ─────────────────────────────────────────────
interface UseTTSOptions {
  /** TTS 사용 여부 (false면 speak 호출 시 무시) */
  enabled?: boolean
  /** 목소리 스타일: 'kid' = 어린이 느낌, 'default' = 기본 */
  preset?: 'kid' | 'default'
}

/**
 * useTTS - TTS 재생/중지 및 목소리 자동 선택
 * 현재 음성(소리) 비활성화: enabled 옵션과 관계없이 재생하지 않음.
 * @param options.enabled - (현재 무시됨) 나중에 음성 품질 개선 시 다시 켤 수 있음
 * @param options.preset - 'kid' 시 pitch 1.55, rate 1.05 적용
 * @returns speak(text), cancel(), isSpeaking()
 */
export function useTTS({ enabled = false, preset = 'kid' }: UseTTSOptions = {}) {
  // 음성 비활성화: 소리가 불편하므로 일단 항상 끔 (enabled 값 무시)
  const soundDisabled = true
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const isSpeakingRef = useRef(false)

  // 목소리 초기화 - voices는 비동기 로드됨 (Chrome은 onvoiceschanged 필요)
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    const pickVoice = () => {
      const voices = speechSynthesis.getVoices()
      if (voices.length === 0) return

      // 1순위: 선호 목소리 이름 매칭
      for (const name of PREFERRED_VOICES) {
        const match = voices.find((v) =>
          v.name.includes(name) && v.lang.startsWith('ko')
        )
        if (match) {
          selectedVoiceRef.current = match
          console.log('[TTS] 선택된 목소리:', match.name, match.lang)
          return
        }
      }

      // 2순위: ko-KR 여성 목소리 (이름에 'female' 포함)
      const koFemale = voices.find(
        (v) => v.lang.startsWith('ko') && v.name.toLowerCase().includes('female')
      )
      if (koFemale) {
        selectedVoiceRef.current = koFemale
        return
      }

      // 3순위: ko-KR 아무 목소리
      const koAny = voices.find((v) => v.lang.startsWith('ko'))
      if (koAny) {
        selectedVoiceRef.current = koAny
      }
    }

    // Chrome은 onvoiceschanged 이벤트로 로드됨
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = pickVoice
    }
    pickVoice() // 이미 로드돼 있을 경우 즉시 실행
  }, [])

  const speak = useCallback(
    (text: string, options?: Partial<typeof KID_VOICE_PRESET>) => {
      // 음성 비활성화 시 아무 소리도 내지 않음
      if (soundDisabled || !enabled) return
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

      // 이전 발화 취소
      speechSynthesis.cancel()

      const utter = new SpeechSynthesisUtterance(text)
      utter.lang = 'ko-KR'

      // 목소리 적용
      if (selectedVoiceRef.current) {
        utter.voice = selectedVoiceRef.current
      }

      // 프리셋 적용
      const p = preset === 'kid' ? KID_VOICE_PRESET : { pitch: 1.0, rate: 1.0, volume: 1.0 }
      utter.pitch = options?.pitch ?? p.pitch
      utter.rate = options?.rate ?? p.rate
      utter.volume = options?.volume ?? p.volume

      utter.onstart = () => { isSpeakingRef.current = true }
      utter.onend = () => { isSpeakingRef.current = false }
      utter.onerror = () => { isSpeakingRef.current = false }

      speechSynthesis.speak(utter)
    },
    [enabled, preset]
  )

  const cancel = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.cancel()
    }
    isSpeakingRef.current = false
  }, [])

  /** 현재 재생 중인지 (ref 기반이므로 함수 형태) */
  const isSpeaking = useCallback(() => isSpeakingRef.current, [])

  return { speak, cancel, isSpeaking }
}
