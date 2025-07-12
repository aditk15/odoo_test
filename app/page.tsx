"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare, ArrowUp, Calendar, User, ArrowRight, Users, Award } from "lucide-react"
import Link from "next/link"
import { createClient, isSupabaseConfigured } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

// Mock data for when Supabase is not configured
const mockQuestions = [
  {
    id: 1,
    title: "How to implement authentication in Next.js?",
    content:
      "I'm building a Next.js application and need to implement user authentication. What are the best practices?",
    author: "john_doe",
    author_id: "user1",
    created_at: "2024-01-15T10:30:00Z",
    upvotes: 15,
    answers: 3,
    tags: ["nextjs", "authentication", "react"],
    views: 234,
  },
  {
    id: 2,
    title: "React useState vs useReducer - when to use which?",
    content:
      "I'm confused about when I should use useState and when I should use useReducer in React. Can someone explain?",
    author: "react_learner",
    author_id: "user2",
    created_at: "2024-01-14T15:45:00Z",
    upvotes: 8,
    answers: 5,
    tags: ["react", "hooks", "state-management"],
    views: 156,
  },
  {
    id: 3,
    title: "Best database for a Node.js application?",
    content:
      "I'm starting a new Node.js project and need to choose a database. What are the pros and cons of different options?",
    author: "backend_dev",
    author_id: "user3",
    created_at: "2024-01-13T09:20:00Z",
    upvotes: 12,
    answers: 7,
    tags: ["nodejs", "database", "postgresql", "mongodb"],
    views: 289,
  },
]

interface Question {
  id: number
  title: string
  content: string
  author: string
  author_id: string
  created_at: string
  upvotes: number
  answers: number
  tags: string[]
  views: number
}

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Redirect to dashboard if user is logged in
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!user) {
      fetchQuestions()
    }
  }, [user])

  const fetchQuestions = async () => {
    try {
      setError(null)

      if (!isSupabaseConfigured()) {
        console.log("Using mock data - Supabase not configured")
        setQuestions(mockQuestions)
        return
      }

      const supabase = createClient()
      if (!supabase) {
        console.log("Supabase client not available, using mock data")
        setQuestions(mockQuestions)
        return
      }

      // Fetch questions from Supabase with correct schema
      const { data, error } = await supabase
        .from("questions")
        .select(`
          *,
          profiles:author_id (
            username,
            email
          )
        `)
        .order("created_at", { ascending: false })
        .limit(6)

      if (error) {
        console.error("Supabase error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        throw error
      }

      if (!data) {
        console.log("No data returned from Supabase, using mock data")
        setQuestions(mockQuestions)
        return
      }

      // Transform the data to match our interface
      const formattedQuestions: Question[] = data.map((question: any) => ({
        id: question.id,
        title: question.title,
        content: question.content,
        author: question.profiles?.username || question.profiles?.email || "Anonymous",
        author_id: question.author_id,
        created_at: question.created_at,
        upvotes: 0, // We can implement voting later
        answers: 0, // We can implement answer counting later
        views: question.view_count || 0,
        tags: question.tags || [], // tags are stored as array in questions table
      }))

      setQuestions(formattedQuestions)
    } catch (error: any) {
      console.error("Error fetching questions:", error)
      setError("Failed to load questions. Using sample data.")
      // Fallback to mock data on error
      setQuestions(mockQuestions)
    }
  }

  const filteredQuestions = questions.filter(
    (question) =>
      question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`

    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`

    const diffInMonths = Math.floor(diffInDays / 30)
    return `${diffInMonths}mo ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  // Don't render if user is logged in (will redirect)
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-orange-600">StackIt</h1>
              <span className="ml-2 text-sm text-gray-500">Q&A Platform</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-orange-600 hover:bg-orange-700">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Where developers find
            <span className="text-orange-600"> answers</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our community of developers sharing knowledge, solving problems, and building the future together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                Join the Community
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="flex justify-center">
                <MessageSquare className="h-12 w-12 text-orange-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">1,247</h3>
              <p className="text-gray-600">Questions Asked</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <Users className="h-12 w-12 text-orange-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">892</h3>
              <p className="text-gray-600">Active Members</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <Award className="h-12 w-12 text-orange-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">3,891</h3>
              <p className="text-gray-600">Answers Given</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Questions Preview */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Recent Questions</h2>
            <p className="text-gray-600">See what the community is discussing</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {filteredQuestions.slice(0, 3).map((question) => (
              <Card key={question.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Stats */}
                    <div className="flex flex-col items-center text-sm text-gray-500 min-w-[80px]">
                      <div className="flex items-center gap-1">
                        <ArrowUp className="h-4 w-4" />
                        <span>{question.upvotes}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{question.answers}</span>
                      </div>
                      <div className="text-xs mt-1">{question.views} views</div>
                    </div>

                    {/* Question Content */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800 mb-2">{question.title}</h3>

                      <p className="text-gray-600 mb-3 line-clamp-2">{question.content}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {question.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Author and Date */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${question.author}`} />
                            <AvatarFallback>
                              <User className="h-3 w-3" />
                            </AvatarFallback>
                          </Avatar>
                          <span>{question.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatTimeAgo(question.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/auth/register">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                Join to See More Questions
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-orange-400 mb-4">StackIt</h3>
              <p className="text-gray-400">
                A community-driven Q&A platform for developers to share knowledge and solve problems together.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Questions
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Tags
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Users
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Guidelines
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 StackIt. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
