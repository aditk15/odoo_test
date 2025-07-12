-- Verification script to check if your Supabase setup is working correctly
-- Run this in Supabase SQL Editor after the main setup

-- 1. Check if tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'questions', 'answers', 'votes')
ORDER BY table_name;

-- 2. Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'questions', 'answers', 'votes')
ORDER BY tablename;

-- 3. Check if policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 4. Check if sample data was inserted
SELECT 
  'profiles' as table_name,
  count(*) as record_count
FROM public.profiles
UNION ALL
SELECT 
  'questions' as table_name,
  count(*) as record_count
FROM public.questions
UNION ALL
SELECT 
  'answers' as table_name,
  count(*) as record_count
FROM public.answers
UNION ALL
SELECT 
  'votes' as table_name,
  count(*) as record_count
FROM public.votes
ORDER BY table_name;

-- 5. Check if functions exist
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('handle_new_user', 'handle_updated_at')
ORDER BY routine_name;

-- 6. Check user and question data (may be empty initially)
SELECT 
  'Total users registered' as description,
  count(*) as count
FROM public.profiles
UNION ALL
SELECT 
  'Total questions posted' as description,
  count(*) as count
FROM public.questions
UNION ALL
SELECT 
  'Total answers posted' as description,
  count(*) as count
FROM public.answers
UNION ALL
SELECT 
  'Total votes cast' as description,
  count(*) as count
FROM public.votes
ORDER BY description;

-- 7. Show recent questions (if any exist)
SELECT 
  q.title,
  q.tags,
  COALESCE(p.username, p.email) as author,
  q.created_at
FROM public.questions q
LEFT JOIN public.profiles p ON q.author_id = p.id
ORDER BY q.created_at DESC
LIMIT 5;
