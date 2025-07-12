"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, ArrowLeft, Sparkles, TrendingUp, Hash } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { RichTextEditor } from "@/components/rich-text-editor"
import { isSupabaseConfigured } from "@/lib/supabase"
import { getTagSuggestions, extractTagsFromContent } from "@/lib/tag-suggestions"

const POPULAR_TAGS = [
  "React",
  "JavaScript", 
  "TypeScript",
  "Next.js",
  "Node.js",
  "Python",
  "HTML",
  "CSS",
  "Tailwind",
  "Database",
  "API",
  "Authentication",
]

export default function AskQuestionPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [tagSuggestions, setTagSuggestions] = useState<{
    contentBased: string[]
    trending: string[]
    all: string[]
  }>({ contentBased: [], trending: [], all: [] })
  const [loadingTags, setLoadingTags] = useState(false)

  // Get content-based suggestions in real-time
  const contentBasedTags = useMemo(() => {
    if (!title.trim() && !content.trim()) return []
    return extractTagsFromContent(title, content)
  }, [title, content])

  // Load trending tags on component mount
  useEffect(() => {
    const loadTagSuggestions = async () => {
      setLoadingTags(true)
      try {
        const suggestions = await getTagSuggestions(title, content)
        setTagSuggestions(suggestions)
      } catch (error) {
        console.error('Error loading tag suggestions:', error)
      } finally {
        setLoadingTags(false)
      }
    }

    loadTagSuggestions()
  }, []) // Load once on mount

  // Update content-based suggestions when title/content changes
  useEffect(() => {
    if (title.trim() || content.trim()) {
      setTagSuggestions(prev => ({
        ...prev,
        contentBased: contentBasedTags
      }))
    }
  }, [contentBasedTags])

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !title.trim() || !content.trim() || tags.length === 0) return

    if (!isSupabaseConfigured()) {
      // Mock question creation - redirect to a mock question
      router.push("/questions/1")
      return
    }

    setSubmitting(true)
    try {
      const supabase = createClient()
      if (!supabase) {
        throw new Error("Unable to create Supabase client")
      }
      
      const { data, error } = await supabase
        .from("questions")
        .insert({
          title: title.trim(),
          content: content.trim(),
          tags,
          author_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      router.push(`/questions/${data.id}`)
    } catch (error) {
      console.error("Error creating question:", error)
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Login Required</h2>
            <p className="text-gray-600 mb-4">Please log in to ask a question.</p>
            <Link href="/auth/login">
              <Button>Login</Button>
            </Link>
          </CardContent>
        </Card>
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

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Ask a Question</CardTitle>
            <p className="text-gray-600">Be specific and imagine you're asking a question to another person</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-base font-medium">
                  Title
                </Label>
                <p className="text-sm text-gray-600 mb-2">
                  Be specific and imagine you're asking a question to another person
                </p>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. How do I implement authentication in Next.js?"
                  className="text-base"
                  required
                />
              </div>

              <div>
                <Label className="text-base font-medium">Body</Label>
                <p className="text-sm text-gray-600 mb-2">
                  Include all the information someone would need to answer your question
                </p>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Provide details about your question..."
                />
              </div>

              <div>
                <Label className="text-base font-medium">Tags</Label>
                <p className="text-sm text-gray-600 mb-2">Add up to 5 tags to describe what your question is about</p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-sm">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="ml-2 hover:text-red-600">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2 mb-4">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addTag(newTag)
                      }
                    }}
                    disabled={tags.length >= 5}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addTag(newTag)}
                    disabled={!newTag.trim() || tags.length >= 5}
                  >
                    Add
                  </Button>
                </div>

                {/* Content-based suggestions */}
                {tagSuggestions.contentBased.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">Suggested for your content:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tagSuggestions.contentBased.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => addTag(tag)}
                          disabled={tags.includes(tag) || tags.length >= 5}
                          className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 disabled:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed border border-blue-200"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending tags */}
                {tagSuggestions.trending.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Trending tags {loadingTags && "(loading...)"}:
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tagSuggestions.trending.slice(0, 10).map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => addTag(tag)}
                          disabled={tags.includes(tag) || tags.length >= 5}
                          className="text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 disabled:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed border border-orange-200"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fallback to static popular tags if no dynamic suggestions */}
                {tagSuggestions.trending.length === 0 && tagSuggestions.contentBased.length === 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Hash className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Popular tags:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => addTag(tag)}
                          disabled={tags.includes(tag) || tags.length >= 5}
                          className="text-xs px-2 py-1 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed border border-gray-200"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" asChild>
                  <Link href="/">Cancel</Link>
                </Button>
                <Button type="submit" disabled={!title.trim() || !content.trim() || tags.length === 0 || submitting}>
                  {submitting ? "Posting..." : "Post Question"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
