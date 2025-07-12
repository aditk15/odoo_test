"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'

export interface Notification {
  id: string
  type: 'upvote' | 'downvote' | 'answer' | 'comment' | 'mention'
  title: string
  message: string
  data: any
  question_id?: string
  answer_id?: string
  triggered_by?: string
  is_read: boolean
  created_at: string
  triggered_by_profile?: {
    username?: string
    email?: string
    avatar_url?: string
  }
}

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch notifications
  const fetchNotifications = async (limit = 20) => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const supabase = createClient()
      if (!supabase) return

      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          triggered_by_profile:triggered_by (
            username,
            email,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      setNotifications(data || [])
      
      // Count unread notifications
      const unread = data?.filter(notif => !notif.is_read).length || 0
      setUnreadCount(unread)

    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const supabase = createClient()
      if (!supabase) return

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) throw error

      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      )

      setUnreadCount(prev => Math.max(0, prev - 1))

    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return

    try {
      const supabase = createClient()
      if (!supabase) return

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) throw error

      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      )
      setUnreadCount(0)

    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    }
  }

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const supabase = createClient()
      if (!supabase) return

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error

      // Update local state
      const deletedNotif = notifications.find(n => n.id === notificationId)
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
      
      if (deletedNotif && !deletedNotif.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }

    } catch (err) {
      console.error('Error deleting notification:', err)
    }
  }

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return

    const supabase = createClient()
    if (!supabase) return

    // Subscribe to new notifications
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New notification received:', payload)
          // Refetch to get the complete notification with relations
          fetchNotifications()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications
  }
}
