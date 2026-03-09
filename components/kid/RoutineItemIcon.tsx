/**
 * 루틴 항목 아이콘 (이미지 우선, 로드 실패 시 이모지 fallback)
 * 비개발자: public/routine-icons 이미지가 있으면 표시하고, 없거나 로드 실패 시 이모지로 보여줍니다.
 * imagePath가 없어도 imageKey가 있으면 ROUTINE_IMAGES에서 경로를 찾아 표시합니다 (로컬 저장 데이터 호환).
 */

'use client'

import { useState } from 'react'
import { RoutineItem } from '@/types/routine'
import { ROUTINE_IMAGES, LABEL_TO_IMAGE_KEY } from '@/lib/utils/defaultRoutines'

interface RoutineItemIconProps {
  /** 루틴 항목 (imagePath 또는 imageKey·라벨로 이미지 표시) */
  item: Pick<RoutineItem, 'icon' | 'imagePath' | 'imageKey' | 'label'>
  /** 아이콘 컨테이너/이미지 크기 (예: w-16 h-16, text-5xl) */
  className?: string
  /** 이미지 크기 (이미지일 때만, 기본 w-full h-full) */
  imageClassName?: string
}

export function RoutineItemIcon({ item, className = '', imageClassName = 'w-full h-full object-contain' }: RoutineItemIconProps) {
  const [imgError, setImgError] = useState(false)
  // 라벨 우선으로 imageKey 결정 (저장된 imageKey가 잘못돼 있어도 표시는 라벨에 맞게)
  const labelKey = item.label?.trim() ? LABEL_TO_IMAGE_KEY[item.label.trim()] : undefined
  const resolvedKey = labelKey ?? item.imageKey
  const imagePath = (resolvedKey ? ROUTINE_IMAGES[resolvedKey] ?? null : null) ?? item.imagePath ?? null
  const hasImage = (imagePath != null && imagePath !== '') && !imgError

  if (hasImage) {
    return (
      <div className={`flex items-center justify-center flex-shrink-0 overflow-hidden ${className}`}>
        <img
          src={imagePath}
          alt=""
          className={imageClassName}
          onError={() => setImgError(true)}
        />
      </div>
    )
  }

  return (
    <span className={`flex items-center justify-center flex-shrink-0 ${className}`}>
      {item.icon}
    </span>
  )
}
