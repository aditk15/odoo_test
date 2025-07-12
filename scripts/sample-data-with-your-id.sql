-- Sample Data for User ID: 0827d216-4413-48fe-8c5e-13cebdb4c87c
-- Run this in Supabase SQL Editor AFTER running the complete-setup.sql

-- First, let's verify your user exists
SELECT id, email, username, created_at FROM public.profiles WHERE id = '0827d216-4413-48fe-8c5e-13cebdb4c87c';

-- Insert sample questions using your actual user ID
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
    '0827d216-4413-48fe-8c5e-13cebdb4c87c'
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
    '0827d216-4413-48fe-8c5e-13cebdb4c87c'
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
    '0827d216-4413-48fe-8c5e-13cebdb4c87c'
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
    '0827d216-4413-48fe-8c5e-13cebdb4c87c'
  ),
  (
    'Supabase vs Firebase: Which one to choose?',
    'I''m building a new web application and trying to decide between Supabase and Firebase for the backend. 

What I need:
- Real-time database updates
- User authentication
- File storage
- Easy integration with React/Next.js

Has anyone used both? What are the main differences in terms of:
- Developer experience
- Pricing
- Performance
- Learning curve
- Community support

Thanks in advance!',
    ARRAY['Supabase', 'Firebase', 'Backend', 'Database', 'Authentication'],
    '0827d216-4413-48fe-8c5e-13cebdb4c87c'
  );

-- Add some sample answers to the first question
INSERT INTO public.answers (question_id, content, author_id) VALUES
  (
    (SELECT id FROM public.questions WHERE title = 'How to implement authentication in Next.js?' LIMIT 1),
    'For Next.js authentication, I highly recommend **NextAuth.js** (now called Auth.js). It''s the most popular and well-maintained solution.

Here''s why:

### Pros of NextAuth.js:
- 🔐 Built specifically for Next.js
- 🌐 Supports 50+ OAuth providers
- 🛡️ Security best practices built-in
- 📧 Email/password authentication
- 🔄 Automatic JWT/session handling

### Basic Setup:
```bash
npm install next-auth
```

```javascript
// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ],
})
```

### Alternative Options:
- **Supabase Auth** - Great for full-stack apps
- **Auth0** - Enterprise-grade solution
- **Clerk** - Modern developer experience

For most Next.js projects, NextAuth.js is the way to go!',
    '0827d216-4413-48fe-8c5e-13cebdb4c87c'
  );

-- Verify the data was inserted
SELECT 
  q.title,
  q.tags,
  p.username,
  q.created_at
FROM public.questions q
JOIN public.profiles p ON q.author_id = p.id
WHERE q.author_id = '0827d216-4413-48fe-8c5e-13cebdb4c87c'
ORDER BY q.created_at DESC;
