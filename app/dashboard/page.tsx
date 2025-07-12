"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Users, Award, Plus, ArrowRight, Calendar, Eye } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

// Mock data for dashboard
const mockStats = {
  totalQuestions: 1247,
  totalAnswers: 3891,
  totalUsers: 892,
  myQuestions: 12,
  myAnswers: 28,
  reputation: 156,
}

const mockRecentQuestions = [
  {
    id: 1,
    title: "How to implement authentication in Next.js?",
    author: "john_doe",
    tags: ["Next.js", "Authentication", "React"],
    answers: 3,
    views: 234,
    created_at: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    title: "React useState vs useReducer - when to use which?",
    author: "react_learner",
    tags: ["React", "Hooks", "State Management"],
    answers: 5,
    views: 156,
    created_at: "2024-01-14T15:45:00Z",
  },
  {
    id: 3,
    title: "Best database for a Node.js application?",
    author: "backend_dev",
    tags: ["Node.js", "Database", "PostgreSQL"],
    answers: 7,
    views: 289,
    created_at: "2024-01-13T09:20:00Z",
  },
]

const mockTopContributors = [
  { name: "Sarah Chen", reputation: 2847, avatar: "SC" },
  { name: "Mike Johnson", reputation: 2156, avatar: "MJ" },
  { name: "Alex Rodriguez", reputation: 1923, avatar: "AR" },
  { name: "Emma Wilson", reputation: 1678, avatar: "EW" },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(mockStats)
  const [recentQuestions, setRecentQuestions] = useState(mockRecentQuestions)
  const [topContributors, setTopContributors] = useState(mockTopContributors)

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`

    const diffInWeeks = Math.floor(diffInDays / 7)
    return `${diffInWeeks}w ago`
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.email?.split("@")[0] || "User"}!</h1>
          <p className="text-muted-foreground">Here's what's happening in your Q&A community today.</p>
        </div>
        <Link href="/ask">
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus className="mr-2 h-4 w-4" />
            Ask Question
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuestions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Community Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Questions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.myQuestions}</div>
            <p className="text-xs text-muted-foreground">{stats.myAnswers} answers given</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reputation</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reputation}</div>
            <p className="text-xs text-muted-foreground">+23 this week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Questions */}
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Questions</CardTitle>
                <CardDescription>Latest questions from the community</CardDescription>
              </div>
              <Link href="/dashboard/questions">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentQuestions.map((question) => (
              <div
                key={question.id}
                className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 space-y-2">
                  <Link href={`/questions/${question.id}`}>
                    <h4 className="font-medium hover:text-orange-600 transition-colors">{question.title}</h4>
                  </Link>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>by {question.author}</span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatTimeAgo(question.created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>{question.answers} answers</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{question.views} views</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {question.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Contributors */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>
            <CardDescription>Community members with highest reputation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topContributors.map((contributor, index) => (
              <div key={contributor.name} className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-semibold text-sm">
                  #{index + 1}
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${contributor.name}`} />
                  <AvatarFallback>{contributor.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{contributor.name}</p>
                  <p className="text-sm text-muted-foreground">{contributor.reputation.toLocaleString()} reputation</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to get you started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/ask">
              <Button variant="outline" className="h-20 flex-col space-y-2 w-full bg-transparent">
                <Plus className="h-6 w-6" />
                <span>Ask a Question</span>
              </Button>
            </Link>
            <Link href="/dashboard/questions">
              <Button variant="outline" className="h-20 flex-col space-y-2 w-full bg-transparent">
                <MessageSquare className="h-6 w-6" />
                <span>Browse Questions</span>
              </Button>
            </Link>
            <Link href="/dashboard/community">
              <Button variant="outline" className="h-20 flex-col space-y-2 w-full bg-transparent">
                <Users className="h-6 w-6" />
                <span>Explore Community</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
