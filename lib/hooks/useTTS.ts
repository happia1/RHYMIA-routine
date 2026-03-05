// lib/hooks/useTTS.ts
'use client';

import { useCallback, useRef } from 'react';

interface TTSOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  onEnd?: () => void;
}

export function useTTS(defaultOptions: TTSOptions = {}) {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback(
    (text: string, options: TTSOptions = {}) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;

      // 이전 발화 중단
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang ?? defaultOptions.lang ?? 'ko-KR';
      utterance.rate = options.rate ?? defaultOptions.rate ?? 0.9;
      utterance.pitch = options.pitch ?? defaultOptions.pitch ?? 1.1; // 약간 높은 피치로 친근하게
      utterance.volume = options.volume ?? defaultOptions.volume ?? 1;

      if (options.onEnd ?? defaultOptions.onEnd) {
        utterance.onend = options.onEnd ?? defaultOptions.onEnd ?? null;
      }

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [defaultOptions]
  );

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const speakRoutineStart = useCallback(
    (routineTitle: string) => {
      speak(`${routineTitle} 시작할게요! 오늘도 잘 할 수 있어요!`);
    },
    [speak]
  );

  const speakItemComplete = useCallback(
    (itemLabel: string) => {
      const praises = [
        `${itemLabel} 완료! 잘했어요!`,
        `우와, ${itemLabel} 했어요! 최고!`,
        `${itemLabel} 성공! 대단해요!`,
      ];
      const random = praises[Math.floor(Math.random() * praises.length)];
      speak(random);
    },
    [speak]
  );

  const speakRoutineComplete = useCallback(() => {
    speak('와아! 오늘 루틴을 모두 완료했어요! 정말 대단해요! 칭찬 스티커를 받을 자격이 있어요!');
  }, [speak]);

  return { speak, stop, speakRoutineStart, speakItemComplete, speakRoutineComplete };
}
