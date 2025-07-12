// Enhanced dynamic tag system with trend analysis
import { createClient } from "@/lib/supabase"

// Content-based keyword extraction with enhanced trend awareness
export const extractTagsFromContent = (title: string, content: string): string[] => {
  const text = `${title} ${content}`.toLowerCase()
  
  // Enhanced technology keywords with current trends (2024-2025)
  const techKeywords = {
    'react': ['react', 'reactjs', 'react.js', 'jsx', 'hooks', 'usestate', 'useeffect', 'react 18', 'react 19'],
    'javascript': ['javascript', 'js', 'vanilla js', 'ecmascript', 'es6', 'es2023', 'es2024'],
    'typescript': ['typescript', 'ts', 'type script', 'typed javascript', 'typescript 5'],
    'next.js': ['next.js', 'nextjs', 'next js', 'vercel', 'app router', 'pages router', 'next 14', 'next 15'],
    'node.js': ['node.js', 'nodejs', 'node js', 'npm', 'express', 'server side', 'node 20'],
    'python': ['python', 'django', 'flask', 'fastapi', 'pandas', 'numpy', 'python 3.12'],
    'css': ['css', 'stylesheet', 'styles', 'flexbox', 'grid', 'responsive', 'css grid'],
    'html': ['html', 'markup', 'dom', 'semantic', 'accessibility', 'html5'],
    'database': ['database', 'sql', 'postgresql', 'mysql', 'mongodb', 'prisma', 'query', 'postgres'],
    'authentication': ['auth', 'authentication', 'login', 'signup', 'jwt', 'session', 'oauth', 'auth0'],
    'api': ['api', 'rest', 'graphql', 'endpoint', 'fetch', 'axios', 'http', 'rest api'],
    'tailwind': ['tailwind', 'tailwindcss', 'utility classes', 'responsive design', 'tailwind v3'],
    'supabase': ['supabase', 'realtime', 'row level security', 'rls', 'supabase auth'],
    'firebase': ['firebase', 'firestore', 'firebase auth', 'firebase v9'],
    'deployment': ['deploy', 'deployment', 'hosting', 'vercel', 'netlify', 'heroku', 'aws'],
    'testing': ['test', 'testing', 'jest', 'cypress', 'unit test', 'integration', 'vitest'],
    'performance': ['performance', 'optimization', 'lazy loading', 'caching', 'speed', 'lighthouse'],
    'security': ['security', 'xss', 'csrf', 'sanitization', 'validation', 'cybersecurity'],
    'mobile': ['mobile', 'responsive', 'react native', 'ios', 'android', 'pwa'],
    'state management': ['state', 'redux', 'zustand', 'context', 'global state', 'redux toolkit'],
    'styling': ['styling', 'styled components', 'emotion', 'sass', 'less', 'css modules'],
    'forms': ['form', 'validation', 'input', 'form handling', 'react hook form', 'formik'],
    'routing': ['routing', 'router', 'navigation', 'routes', 'link', 'react router'],
    'error handling': ['error', 'exception', 'try catch', 'error boundary', 'debugging'],
    'data fetching': ['fetch', 'axios', 'swr', 'react query', 'tanstack query', 'rtk query'],
    'build tools': ['webpack', 'vite', 'rollup', 'esbuild', 'bundler', 'turbopack'],
    'git': ['git', 'github', 'version control', 'merge', 'branch', 'gitlab'],
    'ai': ['ai', 'artificial intelligence', 'machine learning', 'chatgpt', 'openai', 'llm'],
    'web3': ['web3', 'blockchain', 'crypto', 'ethereum', 'solidity', 'defi'],
    'microservices': ['microservices', 'docker', 'kubernetes', 'containerization', 'k8s'],
    'serverless': ['serverless', 'lambda', 'cloudflare workers', 'edge functions', 'vercel functions'],
    'vue.js': ['vue', 'vuejs', 'vue.js', 'vue 3', 'composition api', 'nuxt'],
    'angular': ['angular', 'angularjs', 'typescript angular', 'angular 17', 'rxjs'],
    'svelte': ['svelte', 'sveltekit', 'svelte 4', 'svelte 5', 'runes'],
    'websockets': ['websocket', 'real-time', 'socket.io', 'sse', 'live updates'],
    'graphql': ['graphql', 'apollo', 'relay', 'graphql api', 'hasura'],
    'monitoring': ['monitoring', 'logging', 'analytics', 'sentry', 'datadog'],
    'devops': ['devops', 'ci/cd', 'github actions', 'pipeline', 'automation']
  }

  const suggestedTags: string[] = []
  
  // Check each category with enhanced scoring
  for (const [tag, keywords] of Object.entries(techKeywords)) {
    const matches = keywords.filter(keyword => text.includes(keyword))
    if (matches.length > 0 && !suggestedTags.includes(tag)) {
      suggestedTags.push(tag)
    }
  }

  // Enhanced context-based suggestions
  if (text.includes('how to') || text.includes('how do i') || text.includes('tutorial')) {
    if (!suggestedTags.includes('tutorial')) suggestedTags.push('tutorial')
  }
  
  if (text.includes('error') || text.includes('problem') || text.includes('issue') || text.includes('bug')) {
    if (!suggestedTags.includes('debugging')) suggestedTags.push('debugging')
  }

  if (text.includes('best practice') || text.includes('recommendation') || text.includes('advice')) {
    if (!suggestedTags.includes('best practices')) suggestedTags.push('best practices')
  }

  if (text.includes('beginner') || text.includes('new to') || text.includes('learning')) {
    if (!suggestedTags.includes('beginner')) suggestedTags.push('beginner')
  }

  return suggestedTags.slice(0, 10) // Return top 10 suggestions
}

