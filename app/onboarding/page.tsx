'use client';

/**
 * 온보딩: 누구를 위한 루틴인지 선택 후 아이/개인 플로우
 * step 1~5, framer-motion 슬라이드, 완료 시 addProfile 후 / 로 이동
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfileStore } from '@/lib/stores/profileStore';
import RimiCharacter from '@/components/shared/RimiCharacter';
import type {
  AppProfile,
  KidProfile,
  PersonalProfile,
  InstitutionType,
  ProfileCharacterType,
  AgeGroupType,
} from '@/types/profile';

const CHARACTERS: { key: ProfileCharacterType; emoji: string; label: string }[] = [
  { key: 'penguin', emoji: '🐧', label: '리미' },
  { key: 'dog', emoji: '🐶', label: '강아지' },
  { key: 'cat', emoji: '🐱', label: '고양이' },
  { key: 'rabbit', emoji: '🐰', label: '토끼' },
  { key: 'hamster', emoji: '🐹', label: '햄스터' },
  { key: 'sunflower', emoji: '🌻', label: '해바라기' },
];

const THEME_COLORS = [
  { name: '핑크', hex: '#FF8FAB' },
  { name: '블루', hex: '#74B9FF' },
  { name: '민트', hex: '#A8E6CF' },
  { name: '노랑', hex: '#FFEAA7' },
  { name: '하늘', hex: '#81ECEC' },
  { name: '보라', hex: '#DDA0DD' },
];

const INSTITUTIONS: { key: InstitutionType; emoji: string; label: string; desc: string }[] = [
  { key: 'home', emoji: '🏠', label: '가정보육', desc: '집에서' },
  { key: 'daycare', emoji: '🧸', label: '어린이집', desc: '어린이집 다녀요' },
  { key: 'kindergarten', emoji: '🎒', label: '유치원', desc: '유치원 다녀요' },
];

const AGE_GROUPS: { key: AgeGroupType; emoji: string; label: string }[] = [
  { key: 'elementary', emoji: '🎒', label: '초등학생' },
  { key: 'middle-high', emoji: '📚', label: '중고등학생' },
  { key: 'adult', emoji: '🎓', label: '대학생·성인' },
];

const GOAL_OPTIONS: { key: string; emoji: string; label: string }[] = [
  { key: 'health', emoji: '💪', label: '건강' },
  { key: 'study', emoji: '📖', label: '공부' },
  { key: 'mind', emoji: '🧘', label: '마음건강' },
  { key: 'growth', emoji: '💼', label: '자기계발' },
  { key: 'exercise', emoji: '🏃', label: '운동' },
  { key: 'sleep', emoji: '😴', label: '수면' },
];

const RECOMMENDED_TIMES: Record<InstitutionType, { morning: string; evening: string }> = {
  daycare: { morning: '07:00', evening: '19:00' },
  kindergarten: { morning: '08:00', evening: '19:30' },
  home: { morning: '08:30', evening: '20:00' },
};

function generateId(): string {
  return `profile-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function OnboardingPage() {
  const router = useRouter();
  const addProfile = useProfileStore((s) => s.addProfile);

  const [step, setStep] = useState(1);
  const [flow, setFlow] = useState<'kid' | 'personal' | null>(null);

  // Kid
  const [kidName, setKidName] = useState('');
  const [kidAge, setKidAge] = useState<number | null>(null);
  const [institution, setInstitution] = useState<InstitutionType | null>(null);
  const [character, setCharacter] = useState<ProfileCharacterType | null>(null);
  const [themeColor, setThemeColor] = useState(THEME_COLORS[0].hex);
  const [morningTime, setMorningTime] = useState('07:00');
  const [eveningTime, setEveningTime] = useState('19:00');
  const [alarmOn, setAlarmOn] = useState(false);
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');

  // Personal
  const [personalName, setPersonalName] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroupType | null>(null);
  const [goals, setGoals] = useState<string[]>([]);
  const [useGameification, setUseGameification] = useState<boolean | null>(null);
  const [personalCharacter, setPersonalCharacter] = useState<ProfileCharacterType | null>(null);
  const [personalTheme, setPersonalTheme] = useState(THEME_COLORS[0].hex);

  const totalSteps = 5;
  const isKid = flow === 'kid';
  const isPersonal = flow === 'personal';

  const goNext = useCallback(() => {
    setStep((s) => Math.min(s + 1, totalSteps));
  }, []);

  const goBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const handleFlowSelect = useCallback((f: 'kid' | 'personal') => {
    setFlow(f);
    setStep(2);
  }, []);

  const toggleGoal = useCallback((key: string) => {
    setGoals((prev) => (prev.includes(key) ? prev.filter((g) => g !== key) : [...prev, key]));
  }, []);

  const saveAndFinish = useCallback(() => {
    const now = new Date().toISOString();
    if (isKid && kidName && kidAge !== null && institution !== null && character !== null && pin.length === 4 && pin === pinConfirm) {
      const profile: KidProfile = {
        type: 'kid',
        id: generateId(),
        name: kidName,
        age: kidAge,
        institution,
        character,
        themeColor,
        pin,
        createdAt: now,
      };
      addProfile(profile);
      router.replace('/');
    } else if (isPersonal && personalName && ageGroup !== null && useGameification !== null) {
      const profile: PersonalProfile = {
        type: 'personal',
        id: generateId(),
        name: personalName,
        ageGroup,
        goals,
        useGameification,
        character: useGameification ? personalCharacter ?? undefined : undefined,
        themeColor: personalTheme,
        createdAt: now,
      };
      addProfile(profile);
      router.replace('/');
    }
  }, [isKid, isPersonal, kidName, kidAge, institution, character, pin, pinConfirm, themeColor, personalName, ageGroup, goals, useGameification, personalCharacter, personalTheme, addProfile, router]);

  // Step 1: 누구를 위한 루틴?
  if (step === 1 && !flow) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-teal-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex justify-center gap-1 mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-pink-500' : 'bg-gray-300'}`}
              />
            ))}
          </div>
          <RimiCharacter mood="waving" size="lg" className="mb-8" />
          <p className="text-center text-gray-600 mb-6">누구를 위한 루틴인가요?</p>
          <div className="space-y-4">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => handleFlowSelect('kid')}
              className="w-full py-5 rounded-2xl bg-pink-400 text-white text-xl font-bold shadow-lg flex items-center justify-center gap-2"
            >
              👶 우리 아이 루틴
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => handleFlowSelect('personal')}
              className="w-full py-5 rounded-2xl bg-teal-400 text-white text-xl font-bold shadow-lg flex items-center justify-center gap-2"
            >
              🙋 나의 루틴
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // Kid step 2: 이름, 나이, 기관
  if (isKid && step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-teal-50 p-6 pt-12">
        <div className="flex justify-center gap-1 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${i <= 2 ? 'bg-pink-500' : 'bg-gray-300'}`}
            />
          ))}
        </div>
        <motion.div
          key="kid-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-md mx-auto"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">아이 정보</h2>
          <input
            type="text"
            value={kidName}
            onChange={(e) => setKidName(e.target.value)}
            placeholder="이름"
            className="w-full border-2 border-gray-200 rounded-xl p-4 text-lg mb-6 focus:border-pink-400 outline-none"
          />
          <p className="text-gray-600 mb-2">나이</p>
          <div className="grid grid-cols-5 gap-2 mb-6">
            {[3, 4, 5, 6, 7].map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setKidAge(a)}
                className={`py-3 rounded-xl font-medium ${
                  kidAge === a ? 'bg-pink-400 text-white' : 'bg-white border-2 border-gray-200'
                }`}
              >
                {a}세
              </button>
            ))}
          </div>
          <p className="text-gray-600 mb-2">기관</p>
          <div className="space-y-2 mb-8">
            {INSTITUTIONS.map((inst) => (
              <button
                key={inst.key}
                type="button"
                onClick={() => {
                  setInstitution(inst.key);
                  const t = RECOMMENDED_TIMES[inst.key];
                  setMorningTime(t.morning);
                  setEveningTime(t.evening);
                }}
                className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 ${
                  institution === inst.key ? 'border-pink-400 bg-pink-50' : 'border-gray-200'
                }`}
              >
                <span className="text-2xl">{inst.emoji}</span>
                <div className="text-left">
                  <p className="font-medium">{inst.label}</p>
                  <p className="text-sm text-gray-500">{inst.desc}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={goBack}
              className="py-3 px-6 rounded-xl border-2 border-gray-300"
            >
              뒤로
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!kidName || kidAge === null || institution === null}
              className="flex-1 py-3 rounded-xl bg-pink-400 text-white font-bold disabled:opacity-50"
            >
              다음
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Kid step 3: 캐릭터 & 색상
  if (isKid && step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-teal-50 p-6 pt-12">
        <div className="flex justify-center gap-1 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${i <= 3 ? 'bg-pink-500' : 'bg-gray-300'}`}
            />
          ))}
        </div>
        <motion.div
          key="kid-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-md mx-auto"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-2">어떤 친구를 키울래요?</h2>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {CHARACTERS.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setCharacter(c.key)}
                className={`p-4 rounded-xl border-2 flex flex-col items-center ${
                  character === c.key ? 'border-pink-400 bg-pink-50' : 'border-gray-200'
                }`}
              >
                <span className="text-3xl">{c.emoji}</span>
                <span className="text-xs mt-1">{c.label}</span>
              </button>
            ))}
          </div>
          <p className="text-gray-600 mb-2">좋아하는 색깔은?</p>
          <div className="flex flex-wrap gap-3 mb-8">
            {THEME_COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setThemeColor(c.hex)}
                className={`w-12 h-12 rounded-full border-4 ${
                  themeColor === c.hex ? 'border-gray-800' : 'border-white'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={goBack} className="py-3 px-6 rounded-xl border-2 border-gray-300">
              뒤로
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!character}
              className="flex-1 py-3 rounded-xl bg-pink-400 text-white font-bold disabled:opacity-50"
            >
              다음
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Kid step 4: 루틴 시간 & 알람 (기관별 추천 시간은 2단계에서 institution 선택 시 반영 가능)
  if (isKid && step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-teal-50 p-6 pt-12">
        <div className="flex justify-center gap-1 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${i <= 4 ? 'bg-pink-500' : 'bg-gray-300'}`}
            />
          ))}
        </div>
        <motion.div
          key="kid-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-md mx-auto"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">루틴 시간 & 알람</h2>
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-gray-600 mb-1">아침 루틴</label>
              <input
                type="time"
                value={morningTime}
                onChange={(e) => setMorningTime(e.target.value)}
                className="w-full border-2 rounded-xl p-3"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">저녁 루틴</label>
              <input
                type="time"
                value={eveningTime}
                onChange={(e) => setEveningTime(e.target.value)}
                className="w-full border-2 rounded-xl p-3"
              />
            </div>
          </div>
          <div className="flex items-center justify-between py-3 mb-8">
            <span className="text-gray-700">알람 켜기</span>
            <button
              type="button"
              role="switch"
              aria-checked={alarmOn}
              onClick={() => setAlarmOn((v) => !v)}
              className={`w-12 h-7 rounded-full ${alarmOn ? 'bg-pink-400' : 'bg-gray-300'}`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  alarmOn ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={goBack} className="py-3 px-6 rounded-xl border-2 border-gray-300">
              뒤로
            </button>
            <button type="button" onClick={goNext} className="flex-1 py-3 rounded-xl bg-pink-400 text-white font-bold">
              다음
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Kid step 5: PIN
  if (isKid && step === 5) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-teal-50 p-6 pt-12">
        <div className="flex justify-center gap-1 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="w-2 h-2 rounded-full bg-pink-500" />
          ))}
        </div>
        <motion.div
          key="kid-5"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-md mx-auto"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-2">부모님 전용 비밀번호</h2>
          <p className="text-gray-600 mb-4">4자리 숫자 PIN을 설정해요</p>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPin((prev) => (prev.length < 4 ? prev + String(n) : prev))}
                className="py-4 rounded-xl bg-white border-2 border-gray-200 text-xl font-medium"
              >
                {n}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mb-2">PIN: {pin.padEnd(4, '·')}</p>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pinConfirm}
            onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="확인 재입력"
            className="w-full border-2 rounded-xl p-3 mb-6 text-center"
          />
          <div className="flex gap-3">
            <button type="button" onClick={goBack} className="py-3 px-6 rounded-xl border-2 border-gray-300">
              뒤로
            </button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={saveAndFinish}
              disabled={pin.length !== 4 || pin !== pinConfirm}
              className="flex-1 py-3 rounded-xl bg-pink-400 text-white font-bold disabled:opacity-50"
            >
              설정 완료!
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Personal step 2: 나는 누구?
  if (isPersonal && step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-teal-50 p-6 pt-12">
        <div className="flex justify-center gap-1 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${i <= 2 ? 'bg-teal-500' : 'bg-gray-300'}`}
            />
          ))}
        </div>
        <motion.div key="per-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-md mx-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-4">이름</h2>
          <input
            type="text"
            value={personalName}
            onChange={(e) => setPersonalName(e.target.value)}
            placeholder="이름을 입력하세요"
            className="w-full border-2 border-gray-200 rounded-xl p-4 text-lg mb-6 focus:border-teal-400 outline-none"
          />
          <h2 className="text-xl font-bold text-gray-800 mb-4">나는 누구인가요?</h2>
          <div className="space-y-3 mb-8">
            {AGE_GROUPS.map((g) => (
              <button
                key={g.key}
                type="button"
                onClick={() => setAgeGroup(g.key)}
                className={`w-full p-5 rounded-xl border-2 flex items-center gap-4 ${
                  ageGroup === g.key ? 'border-teal-400 bg-teal-50' : 'border-gray-200'
                }`}
              >
                <span className="text-4xl">{g.emoji}</span>
                <span className="font-medium text-lg">{g.label}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={goBack} className="py-3 px-6 rounded-xl border-2 border-gray-300">
              뒤로
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!personalName || ageGroup === null}
              className="flex-1 py-3 rounded-xl bg-teal-400 text-white font-bold disabled:opacity-50"
            >
              다음
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Personal step 3: 목표
  if (isPersonal && step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-teal-50 p-6 pt-12">
        <div className="flex justify-center gap-1 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${i <= 3 ? 'bg-teal-500' : 'bg-gray-300'}`}
            />
          ))}
        </div>
        <motion.div key="per-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-md mx-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-4">어떤 습관을 만들고 싶나요?</h2>
          <p className="text-gray-600 mb-4">여러 개 골라도 돼요</p>
          <div className="flex flex-wrap gap-2 mb-8">
            {GOAL_OPTIONS.map((g) => (
              <button
                key={g.key}
                type="button"
                onClick={() => toggleGoal(g.key)}
                className={`px-4 py-2 rounded-full border-2 ${
                  goals.includes(g.key) ? 'border-teal-400 bg-teal-100' : 'border-gray-200'
                }`}
              >
                {g.emoji} {g.label}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={goBack} className="py-3 px-6 rounded-xl border-2 border-gray-300">
              뒤로
            </button>
            <button type="button" onClick={goNext} className="flex-1 py-3 rounded-xl bg-teal-400 text-white font-bold">
              다음
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Personal step 4: 게이미피케이션
  if (isPersonal && step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-teal-50 p-6 pt-12">
        <div className="flex justify-center gap-1 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${i <= 4 ? 'bg-teal-500' : 'bg-gray-300'}`}
            />
          ))}
        </div>
        <motion.div key="per-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-md mx-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-4">루틴 달성으로 캐릭터를 키울까요?</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setUseGameification(true)}
              className={`p-6 rounded-2xl border-2 ${
                useGameification === true ? 'border-teal-400 bg-teal-50' : 'border-gray-200'
              }`}
            >
              <p className="font-medium mb-2">YES</p>
              <p className="text-sm text-gray-500">캐릭터 선택</p>
            </button>
            <button
              type="button"
              onClick={() => setUseGameification(false)}
              className={`p-6 rounded-2xl border-2 ${
                useGameification === false ? 'border-teal-400 bg-teal-50' : 'border-gray-200'
              }`}
            >
              <p className="font-medium mb-2">NO</p>
              <p className="text-sm text-gray-500">심플하게 체크만</p>
            </button>
          </div>
          {useGameification === true && (
            <>
              <p className="text-gray-600 mb-2">캐릭터 선택</p>
              <div className="grid grid-cols-3 gap-2 mb-6">
                {CHARACTERS.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setPersonalCharacter(c.key)}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center ${
                      personalCharacter === c.key ? 'border-teal-400 bg-teal-50' : 'border-gray-200'
                    }`}
                  >
                    <span className="text-2xl">{c.emoji}</span>
                    <span className="text-xs">{c.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mb-6">
                {THEME_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setPersonalTheme(c.hex)}
                    className={`w-10 h-10 rounded-full border-2 ${
                      personalTheme === c.hex ? 'border-gray-800' : 'border-white'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </>
          )}
          <div className="flex gap-3">
            <button type="button" onClick={goBack} className="py-3 px-6 rounded-xl border-2 border-gray-300">
              뒤로
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={useGameification === null || (useGameification === true && !personalCharacter)}
              className="flex-1 py-3 rounded-xl bg-teal-400 text-white font-bold disabled:opacity-50"
            >
              다음
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Personal step 5: 완료
  if (isPersonal && step === 5) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-teal-50 p-6 pt-12 flex flex-col items-center justify-center">
        <div className="flex justify-center gap-1 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="w-2 h-2 rounded-full bg-teal-500" />
          ))}
        </div>
        <RimiCharacter mood="excited" size="xl" className="mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">준비됐어요! 🎉</h2>
        <p className="text-gray-600 mb-8">이제 루틴을 시작해보세요</p>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={saveAndFinish}
          className="w-full max-w-xs py-4 rounded-2xl bg-teal-400 text-white text-xl font-bold shadow-lg"
        >
          시작하기
        </motion.button>
      </div>
    );
  }

  return null;
}
