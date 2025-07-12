"use client"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Search, User, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { createClient, isSupabaseConfigured } from "@/lib/supabase"

// Mock notifications
const mockNotifications = [
  {
    id: 1,
    message: "Your question received a new answer",
    created_at: new Date().toISOString(),
    read: false
  },
  {
    id: 2,
    message: "Someone upvoted your answer",
    created_at: new Date().toISOString(),
    read: false
  }
]

export function Navbar() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [notificationCount, setNotificationCount] = useState(0)
  const [loading, setLoading] = useState(false)

  // Use useCallback to prevent function recreation on every render
  const fetchNotifications = useCallback(async () => {
    if (!user || loading) return

    try {
      setLoading(true)

      if (!isSupabaseConfigured()) {
        setNotifications(mockNotifications)
        setNotificationCount(mockNotifications.filter(n => !n.read).length)
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