// Database Connection Test
// Run this in Supabase SQL Editor to verify your setup

-- Check if tables exist
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'questions', 'answers', 'votes')
ORDER BY table_name;

-- Check if you have any data
SELECT 'profiles' as table_name, count(*) as count FROM public.profiles
UNION ALL
SELECT 'questions' as table_name, count(*) as count FROM public.questions
UNION ALL  
SELECT 'answers' as table_name, count(*) as count FROM public.answers
UNION ALL
SELECT 'votes' as table_name, count(*) as count FROM public.votes;

-- If you have questions, show them
SELECT 
  q.id,
  q.title,
  q.tags,
  p.username,
  p.email,
  q.created_at
FROM public.questions q
LEFT JOIN public.profiles p ON q.author_id = p.id
ORDER BY q.created_at DESC
LIMIT 5;
