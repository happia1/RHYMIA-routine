/**
 * 프로필 사진 선택 + 크롭 편집 컴포넌트
 * 비개발자: 프로필 원형 이미지를 탭하면 갤러리에서 사진을 고르고, 원형으로 잘라서 저장해요.
 * react-easy-crop으로 드래그·줌 후 확인하면 base64로 부모에게 전달해요.
 */

'use client'

import { useState, useCallback, useRef } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, Check, ZoomIn } from 'lucide-react'

interface ProfileImagePickerProps {
  /** 현재 이미지 (base64 또는 URL). 없으면 fallbackEmoji 표시 */
  currentSrc: string | null
  /** 이미지 없을 때 표시할 이모지 */
  fallbackEmoji: string
  /** 아바타 배경색 (hex) */
  avatarColor: string
  /** 크롭 완료 시 base64 문자열로 전달 */
  onSave: (base64: string) => void
  /** 원형 버튼 크기(px). 기본 80 */
  size?: number
}

/** 크롭 영역(pixel)을 200x200 원형 결과 이미지로 잘라 base64 반환 */
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<string> {
  const image = new Image()
  image.src = imageSrc
  await new Promise<void>((res) => {
    image.onload = () => res()
  })

  const canvas = document.createElement('canvas')
  canvas.width = 200
  canvas.height = 200
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    200,
    200
  )
  return canvas.toDataURL('image/jpeg', 0.85)
}

export function ProfileImagePicker({
  currentSrc,
  fallbackEmoji,
  avatarColor,
  onSave,
  size = 80,
}: ProfileImagePickerProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [cropModal, setCropModal] = useState(false)
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setRawImageSrc(reader.result as string)
      setCropModal(true)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setCroppedAreaPixels(null)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleCropConfirm = async () => {
    if (!rawImageSrc || !croppedAreaPixels) return
    const base64 = await getCroppedImg(rawImageSrc, croppedAreaPixels)
    onSave(base64)
    setCropModal(false)
    setRawImageSrc(null)
  }

  const closeCrop = () => {
    setCropModal(false)
    setRawImageSrc(null)
  }

  return (
    <>
      <div className="relative inline-block" style={{ width: size, height: size }}>
        <motion.button
          type="button"
          whileTap={{ scale: 0.93 }}
          onClick={() => fileRef.current?.click()}
          className="w-full h-full rounded-full overflow-hidden flex items-center justify-center border-white shadow-lg"
          style={{ backgroundColor: avatarColor + '44', borderWidth: 3 }}
        >
          {currentSrc ? (
            <img
              src={currentSrc}
              alt="프로필"
              className="w-full h-full object-cover"
            />
          ) : (
            <span style={{ fontSize: size * 0.45 }}>{fallbackEmoji}</span>
          )}
        </motion.button>

        <motion.div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
          whileTap={{ scale: 0.9 }}
          onClick={() => fileRef.current?.click()}
          className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#FF8FAB] rounded-full flex items-center justify-center shadow-md border-2 border-white cursor-pointer"
        >
          <Camera className="w-3.5 h-3.5 text-white" />
        </motion.div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <AnimatePresence>
        {cropModal && rawImageSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0">
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={closeCrop}
                className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
              <p className="text-white font-black text-lg">사진 편집</p>
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={handleCropConfirm}
                className="w-10 h-10 rounded-full bg-[#FF8FAB] flex items-center justify-center shadow-lg"
              >
                <Check className="w-5 h-5 text-white" />
              </motion.button>
            </div>

            <div className="flex-1 relative min-h-0">
              <Cropper
                image={rawImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                style={{
                  containerStyle: { background: 'transparent' },
                  cropAreaStyle: { border: '3px solid #FF8FAB' },
                }}
              />
            </div>

            <div className="px-8 py-6 flex-shrink-0">
              <div className="flex items-center gap-3">
                <ZoomIn className="w-4 h-4 text-white/60" />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 accent-[#FF8FAB]"
                />
                <ZoomIn className="w-5 h-5 text-white" />
              </div>
              <p className="text-white/40 text-xs text-center mt-3">
                원형 영역을 드래그해서 위치를 조정하세요
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
