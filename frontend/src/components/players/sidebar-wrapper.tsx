"use client"

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Trophy, 
  Wallet, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react'

const playerLinks = [
  { name: 'Dashboard', href: '/players', icon: LayoutDashboard },
  { name: 'My Tournaments', href: '/players/tournaments', icon: Trophy },
  { name: 'Wallet', href: '/players/wallet', icon: Wallet },
  { name: 'Profile', href: '/players/profile', icon: User },
  { name: 'Settings', href: '/players/settings', icon: Settings },
]

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary/20 backdrop-blur-sm"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-screen w-64 bg-background/95 backdrop-blur-xl border-r border-primary/20
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-primary/20">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Velqor
            </h1>
            <p className="text-xs text-foreground/60 mt-1">Player Dashboard</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {playerLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/70 hover:text-primary hover:bg-primary/10 transition-all"
              >
                <link.icon className="w-5 h-5" />
                <span>{link.name}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{user.username}</p>
                <p className="text-xs text-foreground/60">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </>
  )
}