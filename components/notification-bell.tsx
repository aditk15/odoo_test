"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Bell } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { isSupabaseConfigured } from "@/lib/supabase"

interface Notification {
  id: string
  message: string
  created_at: string
  is_read: boolean
  type: string
}

export function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      if (!isSupabaseConfigured()) {
        // Mock notifications
        const mockNotifications = [
          {
            id: "1",
            message: "jane_smith answered your question: How to implement authentication in Next.js?",
            created_at: new Date().toISOString(),
            is_read: false,
            type: "answer",
          },
          {
            id: "2",
            message: "dev_expert commented on your answer",
            created_at: new Date(Date.now() - 3600000).toISOString(),
            is_read: true,
            type: "comment",
          },
        ]
        setNotifications(mockNotifications)
        setUnreadCount(mockNotifications.filter((n) => !n.is_read).length)
        return
      }

      fetchNotifications()

      // Set up real-time subscription
      const supabase = createClient()
      const subscription = supabase
        .channel("notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchNotifications()
          },
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user])

  const fetchNotifications = async () => {
    if (!user || !isSupabaseConfigured()) return

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) throw error

      setNotifications(data || [])
      setUnreadCount(data?.filter((n) => !n.is_read).length || 0)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    if (!isSupabaseConfigured()) {
      // Mock mark as read
      setNotifications(notifications.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
      return
    }

    try {
      const supabase = createClient()
      await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId)

      fetchNotifications()
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    if (!isSupabaseConfigured()) {
      // Mock mark all as read
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
      return
    }

    try {
      const supabase = createClient()
      await supabase.from("notifications").update({ is_read: true }).eq("user_id", user?.id).eq("is_read", false)

      fetchNotifications()
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setShowDropdown(!showDropdown)} className="relative">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-80 z-50">
          <Card className="shadow-lg">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                    Mark all read
                  </Button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No notifications yet</div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                        !notification.is_read ? "bg-blue-50" : ""
                      }`}
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsRead(notification.id)
                        }
                      }}
                    >
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {showDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />}
    </div>
  )
}
