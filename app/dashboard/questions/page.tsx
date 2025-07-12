"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Search, MessageSquare, ArrowUp, Calendar, User, Plus, Filter } from "lucide-react"
import Link from "next/link"
import { createClient, isSupabaseConfigured } from "@/lib/supabase"

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
  {
    id: 4,
    title: "TypeScript vs JavaScript for new projects",
    content:
      "I'm starting a new project and debating whether to use TypeScript or stick with JavaScript. What are the pros and cons?",
    author: "dev_curious",
    author_id: "user4",
    created_at: "2024-01-12T14:30:00Z",
    upvotes: 6,
    answers: 4,
    tags: ["typescript", "javascript", "development"],
    views: 178,
  },
  {
    id: 5,
    title: "How to optimize React performance?",
    content: "My React app is getting slow with large datasets. What are the best practices for optimization?",
    author: "performance_seeker",
    author_id: "user5",
    created_at: "2024-01-11T11:15:00Z",
    upvotes: 9,
    answers: 6,
    tags: ["react", "performance", "optimization"],
    views: 203,
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

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
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
    } finally {
      setLoading(false)
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Questions</h1>
            <p className="text-muted-foreground">Browse and search through community questions</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Questions</h1>
          <p className="text-muted-foreground">{filteredQuestions.length} questions found</p>
        </div>
        <Link href="/ask">
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus className="mr-2 h-4 w-4" />
            Ask Question
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search questions, tags, or users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">{error}</p>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">
                {searchTerm ? "No questions found matching your search." : "No questions available."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredQuestions.map((question) => (
            <Card key={question.id} className="hover:shadow-md transition-shadow">
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
                    <Link href={`/questions/${question.id}`}>
                      <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800 mb-2">{question.title}</h3>
                    </Link>

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
          ))
        )}
      </div>
    </div>
  )
}
