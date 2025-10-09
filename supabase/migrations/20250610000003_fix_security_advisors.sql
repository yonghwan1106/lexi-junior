-- Fix Security Advisor Issues

-- 1. Enable RLS on legal_knowledge table
ALTER TABLE legal_knowledge ENABLE ROW LEVEL SECURITY;

-- Create policy for legal_knowledge (public read access for RAG)
DROP POLICY IF EXISTS "Anyone can read legal knowledge" ON legal_knowledge;
CREATE POLICY "Anyone can read legal knowledge"
  ON legal_knowledge FOR SELECT
  TO authenticated, anon
  USING (true);

-- 2. Fix function search_path issues
ALTER FUNCTION public.handle_new_user() SET search_path = public, auth;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- Optional: If you have the match_legal_knowledge function
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'match_legal_knowledge'
  ) THEN
    EXECUTE 'ALTER FUNCTION public.match_legal_knowledge(vector, float, int, text) SET search_path = public';
  END IF;
END $$;
