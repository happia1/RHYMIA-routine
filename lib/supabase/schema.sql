-- RHYMIA 루틴 앱 Supabase 스키마
-- 테이블 생성, RLS 정책, 스트릭 자동 계산 함수를 포함합니다.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. routine_templates: 루틴 템플릿 (어린이/개인용, 아침·저녁·주말·특별)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS routine_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('kid', 'personal')),
  type TEXT NOT NULL CHECK (type IN ('morning', 'evening', 'weekend', 'special')),
  title TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  schedule JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE routine_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "routine_templates_select_own"
  ON routine_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "routine_templates_insert_own"
  ON routine_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "routine_templates_update_own"
  ON routine_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "routine_templates_delete_own"
  ON routine_templates FOR DELETE
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. routine_logs: 일별 루틴 완료 기록
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS routine_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID NOT NULL REFERENCES routine_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed_items JSONB NOT NULL DEFAULT '[]',
  is_fully_completed BOOLEAN NOT NULL DEFAULT false,
  points_earned INT NOT NULL DEFAULT 0,
  parent_confirmed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(routine_id, user_id, date)
);

ALTER TABLE routine_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "routine_logs_select_own"
  ON routine_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "routine_logs_insert_own"
  ON routine_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "routine_logs_update_own"
  ON routine_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "routine_logs_delete_own"
  ON routine_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. reward_points: 포인트·스트릭 (유저당 1행)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reward_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INT NOT NULL DEFAULT 0,
  streak_days INT NOT NULL DEFAULT 0,
  last_completed_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE reward_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reward_points_select_own"
  ON reward_points FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "reward_points_insert_own"
  ON reward_points FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reward_points_update_own"
  ON reward_points FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "reward_points_delete_own"
  ON reward_points FOR DELETE
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. virtual_companions: 가상 동반자 (펫/식물, 기본 펭귄 리미)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS virtual_companions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('pet', 'plant')),
  species TEXT NOT NULL DEFAULT 'penguin',
  name TEXT NOT NULL DEFAULT '리미',
  growth_stage INT NOT NULL DEFAULT 0 CHECK (growth_stage >= 0 AND growth_stage <= 4),
  happiness INT NOT NULL DEFAULT 80 CHECK (happiness >= 0 AND happiness <= 100),
  hunger INT NOT NULL DEFAULT 80 CHECK (hunger >= 0 AND hunger <= 100),
  affection INT NOT NULL DEFAULT 0 CHECK (affection >= 0 AND affection <= 100),
  total_exp INT NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE virtual_companions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "virtual_companions_select_own"
  ON virtual_companions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "virtual_companions_insert_own"
  ON virtual_companions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "virtual_companions_update_own"
  ON virtual_companions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "virtual_companions_delete_own"
  ON virtual_companions FOR DELETE
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. praise_stickers: 칭찬 스티커 (부모 → 자녀)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS praise_stickers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sticker_type TEXT NOT NULL,
  message TEXT,
  routine_log_id UUID REFERENCES routine_logs(id) ON DELETE SET NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE praise_stickers ENABLE ROW LEVEL SECURITY;

-- 보낸 사람: 본인이 보낸 스티커만 조회/삭제
CREATE POLICY "praise_stickers_select_from"
  ON praise_stickers FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "praise_stickers_insert_from"
  ON praise_stickers FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "praise_stickers_update_to_read"
  ON praise_stickers FOR UPDATE
  USING (auth.uid() = to_user_id);

CREATE POLICY "praise_stickers_delete_from"
  ON praise_stickers FOR DELETE
  USING (auth.uid() = from_user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. family_links: 부모-자녀 연결
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS family_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(parent_user_id, child_user_id)
);

ALTER TABLE family_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "family_links_select_own"
  ON family_links FOR SELECT
  USING (auth.uid() = parent_user_id OR auth.uid() = child_user_id);

CREATE POLICY "family_links_insert_parent"
  ON family_links FOR INSERT
  WITH CHECK (auth.uid() = parent_user_id);

CREATE POLICY "family_links_update_parent"
  ON family_links FOR UPDATE
  USING (auth.uid() = parent_user_id);

CREATE POLICY "family_links_delete_parent"
  ON family_links FOR DELETE
  USING (auth.uid() = parent_user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 스트릭 자동 계산 함수: reward_points.last_completed_date 기준으로 streak_days 갱신
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_streak(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_date DATE;
  v_streak INT := 0;
  v_check_date DATE;
BEGIN
  SELECT last_completed_date INTO v_last_date
  FROM reward_points
  WHERE user_id = p_user_id;

  IF v_last_date IS NULL THEN
    RETURN;
  END IF;

  -- 오늘 또는 어제 완료했을 때만 스트릭 계산 (연속 일수)
  IF v_last_date < current_date - 1 THEN
    UPDATE reward_points
    SET streak_days = 0, updated_at = now()
    WHERE user_id = p_user_id;
    RETURN;
  END IF;

  v_check_date := v_last_date;
  WHILE EXISTS (
    SELECT 1 FROM routine_logs
    WHERE user_id = p_user_id AND date = v_check_date AND is_fully_completed = true
  ) LOOP
    v_streak := v_streak + 1;
    v_check_date := v_check_date - 1;
  END LOOP;

  UPDATE reward_points
  SET streak_days = v_streak, updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;
