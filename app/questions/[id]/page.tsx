"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ChevronUp, ChevronDown, Check, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { RichTextEditor } from "@/components/rich-text-editor"
import { RichTextDisplay } from "@/components/rich-text-display"
import { isSupabaseConfigured } from "@/lib/supabase"

interface Question {
  id: string
  title: string
  content: string
  tags: string[]
  author: string
  author_id: string
  created_at: string
  vote_count: number
}

interface Answer {
  id: string
  content: string
  author: string
  author_id: string
  created_at: string
  vote_count: number
  is_accepted: boolean
}

export default function QuestionDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const [question, setQuestion] = useState<Question | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [newAnswer, setNewAnswer] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchQuestion()
      fetchAnswers()
    }
  }, [params.id])

  const fetchQuestion = async () => {
    try {
      if (!isSupabaseConfigured()) {
        // Mock question data
        const mockQuestion = {
          id: params.id as string,
          title: "How to implement authentication in Next.js?",
          content:
            "I'm building a Next.js application and need to implement user authentication. What are the best practices and recommended libraries for handling authentication in Next.js?\n\nI've heard about NextAuth.js, but I'm not sure if it's the best option. What are the pros and cons of different authentication solutions?",
          tags: ["Next.js", "Authentication", "React"],
          author: "john_doe",
          author_id: "mock-user-1",
          created_at: new Date().toISOString(),
          vote_count: 5,
        }
        setQuestion(mockQuestion)
        return
      }

      const supabase = createClient()
      const { data, error } = await supabase
        .from("questions")
        .select(`
        *,
        profiles(username),
        votes(vote_type)
      `)
        .eq("id", params.id)
        .single()

      if (error) throw error

      const formattedQuestion = {
        id: data.id,
        title: data.title,
        content: data.content,
        tags: data.tags || [],
        author: data.profiles?.username || "Anonymous",
        author_id: data.author_id,
        created_at: data.created_at,
        vote_count: data.votes?.reduce((acc: number, vote: any) => acc + (vote.vote_type === "up" ? 1 : -1), 0) || 0,
      }

      setQuestion(formattedQuestion)
    } catch (error) {
      console.error("Error fetching question:", error)
    }
  }

  const fetchAnswers = async () => {
    try {
      if (!isSupabaseConfigured()) {
        // Mock answers data
        const mockAnswers = [
          {
            id: "1",
            content:
              "For Next.js authentication, I recommend using **NextAuth.js**. It's a complete authentication solution that supports multiple providers and is specifically designed for Next.js applications.\n\nHere are the key benefits:\n- Easy setup and configuration\n- Support for multiple providers (Google, GitHub, etc.)\n- Built-in security features\n- Great TypeScript support",
            author: "jane_smith",
            author_id: "mock-user-2",
            created_at: new Date().toISOString(),
            is_accepted: true,
            vote_count: 8,
          },
          {
            id: "2",
            content:
              "You could also consider using **Supabase Auth** or **Auth0**. Both provide excellent authentication services with good Next.js integration.\n\nSupabase Auth is particularly good if you're already using Supabase for your database.",
            author: "dev_expert",
            author_id: "mock-user-3",
            created_at: new Date(Date.now() - 3600000).toISOString(),
            is_accepted: false,
            vote_count: 3,
          },
        ]
        setAnswers(mockAnswers)
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { data, error } = await supabase
        .from("answers")
        .select(`
        *,
        profiles(username),
        votes(vote_type)
      `)
        .eq("question_id", params.id)
        .order("is_accepted", { ascending: false })
        .order("created_at", { ascending: true })

      if (error) throw error

      const formattedAnswers =
        data?.map((a) => ({
          id: a.id,
          content: a.content,
          author: a.profiles?.username || "Anonymous",
          author_id: a.author_id,
          created_at: a.created_at,
          is_accepted: a.is_accepted,
          vote_count: a.votes?.reduce((acc: number, vote: any) => acc + (vote.vote_type === "up" ? 1 : -1), 0) || 0,
        })) || []

      setAnswers(formattedAnswers)
    } catch (error) {
      console.error("Error fetching answers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!user || !newAnswer.trim()) return

    if (!isSupabaseConfigured()) {
      // Mock answer submission
      const mockAnswer = {
        id: Date.now().toString(),
        content: newAnswer,
        author: user.email || "demo_user",
        author_id: user.id,
        created_at: new Date().toISOString(),
        is_accepted: false,
        vote_count: 0,
      }
      setAnswers([...answers, mockAnswer])
      setNewAnswer("")
      return
    }

    setSubmitting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("answers").insert({
        question_id: params.id,
        content: newAnswer,
        author_id: user.id,
      })

      if (error) throw error

      setNewAnswer("")
      fetchAnswers()

      // Create notification for question author
      if (question && question.author_id !== user.id) {
        await supabase.from("notifications").insert({
          user_id: question.author_id,
          type: "answer",
          message: `${user.email} answered your question: ${question.title}`,
          question_id: params.id,
        })
      }
    } catch (error) {
      console.error("Error submitting answer:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleVote = async (type: "question" | "answer", id: string, voteType: "up" | "down") => {
    if (!user) return

    if (!isSupabaseConfigured()) {
      // Mock voting - just refresh the data
      if (type === "question") {
        fetchQuestion()
      } else {
        fetchAnswers()
      }
      return
    }

    try {
      const supabase = createClient()
      const table = type === "question" ? "questions" : "answers"

      // Check if user already voted
      const { data: existingVote } = await supabase
        .from("votes")
        .select("*")
        .eq("user_id", user.id)
        .eq(`${type}_id`, id)
        .single()

      if (existingVote) {
        // Update existing vote or remove if same
        if (existingVote.vote_type === voteType) {
          await supabase.from("votes").delete().eq("id", existingVote.id)
        } else {
          await supabase.from("votes").update({ vote_type: voteType }).eq("id", existingVote.id)
        }
      } else {
        // Create new vote
        await supabase.from("votes").insert({
          user_id: user.id,
          [`${type}_id`]: id,
          vote_type: voteType,
        })
      }

      // Refresh data
      if (type === "question") {
        fetchQuestion()
      } else {
        fetchAnswers()
      }
    } catch (error) {
      console.error("Error voting:", error)
    }
  }

  const handleAcceptAnswer = async (answerId: string) => {
    if (!user || !question || question.author_id !== user.id) return

    if (!isSupabaseConfigured()) {
      // Mock accept answer
      setAnswers(
        answers.map((answer) => ({
          ...answer,
          is_accepted: answer.id === answerId,
        })),
      )
      return
    }

    try {
      const supabase = createClient()

      // First, unaccept all answers for this question
      await supabase.from("answers").update({ is_accepted: false }).eq("question_id", params.id)

      // Then accept the selected answer
      await supabase.from("answers").update({ is_accepted: true }).eq("id", answerId)

      fetchAnswers()
    } catch (error) {
      console.error("Error accepting answer:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Question not found</h2>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Questions
        </Link>

        {/* Question */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{question.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <span>Asked by {question.author}</span>
                  <span>{new Date(question.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {question.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center space-y-2 ml-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote("question", question.id, "up")}
                  disabled={!user}
                >
                  <ChevronUp className="h-5 w-5" />
                </Button>
                <span className="font-semibold text-lg">{question.vote_count}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote("question", question.id, "down")}
                  disabled={!user}
                >
                  <ChevronDown className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RichTextDisplay content={question.content} />
          </CardContent>
        </Card>

        {/* Answers */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
          </h2>

          <div className="space-y-6">
            {answers.map((answer) => (
              <Card key={answer.id} className={answer.is_accepted ? "border-green-200 bg-green-50" : ""}>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex flex-col items-center space-y-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote("answer", answer.id, "up")}
                        disabled={!user}
                      >
                        <ChevronUp className="h-5 w-5" />
                      </Button>
                      <span className="font-semibold">{answer.vote_count}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote("answer", answer.id, "down")}
                        disabled={!user}
                      >
                        <ChevronDown className="h-5 w-5" />
                      </Button>
                      {user && question.author_id === user.id && (
                        <Button
                          variant={answer.is_accepted ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleAcceptAnswer(answer.id)}
                          className={answer.is_accepted ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="flex-1">
                      {answer.is_accepted && (
                        <div className="flex items-center space-x-2 mb-3">
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">Accepted Answer</span>
                        </div>
                      )}
                      <RichTextDisplay content={answer.content} />
                      <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                        <span>Answered by {answer.author}</span>
                        <span>{new Date(answer.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Answer Form */}
        {user ? (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Your Answer</h3>
            </CardHeader>
            <CardContent>
              <RichTextEditor value={newAnswer} onChange={setNewAnswer} placeholder="Write your answer here..." />
              <div className="flex justify-end mt-4">
                <Button onClick={handleSubmitAnswer} disabled={!newAnswer.trim() || submitting}>
                  {submitting ? "Posting..." : "Post Answer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600 mb-4">Please log in to post an answer.</p>
              <Link href="/auth/login">
                <Button>Login</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
