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
    return '#'
  }

  const triggerProfile = notification.triggered_by_profile
  const triggerName = triggerProfile?.username || triggerProfile?.email || 'Someone'

  return (
    <div 
      className={`p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
        !notification.is_read ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Notification Icon */}
        <div className="flex-shrink-0 mt-1">
          <NotificationIcon type={notification.type} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Link 
            href={getNotificationLink()}
            onClick={handleClick}
            className="block"
          >
            <p className="text-sm font-medium text-gray-900 mb-1">
              {notification.title}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              {notification.message}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Avatar className="h-4 w-4">
                <AvatarImage src={triggerProfile?.avatar_url} />
                <AvatarFallback className="text-xs">
                  {triggerName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{triggerName}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</span>
            </div>
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {!notification.is_read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                onMarkAsRead(notification.id)
              }}
              className="h-8 w-8 p-0"
              title="Mark as read"
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              onDelete(notification.id)
            }}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
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

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 p-0">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-96">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No notifications yet</p>
              <p className="text-xs text-gray-400 mt-1">
                You'll see updates here when people interact with your content
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Link href="/dashboard/notifications">
                <Button variant="ghost" size="sm" className="w-full">
                  View all notifications
                </Button>
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
        return
      }

      const supabase = createClient()
      if (!supabase) {
        setNotifications(mockNotifications)
        setNotificationCount(mockNotifications.filter(n => !n.read).length)
        return
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("read", false)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Error fetching notifications:", error)
        // Fallback to mock data on error
        setNotifications(mockNotifications)
        setNotificationCount(mockNotifications.filter(n => !n.read).length)
        return
      }

      setNotifications(data || [])
      setNotificationCount(data?.length || 0)
    } catch (error) {
      console.error("Error fetching notifications:", error)
      // Fallback to mock data
      setNotifications(mockNotifications)
      setNotificationCount(mockNotifications.filter(n => !n.read).length)
    } finally {
      setLoading(false)
    }
  }, [user, loading]) // Add loading to dependencies to prevent infinite loop

  // Only fetch notifications when user changes, not on every render
  useEffect(() => {
    if (user) {
      fetchNotifications()
    } else {
      setNotifications([])
      setNotificationCount(0)
    }
  }, [user]) // Remove fetchNotifications from dependencies to prevent infinite loop

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-orange-600">StackIt</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search questions..."
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                      <Bell className="h-5 w-5" />
                      {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {notificationCount > 9 ? "9+" : notificationCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    {notifications.length === 0 ? (
                      <DropdownMenuItem disabled>
                        No new notifications
                      </DropdownMenuItem>
                    ) : (
                      notifications.map((notification) => (
                        <DropdownMenuItem key={notification.id}>
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm">{notification.message}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </div>
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`}
                          alt={user.email || "User"}
                        />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}