"use client"

import { ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useVoting } from "@/hooks/use-voting"
import { cn } from "@/lib/utils"

interface VotingComponentProps {
  questionId: string
  answerId?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function VotingComponent({ 
  questionId, 
  answerId, 
  className,
  size = 'md'
}: VotingComponentProps) {
  const { voteData, loading, error, vote } = useVoting({ questionId, answerId })

  const sizeClasses = {
    sm: {
      button: 'h-8 w-8',
      icon: 'h-3 w-3',
      text: 'text-sm',
      container: 'gap-1'
    },
    md: {
      button: 'h-10 w-10',
      icon: 'h-4 w-4',
      text: 'text-base',
      container: 'gap-2'
    },
    lg: {
      button: 'h-12 w-12',
      icon: 'h-5 w-5',
      text: 'text-lg',
      container: 'gap-3'
    }
  }

  const styles = sizeClasses[size]
  const netScore = voteData.upvotes - voteData.downvotes

  return (
    <div className={cn(
      "flex flex-col items-center",
      styles.container,
      className
    )}>
      {/* Upvote Button */}
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          styles.button,
          "rounded-md transition-all duration-200",
          voteData.userVote === 'up' 
            ? "bg-green-100 text-green-600 hover:bg-green-200" 
            : "text-gray-500 hover:bg-green-50 hover:text-green-600"
        )}
        onClick={() => vote('up')}
        disabled={loading}
      >
        <ArrowUp className={cn(
          styles.icon,
          voteData.userVote === 'up' ? "fill-current" : ""
        )} />
      </Button>

      {/* Vote Count */}
      <div className={cn(
        "font-bold tabular-nums",
        styles.text,
        netScore > 0 && "text-green-600",
        netScore < 0 && "text-red-600",
        netScore === 0 && "text-gray-500"
      )}>
        {netScore > 0 ? `+${netScore}` : netScore}
      </div>

      {/* Downvote Button */}
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          styles.button,
          "rounded-md transition-all duration-200",
          voteData.userVote === 'down' 
            ? "bg-red-100 text-red-600 hover:bg-red-200" 
            : "text-gray-500 hover:bg-red-50 hover:text-red-600"
        )}
        onClick={() => vote('down')}
        disabled={loading}
      >
        <ArrowDown className={cn(
          styles.icon,
          voteData.userVote === 'down' ? "fill-current" : ""
        )} />
      </Button>

      {/* Error Display */}
      {error && (
        <div className="text-xs text-red-500 mt-1 text-center max-w-20">
          {error}
        </div>
      )}
    </div>
  )
}

// Simplified component for displaying vote counts only (non-interactive)
export function VoteDisplay({ 
  upvotes, 
  downvotes, 
  size = 'sm',
  className 
}: { 
  upvotes: number
  downvotes: number
  size?: 'sm' | 'md' | 'lg'
  className?: string 
}) {
  const netScore = upvotes - downvotes
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base', 
    lg: 'text-lg'
  }

  return (
    <div className={cn(
      "flex flex-col items-center gap-1",
      className
    )}>
      <ArrowUp className="h-4 w-4 text-gray-400" />
      <div className={cn(
        "font-bold tabular-nums",
        sizeClasses[size],
        netScore > 0 && "text-green-600",
        netScore < 0 && "text-red-600", 
        netScore === 0 && "text-gray-500"
      )}>
        {netScore > 0 ? `+${netScore}` : netScore}
      </div>
      <ArrowDown className="h-4 w-4 text-gray-400" />
    </div>
  )
}
