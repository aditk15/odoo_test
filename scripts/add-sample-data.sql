-- Sample Data Script
-- Run this AFTER you have registered at least one user through your application
-- This script will add sample questions using real user accounts

-- First, let's check what users exist
SELECT id, email, username FROM public.profiles ORDER BY created_at;

-- Add sample questions (replace 'USER_ID_HERE' with an actual user ID from above)
-- You can get a user ID by registering through your app first, then running the SELECT above

/*
-- Example: Replace USER_ID_HERE with an actual UUID from your profiles table
INSERT INTO public.questions (title, content, tags, author_id) VALUES
  (
    'How to implement authentication in Next.js?',
    'I''m building a Next.js application and need to implement user authentication. What are the best practices and recommended libraries for handling authentication in Next.js?

Here are some specific questions I have:
- Should I use NextAuth.js or build my own solution?
- How do I handle JWT tokens securely?
- What''s the best way to protect API routes?
- How do I manage user sessions?

Any advice would be greatly appreciated!',
    ARRAY['Next.js', 'Authentication', 'React', 'Security'],
    'USER_ID_HERE'
  ),
  (
    'Best practices for React state management in 2025',
    'What are the current best practices for managing state in React applications? The ecosystem has evolved a lot recently.

I''m particularly interested in:
- When to use Context API vs external libraries
- Is Redux still relevant?
- What about Zustand or Jotai?
- How to handle server state vs client state?

What would you recommend for a medium-sized application?',
    ARRAY['React', 'State Management', 'Redux', 'Context API'],
    'USER_ID_HERE'
  ),
  (
    'Database query optimization techniques',
    'My application is running slow due to database queries. What are some techniques to optimize database performance?

Current issues I''m facing:
- Slow page load times
- High CPU usage on database server
- Complex JOIN queries taking too long
- N+1 query problems

Looking for both general principles and specific PostgreSQL tips.',
    ARRAY['Database', 'Performance', 'SQL', 'PostgreSQL', 'Optimization'],
    'USER_ID_HERE'
  ),
  (
    'TypeScript vs JavaScript for new projects',
    'I''m starting a new project and debating whether to use TypeScript or stick with JavaScript. What are the pros and cons?

Project context:
- Medium-sized team (5-8 developers)
- React/Next.js frontend
- Node.js backend
- 6-month development timeline

Would love to hear from people who have experience with both!',
    ARRAY['TypeScript', 'JavaScript', 'React', 'Node.js', 'Development'],
    'USER_ID_HERE'
  );
*/

-- Instructions:
-- 1. Register a user account through your application first
-- 2. Run the SELECT query above to get the user ID
-- 3. Replace 'USER_ID_HERE' in the INSERT statements with the actual user ID
-- 4. Remove the /* and */ comment markers
-- 5. Run the INSERT statements
