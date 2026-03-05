'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { StickerType, STICKER_META } from '@/types/routine';

interface StickerPickerProps {
  onSend: (stickerType: StickerType, message: string) => void;
  onClose: () => void;
}

export default function StickerPicker({ onSend, onClose }: StickerPickerProps) {
  const [selected, setSelected] = useState<StickerType | null>(null);
  const [message, setMessage] = useState('');

  const QUICK_MESSAGES = [
    '우리 아이 최고야! 🥰',
    '정말 잘했어! 자랑스러워!',
    '오늘도 스스로 해냈어! 👏',
    '사랑해 ❤️',
    '내일도 잘 할 수 있어!',
  ];

  const handleSend = () => {
    if (!selected) return;
    onSend(selected, message);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-end z-50" onClick={onClose}>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="w-full bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-700 mb-5 text-center">
          칭찬 스티커 보내기 🎁
        </h2>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {(Object.entries(STICKER_META) as [StickerType, { emoji: string; label: string }][]).map(
            ([type, { emoji, label }]) => (
              <motion.button
                key={type}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelected(type)}
                className={`
                  flex flex-col items-center p-3 rounded-2xl border-2 transition-all
                  ${selected === type
                    ? 'border-pink-400 bg-pink-50 shadow-md'
                    : 'border-gray-200 bg-gray-50'}
                `}
              >
                <span className="text-4xl">{emoji}</span>
                <span className="text-xs text-gray-500 mt-1">{label}</span>
              </motion.button>
            )
          )}
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">💬 한마디 골라보세요</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_MESSAGES.map((msg) => (
              <button
                key={msg}
                onClick={() => setMessage(msg)}
                className={`
                  px-3 py-2 rounded-full text-sm border transition-all
                  ${message === msg
                    ? 'bg-pink-100 border-pink-400 text-pink-700'
                    : 'bg-gray-100 border-gray-200 text-gray-600'}
                `}
              >
                {msg}
              </button>
            ))}
          </div>
        </div>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="직접 입력하기..."
          className="w-full border-2 border-gray-200 rounded-2xl p-3 text-base mb-5 focus:border-pink-400 outline-none"
        />

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleSend}
          disabled={!selected}
          className={`
            w-full py-4 rounded-2xl text-white text-xl font-bold transition-all
            ${selected
              ? 'bg-gradient-to-r from-pink-400 to-orange-400 shadow-lg'
              : 'bg-gray-300 cursor-not-allowed'}
          `}
        >
          스티커 보내기 ✈️
        </motion.button>
      </motion.div>
    </div>
  );
}