"use client"

import { useState } from "react"
import { Bell, Check, Trash2, ArrowUp, MessageSquare, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useNotifications, type Notification } from "@/hooks/use-notifications"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

function NotificationIcon({ type }: { type: Notification['type'] }) {
  switch (type) {
    case 'upvote':
      return <ArrowUp className="h-4 w-4 text-green-600" />
    case 'downvote':
      return <ArrowUp className="h-4 w-4 text-red-600 rotate-180" />
    case 'answer':
      return <MessageSquare className="h-4 w-4 text-blue-600" />
    case 'mention':
      return <User className="h-4 w-4 text-purple-600" />
    default:
      return <Bell className="h-4 w-4 text-gray-600" />
  }
}

function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onDelete 
}: { 
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}) {
  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id)
    }
  }

  const getNotificationLink = () => {
    if (notification.question_id) {
      return `/questions/${notification.question_id}`
    }
    return "#"
  }

  return (
    <div 
      className={`p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
        !notification.is_read ? 'bg-orange-50/50 border-l-4 border-l-orange-500' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <NotificationIcon type={notification.type} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {notification.title}
            </h4>
            {!notification.is_read && (
              <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 ml-2"></div>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(notification.created_at))} ago
            </span>
            
            <div className="flex items-center gap-1">
              {!notification.is_read && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMarkAsRead(notification.id)
                  }}
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                size="sm"
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(notification.id)
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {notification.question_id && (
        <Link 
          href={getNotificationLink()}
          className="absolute inset-0 cursor-pointer"
          onClick={handleClick}
        />
      )}
    </div>
  )
}

export function NotificationBell() {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications()

  const [isOpen, setIsOpen] = useState(false)

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId)
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId)
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-96">
              {notifications.slice(0, 10).map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </ScrollArea>
            
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200">
                <Link href="/dashboard/notifications" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">
                    View all notifications
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