// Get trending tags with enhanced analytics
export const getTrendingTags = async (days: number = 30): Promise<{
  tags: string[]
  analytics: { tag: string; count: number; growth: number }[]
}> => {
  try {
    const supabase = createClient()
    if (!supabase) return { tags: [], analytics: [] }

    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() - days)

    const { data, error } = await supabase
      .from('questions')
      .select('tags, created_at')
      .gte('created_at', targetDate.toISOString())
      .not('tags', 'is', null)

    if (error || !data) return { tags: [], analytics: [] }

    // Count tag frequency and calculate growth
    const tagCounts: Record<string, { count: number; recent: number }> = {}
    const halfwayDate = new Date()
    halfwayDate.setDate(halfwayDate.getDate() - days / 2)
    
    data.forEach(question => {
      if (question.tags && Array.isArray(question.tags)) {
        const isRecent = new Date(question.created_at) > halfwayDate
        question.tags.forEach(tag => {
          if (!tagCounts[tag]) {
            tagCounts[tag] = { count: 0, recent: 0 }
          }
          tagCounts[tag].count++
          if (isRecent) tagCounts[tag].recent++
        })
      }
    })

    // Calculate analytics with growth rate
    const analytics = Object.entries(tagCounts)
      .map(([tag, data]) => ({
        tag,
        count: data.count,
        growth: data.count > 0 ? (data.recent / (data.count - data.recent) || 0) : 0
      }))
      .sort((a, b) => {
        // Sort by weighted score: frequency + growth
        const scoreA = a.count + (a.growth * 2)
        const scoreB = b.count + (b.growth * 2)
        return scoreB - scoreA
      })

    const topTags = analytics.slice(0, 20).map(item => item.tag)

    return {
      tags: topTags,
      analytics: analytics.slice(0, 15)
    }

  } catch (error) {
    console.error('Error fetching trending tags:', error)
    return { tags: [], analytics: [] }
  }
}

// Get hot/emerging tags (tags with high recent growth)
export const getHotTags = async (): Promise<string[]> => {
  const { analytics } = await getTrendingTags(14) // Last 2 weeks
  return analytics
    .filter(item => item.growth > 0.5) // High growth rate
    .sort((a, b) => b.growth - a.growth)
    .slice(0, 8)
    .map(item => item.tag)
}

// Get tag suggestions by category for sidebar
export const getTagsByCategory = async () => {
  try {
    const supabase = createClient()
    if (!supabase) return {}

    const { data, error } = await supabase
      .from('questions')
      .select('tags')
      .not('tags', 'is', null)

    if (error || !data) return {}

    const allTags = new Set<string>()
    data.forEach(question => {
      if (question.tags && Array.isArray(question.tags)) {
        question.tags.forEach(tag => allTags.add(tag))
      }
    })

    // Categorize tags
    const categories = {
      'Frontend': [] as string[],
      'Backend': [] as string[],
      'Database': [] as string[],
      'DevOps': [] as string[],
      'Mobile': [] as string[],
      'Other': [] as string[]
    }

    const frontendTags = ['react', 'vue.js', 'angular', 'svelte', 'javascript', 'typescript', 'css', 'html', 'tailwind']
    const backendTags = ['node.js', 'python', 'api', 'serverless', 'microservices', 'authentication']
    const databaseTags = ['database', 'sql', 'mongodb', 'postgresql', 'mysql']
    const devopsTags = ['deployment', 'docker', 'kubernetes', 'ci/cd', 'monitoring', 'devops']
    const mobileTags = ['mobile', 'react native', 'ios', 'android', 'pwa']

    allTags.forEach(tag => {
      if (frontendTags.some(ft => tag.includes(ft) || ft.includes(tag))) {
        categories.Frontend.push(tag)
      } else if (backendTags.some(bt => tag.includes(bt) || bt.includes(tag))) {
        categories.Backend.push(tag)
      } else if (databaseTags.some(dt => tag.includes(dt) || dt.includes(tag))) {
        categories.Database.push(tag)
      } else if (devopsTags.some(dt => tag.includes(dt) || dt.includes(tag))) {
        categories.DevOps.push(tag)
      } else if (mobileTags.some(mt => tag.includes(mt) || mt.includes(tag))) {
        categories.Mobile.push(tag)
      } else {
        categories.Other.push(tag)
      }
    })

    return categories
  } catch (error) {
    console.error('Error categorizing tags:', error)
    return {}
  }
}

// Enhanced combined tag suggestions
export const getTagSuggestions = async (title: string, content: string) => {
  const [contentTags, trendingData, hotTags] = await Promise.all([
    Promise.resolve(extractTagsFromContent(title, content)),
    getTrendingTags(),
    getHotTags()
  ])

  return {
    contentBased: contentTags,
    trending: trendingData.tags,
    hot: hotTags,
    analytics: trendingData.analytics,
    all: [...new Set([...contentTags, ...trendingData.tags, ...hotTags])].slice(0, 25)
  }
}
