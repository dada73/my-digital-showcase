
-- Fix search_path on set_updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Restrict has_role execution: only authenticated users need it
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;

-- Tighten public-insert policies with validation
DROP POLICY IF EXISTS "Anyone can submit messages" ON public.messages;
CREATE POLICY "Anyone can submit messages" ON public.messages FOR INSERT TO anon, authenticated
WITH CHECK (
  length(name) BETWEEN 1 AND 120
  AND length(email) BETWEEN 3 AND 200
  AND length(message) BETWEEN 1 AND 5000
  AND read = false
);

DROP POLICY IF EXISTS "Anyone can record views" ON public.page_views;
CREATE POLICY "Anyone can record views" ON public.page_views FOR INSERT TO anon, authenticated
WITH CHECK (length(path) BETWEEN 1 AND 500);
