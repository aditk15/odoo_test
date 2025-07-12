"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader } from "@/components/ui/card"
import { Search, Plus, MessageSquare, ChevronUp } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { NotificationBell } from "@/components/notification-bell"
import { isSupabaseConfigured } from "@/lib/supabase"
import { SetupBanner } from "@/components/setup-banner"

interface Question {
  id: string
  title: string
  content: string
  tags: string[]
  author: string
  created_at: string
  vote_count: number
  answer_count: number
}

export default function HomePage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      if (!isSupabaseConfigured()) {
        // Use mock data when Supabase is not configured
        const mockQuestions = [
          {
            id: "1",
            title: "How to implement authentication in Next.js?",
            content:
              "I'm building a Next.js application and need to implement user authentication. What are the best practices?",
            tags: ["Next.js", "Authentication", "React"],
            author: "john_doe",
            created_at: new Date().toISOString(),
            vote_count: 5,
            answer_count: 3,
          },
          {
            id: "2",
            title: "Best practices for React state management",
            content: "What are the current best practices for managing state in React applications?",
            tags: ["React", "State Management", "Redux"],
            author: "jane_smith",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            vote_count: 8,
            answer_count: 2,
          },
          {
            id: "3",
            title: "How to optimize database queries?",
            content:
              "My application is running slow due to database queries. What are some techniques to optimize performance?",
            tags: ["Database", "Performance", "SQL"],
            author: "dev_user",
            created_at: new Date(Date.now() - 172800000).toISOString(),
            vote_count: 12,
            answer_count: 5,
          },
        ]
        setQuestions(mockQuestions)
        return
      }

      const supabase = createClient()
      const { data, error } = await supabase
        .from("questions")
        .select(`
        *,
        profiles(username),
        votes(vote_type),
        answers(id)
      `)
        .order("created_at", { ascending: false })

      if (error) throw error

      const formattedQuestions =
        data?.map((q) => ({
          id: q.id,
          title: q.title,
          content: q.content,
          tags: q.tags || [],
          author: q.profiles?.username || "Anonymous",
          created_at: q.created_at,
          vote_count: q.votes?.reduce((acc: number, vote: any) => acc + (vote.vote_type === "up" ? 1 : -1), 0) || 0,
          answer_count: q.answers?.length || 0,
        })) || []

      setQuestions(formattedQuestions)
    } catch (error) {
      console.error("Error fetching questions:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredQuestions = questions.filter(
    (q) =>
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-bold text-orange-600">
                StackIt
              </Link>
            </div>

            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user && <NotificationBell />}
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Welcome, {user.email}</span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/auth/logout">Logout</Link>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/auth/login">Login</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/auth/register">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SetupBanner />

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Questions</h1>
            <p className="text-gray-600 mt-1">{filteredQuestions.length} questions</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((question) => (
              <Card key={question.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link
                        href={`/questions/${question.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-orange-600 transition-colors"
                      >
                        {question.title}
                      </Link>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>by {question.author}</span>
                        <span>{new Date(question.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {question.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-500 ml-4">
                      <div className="flex items-center space-x-1">
                        <ChevronUp className="h-4 w-4" />
                        <span>{question.vote_count}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{question.answer_count}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {filteredQuestions.length === 0 && !loading && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
            <p className="text-gray-500">Be the first to ask a question!</p>
          </div>
        )}
      </div>

      {/* Floating Ask Question Button */}
      {user && (
        <Link href="/ask">
          <Button size="lg" className="fixed bottom-8 right-8 rounded-full shadow-lg hover:shadow-xl transition-shadow">
            <Plus className="h-5 w-5 mr-2" />
            Ask Question
          </Button>
        </Link>
      )}
    </div>
  )
}
