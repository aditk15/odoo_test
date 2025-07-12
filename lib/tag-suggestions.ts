// Tag suggestion utilities
import { createClient } from "@/lib/supabase"

// Content-based keyword extraction
export const extractTagsFromContent = (title: string, content: string): string[] => {
  const text = `${title} ${content}`.toLowerCase()
  
  // Technology keywords with variations
  const techKeywords = {
    'react': ['react', 'reactjs', 'react.js', 'jsx', 'hooks', 'usestate', 'useeffect'],
    'javascript': ['javascript', 'js', 'vanilla js', 'ecmascript', 'es6', 'es2015'],
    'typescript': ['typescript', 'ts', 'type script', 'typed javascript'],
    'next.js': ['next.js', 'nextjs', 'next js', 'vercel', 'app router', 'pages router'],
    'node.js': ['node.js', 'nodejs', 'node js', 'npm', 'express', 'server side'],
    'python': ['python', 'django', 'flask', 'fastapi', 'pandas', 'numpy'],
    'css': ['css', 'stylesheet', 'styles', 'flexbox', 'grid', 'responsive'],
    'html': ['html', 'markup', 'dom', 'semantic', 'accessibility'],
    'database': ['database', 'sql', 'postgresql', 'mysql', 'mongodb', 'prisma', 'query'],
    'authentication': ['auth', 'authentication', 'login', 'signup', 'jwt', 'session', 'oauth'],
    'api': ['api', 'rest', 'graphql', 'endpoint', 'fetch', 'axios', 'http'],
    'tailwind': ['tailwind', 'tailwindcss', 'utility classes', 'responsive design'],
    'supabase': ['supabase', 'realtime', 'row level security', 'rls'],
    'firebase': ['firebase', 'firestore', 'firebase auth'],
    'deployment': ['deploy', 'deployment', 'hosting', 'vercel', 'netlify', 'heroku'],
    'testing': ['test', 'testing', 'jest', 'cypress', 'unit test', 'integration'],
    'performance': ['performance', 'optimization', 'lazy loading', 'caching', 'speed'],
    'security': ['security', 'xss', 'csrf', 'sanitization', 'validation'],
    'mobile': ['mobile', 'responsive', 'react native', 'ios', 'android'],
    'state management': ['state', 'redux', 'zustand', 'context', 'global state'],
    'styling': ['styling', 'styled components', 'emotion', 'sass', 'less'],
    'forms': ['form', 'validation', 'input', 'form handling', 'react hook form'],
    'routing': ['routing', 'router', 'navigation', 'routes', 'link'],
    'error handling': ['error', 'exception', 'try catch', 'error boundary'],
    'data fetching': ['fetch', 'axios', 'swr', 'react query', 'tanstack query'],
    'build tools': ['webpack', 'vite', 'rollup', 'esbuild', 'bundler'],
    'git': ['git', 'github', 'version control', 'merge', 'branch']
  }

  const suggestedTags: string[] = []
  
  // Check each category
  for (const [tag, keywords] of Object.entries(techKeywords)) {
    const hasKeyword = keywords.some(keyword => text.includes(keyword))
    if (hasKeyword && !suggestedTags.includes(tag)) {
      suggestedTags.push(tag)
    }
  }

  // Add some context-based suggestions
  if (text.includes('how to') || text.includes('how do i')) {
    if (!suggestedTags.includes('tutorial')) suggestedTags.push('tutorial')
  }
  
  if (text.includes('error') || text.includes('problem') || text.includes('issue')) {
    if (!suggestedTags.includes('debugging')) suggestedTags.push('debugging')
  }

  if (text.includes('best practice') || text.includes('recommendation')) {
    if (!suggestedTags.includes('best practices')) suggestedTags.push('best practices')
  }

  return suggestedTags.slice(0, 8) // Return top 8 suggestions
}

// Get trending tags from database
export const getTrendingTags = async (): Promise<string[]> => {
  try {
    const supabase = createClient()
    if (!supabase) return []

    // Get all tags from recent questions (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data, error } = await supabase
      .from('questions')
      .select('tags')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .not('tags', 'is', null)

    if (error || !data) return []

    // Count tag frequency
    const tagCounts: Record<string, number> = {}
    
    data.forEach(question => {
      if (question.tags && Array.isArray(question.tags)) {
        question.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      }
    })

    // Sort by frequency and return top tags
    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([tag]) => tag)

  } catch (error) {
    console.error('Error fetching trending tags:', error)
    return []
  }
}

// Get all unique tags from database
export const getAllTags = async (): Promise<string[]> => {
  try {
    const supabase = createClient()
    if (!supabase) return []

    const { data, error } = await supabase
      .from('questions')
      .select('tags')
      .not('tags', 'is', null)

    if (error || !data) return []

    const allTags = new Set<string>()
    
    data.forEach(question => {
      if (question.tags && Array.isArray(question.tags)) {
        question.tags.forEach(tag => allTags.add(tag))
      }
    })

    return Array.from(allTags).sort()

  } catch (error) {
    console.error('Error fetching all tags:', error)
    return []
  }
}

// Combined tag suggestions
export const getTagSuggestions = async (title: string, content: string) => {
  const [contentTags, trendingTags] = await Promise.all([
    Promise.resolve(extractTagsFromContent(title, content)),
    getTrendingTags()
  ])

  // Combine and deduplicate
  const allSuggestions = [...contentTags, ...trendingTags]
  const uniqueTags = Array.from(new Set(allSuggestions))

  return {
    contentBased: contentTags,
    trending: trendingTags,
    all: uniqueTags.slice(0, 20) // Limit to 20 suggestions
  }
}
