/**
 * Supabase 브라우저 클라이언트 (lib/supabase/client.ts)
 * Next.js 클라이언트 컴포넌트에서 사용하는 Supabase 클라이언트를 생성합니다.
 * RHYMIA MVP와 동일한 .env 값(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)을 사용합니다.
 */

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
