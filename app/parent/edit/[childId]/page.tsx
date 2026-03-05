'use client';

/**
 * 부모용 루틴 편집 (자녀별)
 * TODO: 루틴 항목 추가/삭제/순서 변경 UI
 */

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProfileStore } from '@/lib/stores/profileStore';
import { isKidProfile } from '@/types/profile';

export default function ParentEditChildPage() {
  const params = useParams();
  const router = useRouter();
  const childId = typeof params?.childId === 'string' ? params.childId : undefined;
  const profile = useProfileStore((s) => (childId ? s.getProfile(childId) : undefined));

  if (!childId || !profile || !isKidProfile(profile)) {
    router.replace('/parent/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <header className="flex items-center justify-between mb-6">
        <Link href="/parent/dashboard" className="text-gray-500">← 뒤로</Link>
        <h1 className="text-xl font-bold">{profile.name} 루틴 편집</h1>
        <span className="w-10" />
      </header>
      <p className="text-gray-500 text-center py-8">편집 기능은 준비 중이에요.</p>
    </div>
  );
}
