"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Hash, Flame, Calendar, BarChart3 } from "lucide-react"
import Link from "next/link"
import { getTrendingTags, getHotTags, getTagsByCategory } from "@/lib/tag-suggestions"

interface TagAnalytics {
  tag: string
  count: number
  growth: number
}

interface TrendingTagsSidebarProps {
  onTagSelect?: (tag: string) => void
  selectedTags?: string[]
}

export function TrendingTagsSidebar({ onTagSelect, selectedTags = [] }: TrendingTagsSidebarProps) {
  const [trendingTags, setTrendingTags] = useState<string[]>([])
  const [hotTags, setHotTags] = useState<string[]>([])
  const [tagAnalytics, setTagAnalytics] = useState<TagAnalytics[]>([])
  const [tagCategories, setTagCategories] = useState<Record<string, string[]>>({})
  const [activeView, setActiveView] = useState<'trending' | 'hot' | 'categories'>('trending')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTrendingData = async () => {
      setLoading(true)
      try {
        const [trendingData, hotTagsData, categoriesData] = await Promise.all([
          getTrendingTags(30),
          getHotTags(),
          getTagsByCategory()
        ])
        
        setTrendingTags(trendingData.tags)
        setTagAnalytics(trendingData.analytics)
        setHotTags(hotTagsData)
        setTagCategories(categoriesData)
      } catch (error) {
        console.error('Error loading trending data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTrendingData()
  }, [])

  const getGrowthColor = (growth: number) => {
    if (growth > 1) return "text-green-600 bg-green-50"
    if (growth > 0.5) return "text-orange-600 bg-orange-50"
    return "text-gray-600 bg-gray-50"
  }

  const getGrowthIcon = (growth: number) => {
    if (growth > 1) return "🚀"
    if (growth > 0.5) return "📈"
    return "📊"
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Loading...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-6 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-1">
            <Button
              variant={activeView === 'trending' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('trending')}
              className="flex-1"
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Trending
            </Button>
            <Button
              variant={activeView === 'hot' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('hot')}
              className="flex-1"
            >
              <Flame className="h-4 w-4 mr-1" />
              Hot
            </Button>
            <Button
              variant={activeView === 'categories' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('categories')}
              className="flex-1"
            >
              <Hash className="h-4 w-4 mr-1" />
              Topics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trending Tags */}
      {activeView === 'trending' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Trending Tags
              <Badge variant="secondary" className="text-xs">
                Last 30 days
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trendingTags.length > 0 ? (
              <div className="space-y-3">
                {tagAnalytics.slice(0, 10).map((item, index) => (
                  <div
                    key={item.tag}
                    onClick={() => onTagSelect?.(item.tag)}
                    className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${
                      selectedTags.includes(item.tag) ? 'bg-orange-50 border border-orange-200' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs font-mono">
                        #{index + 1}
                      </Badge>
                      <span className="font-medium">{item.tag}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">{item.count}</span>
                      <span className={`px-2 py-1 rounded text-xs ${getGrowthColor(item.growth)}`}>
                        {getGrowthIcon(item.growth)} {Math.round(item.growth * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No trending data yet</p>
                <p className="text-sm">Ask some questions to see trends!</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Hot Tags */}
      {activeView === 'hot' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="h-5 w-5 text-red-500" />
              Hot Tags
              <Badge variant="secondary" className="text-xs">
                Rising fast
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hotTags.length > 0 ? (
              <div className="space-y-2">
                {hotTags.map((tag, index) => (
                  <div
                    key={tag}
                    onClick={() => onTagSelect?.(tag)}
                    className={`flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors border cursor-pointer ${
                      selectedTags.includes(tag) ? 'border-red-300 bg-red-50' : 'border-red-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-red-500 text-lg">🔥</span>
                      <span className="font-medium text-red-700">{tag}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Flame className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No hot trends yet</p>
                <p className="text-sm">Check back later!</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      {activeView === 'categories' && (
        <div className="space-y-4">
          {Object.entries(tagCategories).map(([category, tags]) => (
            tags.length > 0 && (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    {category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {tags.slice(0, 8).map(tag => (
                      <Badge 
                        key={tag}
                        variant="secondary" 
                        className={`text-xs hover:bg-orange-100 hover:text-orange-700 cursor-pointer transition-colors ${
                          selectedTags.includes(tag) ? 'bg-orange-100 text-orange-700' : ''
                        }`}
                        onClick={() => onTagSelect?.(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          ))}
        </div>
      )}

      {/* Stats Card */}
      <Card>
        <CardContent className="pt-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              Data from last 30 days
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{trendingTags.length}</div>
                <div className="text-xs text-gray-500">Trending Tags</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{hotTags.length}</div>
                <div className="text-xs text-gray-500">Hot Tags</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
