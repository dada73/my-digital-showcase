
-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ TIMESTAMP TRIGGER ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- ============ PROFILE (single row) ============
CREATE TABLE public.profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL DEFAULT 'Your Name',
  title TEXT NOT NULL DEFAULT 'Full-Stack Developer',
  bio TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  email TEXT,
  location TEXT,
  github_url TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,
  instagram_url TEXT,
  website_url TEXT,
  resume_url TEXT,
  github_username TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER profile_updated BEFORE UPDATE ON public.profile FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Profile public read" ON public.profile FOR SELECT USING (true);
CREATE POLICY "Admins update profile" ON public.profile FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert profile" ON public.profile FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.profile (full_name, title, bio, email, location, github_url, twitter_url, linkedin_url, github_username)
VALUES (
  'Aditya Pratama',
  'Full-Stack Developer & Creative Technologist',
  'Saya membangun produk digital yang indah dan cepat. 5+ tahun membantu startup dari ide hingga peluncuran — fokus pada React, TypeScript, dan pengalaman yang menyenangkan.',
  'hello@example.com',
  'Jakarta, Indonesia',
  'https://github.com',
  'https://twitter.com',
  'https://linkedin.com',
  'octocat'
);

-- ============ PROJECTS ============
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  long_description TEXT,
  image_url TEXT,
  tech_stack TEXT[] NOT NULL DEFAULT '{}',
  github_url TEXT,
  demo_url TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER projects_updated BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Projects public read" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Admins manage projects" ON public.projects FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.projects (title, description, tech_stack, github_url, demo_url, featured, display_order) VALUES
('Nebula Dashboard', 'Realtime analytics dashboard dengan visualisasi data interaktif dan tema dapat disesuaikan.', ARRAY['React','TypeScript','D3.js','Tailwind'], 'https://github.com', 'https://example.com', true, 1),
('Pulse Chat', 'Aplikasi chat realtime dengan dukungan voice notes, file sharing, dan end-to-end encryption.', ARRAY['Next.js','WebRTC','PostgreSQL'], 'https://github.com', 'https://example.com', true, 2),
('Forge CMS', 'Headless CMS modern dengan editor blok seperti Notion dan API GraphQL.', ARRAY['Node.js','GraphQL','Tiptap'], 'https://github.com', 'https://example.com', true, 3),
('Aurora Wallet', 'Crypto wallet multi-chain dengan UX yang ramah pemula.', ARRAY['React Native','Web3'], 'https://github.com', 'https://example.com', false, 4),
('Echo Music', 'Discovery platform musik indie dengan rekomendasi berbasis AI.', ARRAY['Vue','Python','TensorFlow'], 'https://github.com', 'https://example.com', false, 5),
('Tide POS', 'Point of sale untuk UMKM yang berjalan offline-first.', ARRAY['Svelte','SQLite','PWA'], 'https://github.com', 'https://example.com', false, 6);

-- ============ SKILLS ============
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  percentage INT NOT NULL DEFAULT 80 CHECK (percentage BETWEEN 0 AND 100),
  category TEXT NOT NULL DEFAULT 'Frontend',
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Skills public read" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Admins manage skills" ON public.skills FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.skills (name, percentage, category, display_order) VALUES
('React / Next.js', 95, 'Frontend', 1),
('TypeScript', 92, 'Frontend', 2),
('Tailwind CSS', 95, 'Frontend', 3),
('Framer Motion', 85, 'Frontend', 4),
('Node.js', 88, 'Backend', 5),
('PostgreSQL', 82, 'Backend', 6),
('GraphQL', 78, 'Backend', 7),
('Figma', 80, 'Design', 8),
('Docker', 70, 'DevOps', 9);

-- ============ BLOG POSTS ============
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL DEFAULT '',
  cover_url TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_text TEXT NOT NULL DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT false,
  views INT NOT NULL DEFAULT 0,
  reading_minutes INT NOT NULL DEFAULT 3,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER blog_updated BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Published posts public read" ON public.blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Admins read all posts" ON public.blog_posts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage posts" ON public.blog_posts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.blog_posts (title, slug, excerpt, content_text, content, published, reading_minutes, published_at) VALUES
('Membangun UI yang Berani di Era Sameface', 'ui-berani-sameface', 'Mengapa landing page modern terlihat sama, dan bagaimana keluar dari pola itu dengan tipografi tebal serta gradient yang berani.', 'Banyak situs hari ini terlihat seperti dilahirkan dari template yang sama...', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Banyak situs hari ini terlihat seperti dilahirkan dari template yang sama..."}]}]}'::jsonb, true, 5, now() - interval '2 days'),
('TanStack Start: Framework yang Membuat Saya Senang Lagi', 'tanstack-start-senang', 'Setelah bertahun-tahun pakai Next.js, saya mencoba TanStack Start. Berikut mengapa saya tidak ingin kembali.', 'Tooling React modern sering terasa berlebihan...', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Tooling React modern sering terasa berlebihan..."}]}]}'::jsonb, true, 7, now() - interval '7 days'),
('Animasi Mikro yang Tidak Membuat Pengguna Mual', 'animasi-mikro-tidak-mual', 'Aturan praktis menggunakan Framer Motion untuk membuat halaman terasa hidup tanpa berlebihan.', 'Animasi seharusnya melayani konten...', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Animasi seharusnya melayani konten..."}]}]}'::jsonb, true, 4, now() - interval '14 days');

-- ============ MESSAGES ============
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read messages" ON public.messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update messages" ON public.messages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete messages" ON public.messages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ PAGE VIEWS ============
CREATE TABLE public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  referrer TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record views" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read views" ON public.page_views FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_page_views_path ON public.page_views(path);
CREATE INDEX idx_page_views_viewed_at ON public.page_views(viewed_at DESC);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON public.blog_posts(published, published_at DESC);
CREATE INDEX idx_projects_order ON public.projects(display_order);
