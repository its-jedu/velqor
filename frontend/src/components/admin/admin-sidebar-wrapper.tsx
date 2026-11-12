"use client"

import { useAuth } from '@/contexts/AuthContext'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  Trophy,
  Banknote,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
} from 'lucide-react'

const adminLinks = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Tournaments', href: '/admin/tournaments', icon: Trophy },
  { name: 'Transactions', href: '/admin/transactions', icon: Banknote },
  { name: 'Settings', href: '/admin/setting', icon: Settings },
]

export function AdminSidebarWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login')
      } else if (user.role !== 'admin') {
        router.push('/players')
      }
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    )
  }

  if (!user || user.role !== 'admin') return null

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-card transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-border px-5">
          <div className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Trophy className="size-5" />
          </div>
          <div className="leading-tight">
            <p className="text-base font-bold tracking-tight">Velqor</p>
            <p className="text-xs text-muted-foreground">Admin console</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {adminLinks.map((link) => {
            const active = isActive(link.href)
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-primary" />
                )}
                <link.icon className="size-5" />
                <span>{link.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border p-3">
          <div className="mb-2 flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="grid size-9 place-items-center rounded-full bg-linear-to-br from-primary to-purple-600 text-sm font-semibold text-white">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user.username}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="size-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent lg:hidden"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>

          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search users, tournaments..."
              className="h-9 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div className="ml-auto">
            <button
              className="relative rounded-lg p-2 text-muted-foreground hover:bg-accent"
              aria-label="Notifications"
            >
              <Bell className="size-5" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive" />
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}