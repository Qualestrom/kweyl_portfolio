-- =========================================================================
-- Supabase Schema & Seed Script for Christopher's Portfolio (kweyl_portfolio)
-- =========================================================================
-- Run this script in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run
-- =========================================================================

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  tag TEXT,
  category TEXT,
  description TEXT,
  skills JSONB DEFAULT '[]'::jsonb,
  "githubUrl" TEXT,
  "demoUrl" TEXT,
  status TEXT DEFAULT 'in-progress',
  photos JSONB DEFAULT '[]'::jsonb,
  "isInferred" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  issuer TEXT,
  date TEXT,
  "imageUrl" TEXT,
  "pdfUrl" TEXT,
  "verifyUrl" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS config (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2. Configure Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public/portfolio visitors) to view projects, certificates, and config
DROP POLICY IF EXISTS "Public Read Projects" ON projects;
CREATE POLICY "Public Read Projects" ON projects FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public Read Certificates" ON certificates;
CREATE POLICY "Public Read Certificates" ON certificates FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public Read Config" ON config;
CREATE POLICY "Public Read Config" ON config FOR SELECT TO public USING (true);

-- Allow authenticated admins to insert, update, delete
DROP POLICY IF EXISTS "Admin All Projects" ON projects;
CREATE POLICY "Admin All Projects" ON projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin All Certificates" ON certificates;
CREATE POLICY "Admin All Certificates" ON certificates FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin All Config" ON config;
CREATE POLICY "Admin All Config" ON config FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Storage Bucket Setup
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-assets', 'portfolio-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies
DROP POLICY IF EXISTS "Public Read Portfolio Assets" ON storage.objects;
CREATE POLICY "Public Read Portfolio Assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'portfolio-assets');

DROP POLICY IF EXISTS "Admin Insert Portfolio Assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow Upload Portfolio Assets" ON storage.objects;
CREATE POLICY "Allow Upload Portfolio Assets"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'portfolio-assets');

DROP POLICY IF EXISTS "Admin Update Portfolio Assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow Update Portfolio Assets" ON storage.objects;
CREATE POLICY "Allow Update Portfolio Assets"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'portfolio-assets');

DROP POLICY IF EXISTS "Admin Delete Portfolio Assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow Delete Portfolio Assets" ON storage.objects;
CREATE POLICY "Allow Delete Portfolio Assets"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'portfolio-assets');

