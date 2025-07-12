-- Insert sample users (these would normally be created through auth)
INSERT INTO profiles (id, username, email, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'john_doe', 'john@example.com', 'user'),
  ('550e8400-e29b-41d4-a716-446655440001', 'jane_smith', 'jane@example.com', 'user'),
  ('550e8400-e29b-41d4-a716-446655440002', 'admin_user', 'admin@example.com', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Insert sample questions
INSERT INTO questions (id, title, content, tags, author_id) VALUES
  (
    '660e8400-e29b-41d4-a716-446655440000',
    'How to implement authentication in Next.js?',
    'I''m building a Next.js application and need to implement user authentication. What are the best practices and recommended libraries for handling authentication in Next.js?',
    ARRAY['Next.js', 'Authentication', 'React'],
    '550e8400-e29b-41d4-a716-446655440000'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440001',
    'Best practices for React state management',
    'What are the current best practices for managing state in React applications? Should I use Context API, Redux, or something else?',
    ARRAY['React', 'State Management', 'Redux'],
    '550e8400-e29b-41d4-a716-446655440001'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440002',
    'How to optimize database queries?',
    'My application is running slow due to database queries. What are some techniques to optimize database performance?',
    ARRAY['Database', 'Performance', 'SQL'],
    '550e8400-e29b-41d4-a716-446655440000'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample answers
INSERT INTO answers (id, question_id, content, author_id, is_accepted) VALUES
  (
    '770e8400-e29b-41d4-a716-446655440000',
    '660e8400-e29b-41d4-a716-446655440000',
    'For Next.js authentication, I recommend using **NextAuth.js**. It''s a complete authentication solution that supports multiple providers and is specifically designed for Next.js applications.',
    '550e8400-e29b-41d4-a716-446655440001',
    true
  ),
  (
    '770e8400-e29b-41d4-a716-446655440001',
    '660e8400-e29b-41d4-a716-446655440000',
    'You could also consider using Supabase Auth or Auth0. Both provide excellent authentication services with good Next.js integration.',
    '550e8400-e29b-41d4-a716-446655440002',
    false
  ),
  (
    '770e8400-e29b-41d4-a716-446655440002',
    '660e8400-e29b-41d4-a716-446655440001',
    'For most applications, the **Context API** combined with useReducer is sufficient. Only use Redux if you have complex state logic or need time-travel debugging.',
    '550e8400-e29b-41d4-a716-446655440000',
    false
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample votes
INSERT INTO votes (user_id, question_id, vote_type) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440000', 'up'),
  ('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440000', 'up'),
  ('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', 'up')
ON CONFLICT (user_id, question_id) DO NOTHING;

INSERT INTO votes (user_id, answer_id, vote_type) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 'up'),
  ('550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440000', 'up'),
  ('550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', 'up')
ON CONFLICT (user_id, answer_id) DO NOTHING;
