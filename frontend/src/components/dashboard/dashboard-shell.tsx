"use client"

import { toast } from "sonner"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  Loader2,
  LogOut,
  Medal,
  Plus,
  Swords,
  Trophy,
  User as UserIcon,
  Wallet,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { DashboardProvider, useDashboard } from "@/contexts/DashboardContext"
import { formatNaira } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Skeleton } from "./skeleton"

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, mobile: true },
  { href: "/dashboard/tournaments", label: "Tournaments", icon: Trophy, mobile: true },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet, mobile: true },
  { href: "/dashboard/matches", label: "Matches", icon: Swords, mobile: true },
  { href: "/dashboard/leaderboard", label: "Leaderboard", icon: Medal, mobile: false },
  { href: "/dashboard/profile", label: "Profile", icon: UserIcon, mobile: true },
]

const isActive = (pathname: string, href: string) =>
  href === "/dashboard" ? pathname === href : pathname.startsWith(href)

// Shared by the sidebar and the header menu
function useLogout() {
  const { logout } = useAuth()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
      toast.success("Logged out", { description: "See you next time!" })
    } finally {
      router.replace("/login")
    }
  }

  return { handleLogout, loggingOut }
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Not logged in -> send to login
  useEffect(() => {
    if (!isLoading && !user) router.replace("/login")
  }, [isLoading, user, router])

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <DashboardProvider>
      <Frame>{children}</Frame>
    </DashboardProvider>
  )
}

function Frame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { handleLogout, loggingOut } = useLogout()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-purple-600/10">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[#120b6e] bg-card/50 backdrop-blur-sm lg:flex">
        <div className="flex h-16 items-center px-6">
          <Link
            href="/dashboard"
            className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-2xl font-bold text-transparent"
          >
            Velqor
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-gradient-to-r from-primary to-purple-600 text-white shadow"
                    : "text-foreground/70 hover:bg-primary/10 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Logout pinned to the bottom */}
        <div className="border-t border-[#120b6e] p-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-60"
          >
            {loggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            {loggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <TopBar />
        <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6 lg:pb-10">
          {children}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-primary/10 bg-background/95 backdrop-blur lg:hidden">
        {NAV.filter((n) => n.mobile).map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                active ? "text-primary" : "text-foreground/60"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

function TopBar() {
  const { user } = useAuth()
  const { wallet, loading } = useDashboard()
  const { handleLogout, loggingOut } = useLogout()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close the menu on outside click / Escape
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [])

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.username
  const initial = (user?.first_name?.[0] ?? user?.username?.[0] ?? "?").toUpperCase()

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-primary/10 bg-background/80 px-4 backdrop-blur sm:px-6">
      <Link
        href="/dashboard"
        className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-xl font-bold text-transparent lg:hidden"
      >
        Velqor
      </Link>
      <div className="hidden lg:block" />

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Wallet chip */}
        <Link
          href="/dashboard/wallet"
          className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 py-1.5 pl-3 pr-2 text-sm font-semibold transition-colors hover:bg-primary/20"
        >
          {loading ? (
            <Skeleton className="h-4 w-14" />
          ) : (
            <span>{formatNaira(wallet?.balance ?? 0)}</span>
          )}
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Plus className="h-3 w-3" />
          </span>
        </Link>

        {/* Notifications (no badge until there is real data) */}
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-primary/10 hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
        </button>

        {/* Avatar menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={open}
            className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-primary/10"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-primary to-purple-600 text-sm font-semibold text-white">
              {initial}
            </span>
            <ChevronDown className="hidden h-4 w-4 text-foreground/60 sm:block" />
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl  bg-background shadow-xl"
            >
              <div className="border-b border-foreground/10 px-4 py-3">
                <p className="truncate text-sm font-semibold">{fullName}</p>
                <p className="truncate text-xs text-foreground/60">{user?.email}</p>
              </div>
              <Link
                href="/dashboard/profile"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-primary/10"
              >
                <UserIcon className="h-4 w-4" />
                Profile
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-60"
              >
                {loggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                {loggingOut ? "Logging out..." : "Log out"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}