-- 4. Initial Seed Data (All Existing Projects + M7 Grand Prix + The Pickle)
INSERT INTO projects (id, title, tag, category, description, skills, "githubUrl", "demoUrl", status, photos, "isInferred", sort_order)
VALUES
  (
    'm7-grand-prix',
    'M7 Grand Prix RSVP',
    '3D Interactive Web Experience',
    'Web Graphics & Events',
    'High-octane interactive Formula 1 event portal featuring a real-time Three.js 3D race circuit viewer, dynamic telemetry HUD, custom audio controller, driver registration, and Supabase backend.',
    '["React", "TypeScript", "Three.js", "React Three Fiber", "Supabase", "Framer Motion", "Tailwind CSS", "Canvas Confetti", "Web Audio API"]'::jsonb,
    'https://github.com/Qualestrom/m7-grand-prix-rsvp',
    'https://m7-grand-prix.vercel.app',
    'deployed',
    '[]'::jsonb,
    false,
    1
  ),
  (
    'the-pickle',
    'The Pickle',
    'Mobile Platform & Booking Engine',
    'Full-Stack & Mobile Architecture',
    'Enterprise-grade cross-platform community and venue management application engineered with React Native, Expo, and Supabase, featuring interactive court scheduling, real-time booking engines, push notifications, and geolocation.',
    '["React Native", "Expo", "TypeScript", "Supabase", "PostgreSQL", "RLS", "Real-Time Subscriptions", "Push Notifications", "Geospatial Queries"]'::jsonb,
    'https://github.com/Qualestrom/the-pickle',
    '',
    'deployed',
    '[]'::jsonb,
    false,
    2
  ),
  (
    '4qZN2lGENZnbe2gBZtNy',
    'Stellar-Cryo CMS',
    'Personal Portfolio System',
    'Web Application',
    'An interactive portfolio and custom content management system built with React, featuring in-place administrative editing, dynamic asset pipelines, and canvas visual effects.',
    '["JavaScript", "CSS", "TypeScript", "HTML", "React", "Tailwind CSS", "Vite", "Framer Motion", "Supabase"]'::jsonb,
    'https://github.com/Qualestrom/kweyl_portfolio',
    'https://kweyl-portfolio.me/',
    'deployed',
    '["/assets/recovered/projects/Screenshot 2026-09-06 112431.png", "/assets/recovered/projects/Screenshot 2026-09-06 112550.png", "/assets/recovered/projects/Screenshot 2026-09-06 112739.png"]'::jsonb,
    false,
    3
  ),
  (
    '5',
    'CREOSIM-MECHA',
    'TESDA MECHATRONICS NC II TRAINER',
    'Cloud & Infrastructure',
    'Modular e-learning platform integrating React, Konva.js, and Supabase to simulate complex mechatronics training boards with real-time state validation and circuit logic verification.',
    '["TypeScript", "React", "Konva.js", "Supabase", "Tailwind CSS", "HTML5 Canvas"]'::jsonb,
    'https://github.com/Qualestrom/creotec-mechalab-x',
    'https://creotec-mechalab-x.vercel.app',
    'confidential',
    '["/assets/recovered/projects/Screenshot 2026-08-29 213630.png", "/assets/recovered/projects/image (1).png", "/assets/recovered/projects/image (2).png", "/assets/recovered/projects/image.png"]'::jsonb,
    false,
    4
  ),
  (
    '8WwyyZQN51XRGUEiJiAC',
    'CRADLE',
    'Mobile Application Dormitory Finder',
    'Mobile Application',
    'Cross-platform mobile accommodation portal engineered with Flutter and Supabase/Firebase, featuring dedicated onboarding flows, role-based access for tenants and landlords, and real-time listing queries.',
    '["Dart", "Flutter", "Firebase", "Supabase", "Cross-Platform (Android / iOS)", "Scrumban", "UI/UX Design"]'::jsonb,
    'https://github.com/Qualestrom/CRADLE_PROJECT',
    '',
    'confidential',
    '["/assets/recovered/projects/Screenshot 2026-09-06 101759.png", "/assets/recovered/projects/Screenshot 2026-09-06 101834.png"]'::jsonb,
    false,
    5
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tag = EXCLUDED.tag,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  skills = EXCLUDED.skills,
  "githubUrl" = EXCLUDED."githubUrl",
  "demoUrl" = EXCLUDED."demoUrl",
  status = EXCLUDED.status,
  photos = EXCLUDED.photos,
  sort_order = EXCLUDED.sort_order;

-- 5. Seed Certificates
INSERT INTO certificates (id, title, issuer, date, "imageUrl", "pdfUrl", "verifyUrl", sort_order)
VALUES
  (
    '1',
    'CCNA: Switching, Routing, and Wireless',
    'Cisco Networking Academy',
    '28 May 2025',
    '',
    '/assets/recovered/certificates/CCNA Switching Routing Wireless Essentials.pdf',
    '',
    1
  ),
  (
    '2',
    'Python Essentials 1',
    'Cisco Networking Academy',
    '04 Aug 2026',
    '',
    '/assets/recovered/certificates/Python Essentials 1.pdf',
    '',
    2
  ),
  (
    '3',
    'Introduction to IoT and Digital Transformation',
    'Cisco Networking Academy',
    '04 Aug 2026',
    '',
    '/assets/recovered/certificates/Introduction to IOT and Digital Transformation.pdf',
    '',
    3
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  issuer = EXCLUDED.issuer,
  date = EXCLUDED.date,
  "pdfUrl" = EXCLUDED."pdfUrl";
