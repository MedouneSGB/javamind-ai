-- ═══════════════════════════════════════════════════════════════════════════
-- Migration : Accès admin au tableau de bord JavaMind AI
-- À exécuter dans : Supabase Dashboard → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. Fonction helper : is_admin() ────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean,
    false
  )
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;


-- ─── 2. Politique RLS : admin lit tous les profils ───────────────────────────

DROP POLICY IF EXISTS "admin_read_all_profiles" ON public.profiles;

CREATE POLICY "admin_read_all_profiles"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id OR public.is_admin());


-- ─── 3. RPC admin_get_profiles — email + provider + is_admin ─────────────────

CREATE OR REPLACE FUNCTION public.admin_get_profiles(
  p_limit  int     DEFAULT 100,
  p_offset int     DEFAULT 0,
  p_search text    DEFAULT NULL
)
RETURNS TABLE (
  id           uuid,
  username     text,
  avatar_url   text,
  email        text,
  provider     text,
  is_admin_flag boolean,
  created_at   timestamptz,
  updated_at   timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Accès refusé — droits admin requis';
  END IF;

  RETURN QUERY
    SELECT
      p.id,
      p.username,
      p.avatar_url,
      u.email::text,
      (u.raw_app_meta_data ->> 'provider')::text,
      COALESCE((u.raw_app_meta_data ->> 'is_admin')::boolean, false),
      p.created_at,
      u.updated_at
    FROM public.profiles p
    JOIN auth.users u ON u.id = p.id
    WHERE (
      p_search IS NULL
      OR u.email   ILIKE '%' || p_search || '%'
      OR p.username ILIKE '%' || p_search || '%'
    )
    ORDER BY p.created_at DESC
    LIMIT  GREATEST(p_limit,  1)
    OFFSET GREATEST(p_offset, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_profiles(int, int, text) TO authenticated;


-- ─── 4. RPC admin_count_profiles ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.admin_count_profiles()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Accès refusé — droits admin requis';
  END IF;
  RETURN (SELECT COUNT(*) FROM public.profiles);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_count_profiles() TO authenticated;


-- ─── 5. RPC admin_count_new_profiles(p_days) ────────────────────────────────

CREATE OR REPLACE FUNCTION public.admin_count_new_profiles(p_days int DEFAULT 7)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Accès refusé — droits admin requis';
  END IF;
  RETURN (
    SELECT COUNT(*) FROM public.profiles
    WHERE created_at >= NOW() - (p_days || ' days')::interval
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_count_new_profiles(int) TO authenticated;


-- ─── 6. RPC admin_get_daily_registrations(p_days) — graphique ───────────────

CREATE OR REPLACE FUNCTION public.admin_get_daily_registrations(p_days int DEFAULT 14)
RETURNS TABLE (day date, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Accès refusé — droits admin requis';
  END IF;
  RETURN QUERY
    SELECT
      d::date,
      COUNT(p.id)::bigint
    FROM generate_series(
      NOW() - (p_days || ' days')::interval,
      NOW(),
      '1 day'::interval
    ) AS d
    LEFT JOIN public.profiles p ON p.created_at::date = d::date
    GROUP BY d::date
    ORDER BY d::date;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_daily_registrations(int) TO authenticated;


-- ═══════════════════════════════════════════════════════════════════════════
-- Activer un admin (remplacer l'email)
-- ═══════════════════════════════════════════════════════════════════════════
-- UPDATE auth.users
--   SET raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'::jsonb
--   WHERE email = 'votre-email@exemple.com';
-- ═══════════════════════════════════════════════════════════════════════════
