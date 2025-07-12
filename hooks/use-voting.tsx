"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'

interface VoteData {
  questionId: string
  upvotes: number
  downvotes: number
  userVote: 'up' | 'down' | null
}

interface UseVotingProps {
  questionId: string
  answerId?: string
}

export function useVoting({ questionId, answerId }: UseVotingProps) {
  const { user } = useAuth()
  const [voteData, setVoteData] = useState<VoteData>({
    questionId,
    upvotes: 0,
    downvotes: 0,
    userVote: null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch vote counts and user's vote
  const fetchVoteData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const supabase = createClient()
      if (!supabase || !questionId) return

      // Get vote counts
      const { data: votes, error: votesError } = await supabase
        .from('votes')
        .select('vote_type, user_id')
        .eq(answerId ? 'answer_id' : 'question_id', answerId || questionId)

      if (votesError) throw votesError

      // Calculate counts
      const upvotes = votes?.filter(vote => vote.vote_type === 'up').length || 0
      const downvotes = votes?.filter(vote => vote.vote_type === 'down').length || 0
      
      // Get user's vote
      let userVote: 'up' | 'down' | null = null
      if (user) {
        const userVoteRecord = votes?.find(vote => vote.user_id === user.id)
        userVote = userVoteRecord?.vote_type || null
      }

      setVoteData({
        questionId,
        upvotes,
        downvotes,
        userVote
      })
    } catch (err) {
      console.error('Error fetching vote data:', err)
      setError('Failed to load vote data')
    } finally {
      setLoading(false)
    }
  }

  // Handle voting
  const vote = async (voteType: 'up' | 'down') => {
    if (!user) {
      setError('You must be logged in to vote')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const supabase = createClient()
      if (!supabase) throw new Error('Supabase client not available')

      // Call the handle_vote function
      const { data, error } = await supabase.rpc('handle_vote', {
        target_question_id: questionId,
        target_answer_id: answerId || null,
        new_vote_type: voteType
      })

      if (error) throw error

      // Refresh vote data
      await fetchVoteData()
      
      return data
    } catch (err) {
      console.error('Error voting:', err)
      setError('Failed to submit vote')
    } finally {
      setLoading(false)
    }
  }

  // Optimistic update for better UX
  const optimisticVote = async (voteType: 'up' | 'down') => {
    if (!user) {
      setError('You must be logged in to vote')
      return
    }

    // Store original state for rollback
    const originalData = { ...voteData }

    // Optimistic update
    setVoteData(prev => {
      const newData = { ...prev }
      
      // Remove previous vote counts
      if (prev.userVote === 'up') newData.upvotes--
      if (prev.userVote === 'down') newData.downvotes--
      
      // Add new vote or remove if same
      if (prev.userVote === voteType) {
        newData.userVote = null
      } else {
        newData.userVote = voteType
        if (voteType === 'up') newData.upvotes++
        if (voteType === 'down') newData.downvotes++
      }
      
      return newData
    })

    try {
      await vote(voteType)
    } catch (err) {
      // Rollback on error
      setVoteData(originalData)
    }
  }

  useEffect(() => {
    if (questionId) {
      fetchVoteData()
    }
  }, [questionId, answerId, user])

  return {
    voteData,
    loading,
    error,
    vote: optimisticVote,
    refetch: fetchVoteData
  }
}

// Hook for fetching multiple questions' vote data efficiently
export function useQuestionsVoting(questionIds: string[]) {
  const { user } = useAuth()
  const [votesData, setVotesData] = useState<Record<string, VoteData>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAllVotes = async () => {
    if (!questionIds.length) return

    try {
      setLoading(true)
      setError(null)

      const supabase = createClient()
      if (!supabase) return

      // Use the SQL function to get vote counts efficiently
      const { data, error } = await supabase.rpc('get_question_vote_counts', {
        question_ids: questionIds
      })

      if (error) throw error

      // Transform data into our format
      const votesMap: Record<string, VoteData> = {}
      data?.forEach((item: any) => {
        votesMap[item.question_id] = {
          questionId: item.question_id,
          upvotes: item.upvotes || 0,
          downvotes: item.downvotes || 0,
          userVote: item.user_vote || null
        }
      })

      setVotesData(votesMap)
    } catch (err) {
      console.error('Error fetching votes data:', err)
      setError('Failed to load vote data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (questionIds.length > 0) {
      fetchAllVotes()
    }
  }, [questionIds.join(','), user])

  return {
    votesData,
    loading,
    error,
    refetch: fetchAllVotes
  }
}
