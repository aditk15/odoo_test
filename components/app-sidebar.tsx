"use client"

import type * as React from "react"
import { Command, Frame, LifeBuoy, Map, PieChart, Send, Home, MessageSquare, Users, TrendingUp } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"

const data = {
  user: {
    name: "Demo User",
    email: "demo@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: true,
    },
    {
      title: "Questions",
      url: "/dashboard/questions",
      icon: MessageSquare,
      items: [
        {
          title: "All Questions",
          url: "/dashboard/questions",
        },
        {
          title: "My Questions",
          url: "/dashboard/questions/my-questions",
        },
        {
          title: "Ask Question",
          url: "/ask",
        },
      ],
    },
    {
      title: "Community",
      url: "/dashboard/community",
      icon: Users,
      items: [
        {
          title: "Top Contributors",
          url: "/dashboard/community/contributors",
        },
        {
          title: "Leaderboard",
          url: "/dashboard/community/leaderboard",
        },
      ],
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: TrendingUp,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "JavaScript",
      url: "/tags/javascript",
      icon: Frame,
    },
    {
      name: "React",
      url: "/tags/react",
      icon: PieChart,
    },
    {
      name: "Next.js",
      url: "/tags/nextjs",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  const userData = user
    ? {
        name: user.email?.split("@")[0] || "User",
        email: user.email || "user@example.com",
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`,
      }
    : data.user

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-orange-600 text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">StackIt</span>
                  <span className="truncate text-xs">Q&A Platform</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
