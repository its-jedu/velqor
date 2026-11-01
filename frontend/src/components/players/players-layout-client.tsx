"use client"

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Trophy, 
  Wallet, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  MessageCircle,
  Medal,
  Award,
  ChevronDown
} from 'lucide-react'

const sidebarLinks = [
  { name: 'Dashboard', href: '/players', icon: LayoutDashboard },
  { name: 'Tournaments', href: '/players/tournaments', icon: Trophy },
  { name: 'Wallet', href: '/players/wallet', icon: Wallet },
  { name: 'Leaderboard', href: '/players/leaderboard', icon: Medal },
  { name: 'Standings', href: '/players/standings', icon: Award },
  { name: 'Chat Room', href: '/players/chat', icon: MessageCircle },
  { name: 'Settings', href: '/players/settings', icon: Settings },
]

export function PlayersLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-purple-600/10">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 rounded-lg bg-primary/20 backdrop-blur-sm"
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
            {sidebarLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/70 hover:text-primary hover:bg-primary/10 transition-all group"
              >
                <link.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>{link.name}</span>
              </Link>
            ))}
          </nav>

          {/* User Info at bottom of sidebar (mobile only) */}
          <div className="p-4 border-t border-primary/20 lg:hidden">
            <div className="flex items-center gap-3">
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
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Top Navbar with User Menu */}
        <nav className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-primary/20">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="lg:hidden">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Velqor
              </h1>
            </div>

            {/* Right side - User menu */}
            <div className="relative ml-auto">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold">{user.username}</p>
                  <p className="text-xs text-foreground/60">Player</p>
                </div>
                <ChevronDown className="w-4 h-4 text-foreground/60" />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-background/95 backdrop-blur-xl rounded-lg border border-primary/20 shadow-xl z-50">
                    <div className="p-4 border-b border-primary/20">
                      <p className="font-semibold">{user.username}</p>
                      <p className="text-sm text-foreground/60">{user.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                          {user.role}
                        </span>
                      </div>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/players/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-foreground/70 hover:text-primary hover:bg-primary/10 transition-colors w-full"
                      >
                        <Users className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false)
                          logout()
                        }}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}