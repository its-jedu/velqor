"use client"

import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Medal, Award, TrendingUp, Calendar, User, Mail, Phone } from 'lucide-react'

export function ProfileContent() {
  const { user } = useAuth()

  if (!user) return null

  const stats = [
    { label: "Total Matches", value: user.stats.totalMatches, icon: TrendingUp },
    { label: "Wins", value: user.stats.wins, icon: Trophy },
    { label: "Losses", value: user.stats.losses, icon: Medal },
    { label: "Win Rate", value: `${user.stats.totalMatches > 0 ? Math.round((user.stats.wins / user.stats.totalMatches) * 100) : 0}%`, icon: Award },
    { label: "Total Winnings", value: `₦${user.stats.totalWinnings.toLocaleString()}`, icon: TrendingUp },
    { label: "Tournaments Won", value: user.stats.tournamentsWon, icon: Trophy },
  ]

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/10 to-purple-600/10">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold">{user.fullName}</h1>
              <p className="text-foreground/60">@{user.username}</p>
              <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                  {user.role}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Info */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-foreground/60" />
            <div>
              <p className="text-sm text-foreground/60">Username</p>
              <p className="font-semibold">{user.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-foreground/60" />
            <div>
              <p className="text-sm text-foreground/60">Email</p>
              <p className="font-semibold">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-foreground/60" />
            <div>
              <p className="text-sm text-foreground/60">Member Since</p>
              <p className="font-semibold">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/60">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className="w-8 h-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}