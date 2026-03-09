/**
 * 날씨 전역 상태 (Open-Meteo 무료 API 사용, API 키 불필요)
 * 비개발자: 홈 화면 상단에 현재 날씨(기온·설명·이모지)를 보여주기 위해 사용해요.
 * 네트워크 실패 시 기본값(맑음 20°)으로 표시해요.
 */

import { create } from 'zustand'

/** 화면에 표시할 날씨 데이터 */
interface WeatherData {
  temp: number
  desc: string
  emoji: string
}

interface WeatherState {
  weather: WeatherData | null
  fetchWeather: () => Promise<void>
}

/**
 * Open-Meteo weathercode → 이모지 매핑
 * (API 문서: https://open-meteo.com/en/docs#api_form)
 */
function getWeatherEmoji(code: number): string {
  if (code === 0) return '☀️'
  if (code <= 2) return '⛅'
  if (code <= 48) return '🌫️'
  if (code <= 67) return '🌧️'
  if (code <= 77) return '❄️'
  if (code <= 82) return '🌦️'
  if (code <= 99) return '⛈️'
  return '🌤'
}

/** weathercode → 한글 설명 */
function getWeatherDesc(code: number): string {
  if (code === 0) return '맑음'
  if (code <= 2) return '구름 조금'
  if (code <= 48) return '흐림'
  if (code <= 67) return '비'
  if (code <= 77) return '눈'
  if (code <= 82) return '소나기'
  if (code <= 99) return '천둥번개'
  return '흐림'
}

export const useWeatherStore = create<WeatherState>()((set) => ({
  weather: null,

  /** 현재 위치(기본: 서울) 기준 날씨 조회. 실패 시 기본값 설정 */
  fetchWeather: async () => {
    try {
      // 기본값: 서울 (추후 GPS 연동 시 lat, lon 교체 가능)
      const lat = 37.5665
      const lon = 126.978
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      )
      const data = await res.json()
      const code = data.current_weather?.weathercode ?? 0
      const temp = Math.round(data.current_weather?.temperature ?? 0)
      set({
        weather: {
          temp,
          desc: getWeatherDesc(code),
          emoji: getWeatherEmoji(code),
        },
      })
    } catch {
      // 네트워크 오류 등 실패 시 기본값으로 표시
      set({ weather: { temp: 20, desc: '맑음', emoji: '☀️' } })
    }
  },
}))
