"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Hash, Flame, MoreHorizontal, Eye } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getTrendingTags, getHotTags, getTagsByCategory } from "@/lib/tag-suggestions"
import { useTagFilter } from "@/hooks/use-tag-filter"

interface TagAnalytics {
  tag: string
  count: number
  growth: number
}

interface NavTrendingTagsProps {
  // No props needed since we use context
}

export function NavTrendingTags({}: NavTrendingTagsProps) {
  const { isMobile } = useSidebar()
  const { selectedTags, handleTagSelect } = useTagFilter()
  const [trendingTags, setTrendingTags] = useState<string[]>([])
  const [hotTags, setHotTags] = useState<string[]>([])
  const [tagAnalytics, setTagAnalytics] = useState<TagAnalytics[]>([])
  const [activeView, setActiveView] = useState<'trending' | 'hot'>('trending')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTrendingData = async () => {
      setLoading(true)
      try {
        const [trendingData, hotTagsData] = await Promise.all([
          getTrendingTags(30),
          getHotTags()
        ])

        setTrendingTags(trendingData.tags)
        setHotTags(hotTagsData)
        setTagAnalytics(trendingData.analytics.slice(0, 8))
      } catch (error) {
        console.error('Error loading trending data:', error)
        // Fallback to popular tags
        setTrendingTags(['JavaScript', 'React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'MongoDB'])
        setHotTags(['React', 'TypeScript', 'Next.js', 'Authentication'])
        // Create mock analytics for fallback
        const mockAnalytics = ['JavaScript', 'React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'MongoDB'].map((tag, index) => ({
          tag,
          count: Math.floor(Math.random() * 50) + 10,
          growth: Math.random() * 0.3 + 0.1
        }))
        setTagAnalytics(mockAnalytics)
      } finally {
        setLoading(false)
      }
    }

    loadTrendingData()
  }, [])

  const handleTagClick = (tag: string) => {
    // Navigate to questions page with tag filter
    window.location.href = `/dashboard/questions?tag=${encodeURIComponent(tag)}`
  }

  const displayTags = activeView === 'trending' ? tagAnalytics : hotTags.slice(0, 8).map(tag => ({ tag, count: 0, growth: 0 }))

  const getGrowthColor = (growth: number) => {
    if (growth > 0.3) return 'text-green-600 bg-green-50'
    if (growth > 0.1) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getGrowthIcon = (growth: number) => {
    if (growth > 0.2) return '🚀'
    if (growth > 0.1) return '📈'
    return '📊'
  }

  if (loading) {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Loading Tags...</SidebarGroupLabel>
        <SidebarMenu>
          {[1, 2, 3, 4].map((i) => (
            <SidebarMenuItem key={i}>
              <SidebarMenuButton>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <div className="flex items-center justify-between px-2 mb-2">
        <SidebarGroupLabel className="flex items-center gap-2">
          {activeView === 'trending' ? (
            <>
              <TrendingUp className="h-4 w-4 text-orange-500" />
              Trending Tags
            </>
          ) : (
            <>
              <Flame className="h-4 w-4 text-red-500" />
              Hot Tags
            </>
          )}
        </SidebarGroupLabel>
        <div className="flex gap-1">
          <Button
            variant={activeView === 'trending' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('trending')}
            className={`h-6 px-2 text-xs ${
              activeView === 'trending' 
                ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                : 'hover:bg-orange-50 hover:text-orange-600'
            }`}
          >
            📈
          </Button>
          <Button
            variant={activeView === 'hot' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('hot')}
            className={`h-6 px-2 text-xs ${
              activeView === 'hot' 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'hover:bg-red-50 hover:text-red-600'
            }`}
          >
            🔥
          </Button>
        </div>
      </div>
      
      <SidebarMenu>
        {displayTags.map((item, index) => (
          <SidebarMenuItem key={item.tag}>
            <SidebarMenuButton 
              onClick={() => handleTagClick(item.tag)}
              className={`cursor-pointer ${selectedTags.includes(item.tag) ? 'bg-orange-50 border-l-2 border-orange-500' : ''}`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {activeView === 'trending' ? (
                  <Badge variant="outline" className="text-xs font-mono shrink-0 w-6 justify-center">
                    {index + 1}
                  </Badge>
                ) : (
                  <span className="text-red-500 text-sm shrink-0">🔥</span>
                )}
                <Hash className="h-3 w-3 shrink-0" />
                <span className="truncate">{item.tag}</span>
              </div>
              {activeView === 'trending' && item.count > 0 && (
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-gray-500">{item.count}</span>
                  <span className={`px-1 rounded text-xs ${getGrowthColor(item.growth)}`}>
                    {getGrowthIcon(item.growth)}
                  </span>
                </div>
              )}
            </SidebarMenuButton>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem onClick={() => handleTagClick(item.tag)}>
                  <Eye className="text-muted-foreground" />
                  <span>View Questions</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <TrendingUp className="text-muted-foreground" />
                  <span>Follow Tag</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Hash className="text-muted-foreground" />
                  <span>Hide Tag</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      
      {trendingTags.length > 8 && (
        <div className="px-2 mt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs text-gray-500 hover:text-gray-700"
            onClick={() => window.location.href = '/dashboard/tags'}
          >
            View all {trendingTags.length} tags →
          </Button>
        </div>
      )}
    </SidebarGroup>
  )
}
