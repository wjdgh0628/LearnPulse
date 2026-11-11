-- =============================================================================
-- LearnPulse Database Schema & Row Level Security (RLS) Migration
-- File: supabase/migrations/001_learnpulse_schema_and_rls.sql
--
-- [적용 방법 안내]
-- 1. Supabase 대시보드 -> SQL Editor로 이동합니다.
-- 2. 본 파일의 SQL 스크립트를 복사하여 실행(Run)합니다.
-- 3. 실제 운영 DB 적용 전 스테이징 환경에서 먼저 검증하십시오.
-- =============================================================================

-- 1. Roadmaps 테이블 (로드맵 기본 정보)
CREATE TABLE IF NOT EXISTS public.roadmaps (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
  target_duration TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Roadmap Chapters 테이블 (챕터 데이터 - 로드맵 삭제 시 CASCADE 삭제)
CREATE TABLE IF NOT EXISTS public.roadmap_chapters (
  id TEXT PRIMARY KEY,
  roadmap_id TEXT NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Roadmap Items 테이블 (세부 학습 항목 - 챕터/로드맵 삭제 시 CASCADE 삭제)
CREATE TABLE IF NOT EXISTS public.roadmap_items (
  id TEXT PRIMARY KEY,
  chapter_id TEXT NOT NULL REFERENCES public.roadmap_chapters(id) ON DELETE CASCADE,
  roadmap_id TEXT NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  sub_tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
  estimated_time TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE')),
  memo TEXT DEFAULT '',
  reference_link TEXT DEFAULT '',
  completed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. 조회 및 정렬 성능 최적화 인덱스
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_created
  ON public.roadmaps(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chapters_roadmap_order
  ON public.roadmap_chapters(roadmap_id, order_index ASC);

CREATE INDEX IF NOT EXISTS idx_items_chapter_order
  ON public.roadmap_items(chapter_id, order_index ASC);

CREATE INDEX IF NOT EXISTS idx_items_roadmap_id
  ON public.roadmap_items(roadmap_id);

-- 5. Row Level Security (RLS) 활성화
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_items ENABLE ROW LEVEL SECURITY;

-- 6. RLS 정책: 인증된 사용자(Supabase Auth) 또는 요청 헤더의 사용자 ID 기반 격리
-- (A) Supabase Auth 정식 연동 시: auth.uid()::text = user_id
-- (B) 하이브리드/데모 클라이언트 연동 시: current_setting('request.headers', true)::json->>'x-learnpulse-user-id' = user_id
CREATE OR REPLACE FUNCTION public.current_learnpulse_user_id()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    auth.uid()::text,
    NULLIF(current_setting('request.headers', true)::json->>'x-learnpulse-user-id', '')
  );
$$;

DROP POLICY IF EXISTS roadmaps_owner_policy ON public.roadmaps;
CREATE POLICY roadmaps_owner_policy ON public.roadmaps
  FOR ALL
  USING (user_id = public.current_learnpulse_user_id())
  WITH CHECK (user_id = public.current_learnpulse_user_id());

DROP POLICY IF EXISTS chapters_owner_policy ON public.roadmap_chapters;
CREATE POLICY chapters_owner_policy ON public.roadmap_chapters
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.roadmaps r
      WHERE r.id = roadmap_chapters.roadmap_id
        AND r.user_id = public.current_learnpulse_user_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.roadmaps r
      WHERE r.id = roadmap_chapters.roadmap_id
        AND r.user_id = public.current_learnpulse_user_id()
    )
  );

DROP POLICY IF EXISTS items_owner_policy ON public.roadmap_items;
CREATE POLICY items_owner_policy ON public.roadmap_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.roadmaps r
      WHERE r.id = roadmap_items.roadmap_id
        AND r.user_id = public.current_learnpulse_user_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.roadmaps r
      WHERE r.id = roadmap_items.roadmap_id
        AND r.user_id = public.current_learnpulse_user_id()
    )
  );
