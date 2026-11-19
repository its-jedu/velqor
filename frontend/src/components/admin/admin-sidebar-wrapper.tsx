// src/components/admin/admin-sidebar-wrapper.tsx
"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Banknote,
  BarChart3,
  Bell,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Trophy,
  Users,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "./theme-toggle"
import { AdminUserMenu } from "./admin-user-menu"

const adminLinks = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Tournaments", href: "/admin/tournaments", icon: Trophy },
  { name: "Transactions", href: "/admin/transactions", icon: Banknote },
  { name: "Settings", href: "/admin/setting", icon: Settings },
]

// Bigger, easier-to-read sidebar items (and still centred when collapsed)
const itemClass =
  "h-11 gap-3 text-base font-medium [&>svg]:size-5 group-data-[collapsible=icon]:size-11! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-3!"

function useIsActive() {
  const pathname = usePathname()
  return (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href))
}

function AdminSidebar() {
  const { setOpenMobile, state, toggleSidebar } = useSidebar()
  const isActive = useIsActive()
  const collapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="group-data-[collapsible=icon]:size-11! group-data-[collapsible=icon]:justify-center"
            >
              <Link href="/admin" onClick={() => setOpenMobile(false)}>
                <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <Trophy className="size-5" />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-lg font-bold">Velqor</span>
                  <span className="truncate text-sm text-muted-foreground">Admin console</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm">Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {adminLinks.map((link) => (
                <SidebarMenuItem key={link.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(link.href)}
                    tooltip={link.name}
                    className={itemClass}
                  >
                    <Link href={link.href} onClick={() => setOpenMobile(false)}>
                      <link.icon />
                      <span>{link.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Collapse / expand lives in the sidebar, with a label so it's easy to spot */}
      <SidebarFooter className="hidden md:flex">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              variant="outline"
              onClick={toggleSidebar}
              tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={itemClass}
            >
              {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
              <span>Collapse sidebar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

function AdminHeader() {
  const isActive = useIsActive()
  const current = adminLinks
    .filter((l) => isActive(l.href))
    .sort((a, b) => b.href.length - a.href.length)[0]

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
      {/* Mobile only: on small screens the sidebar is a drawer and needs a button here */}
      <SidebarTrigger className="-ml-1 md:hidden" />
      <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4 md:hidden" />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink asChild>
              <Link href="/admin">Admin</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>{current?.name ?? "Overview"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive" />
        </Button>
        <ThemeToggle />
        <AdminUserMenu />
      </div>
    </header>
  )
}

export function AdminSidebarWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const admin = user?.role === "admin"

  useEffect(() => {
    if (isLoading) return
    if (!user) router.push("/login")
    else if (!admin) router.push("/players")
  }, [user, admin, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    )
  }

  if (!user || !admin) return null

  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          { "--sidebar-width": "17rem", "--sidebar-width-icon": "4rem" } as React.CSSProperties
        }
      >
        <AdminSidebar />
        <SidebarInset>
          <AdminHeader />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}