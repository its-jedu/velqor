"use client"

import { useState } from 'react'
import { Search, Calendar, DollarSign, Users, Play, Clock, Trophy } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'

// Mock data - replace with API call
const allTournaments = [
  {
    id: 1,
    title: "eFootball Champions League",
    game: "eFootball",
    entryFee: 5000,
    prizePool: 192000,
    players: 128,
    registered: 89,
    startDate: "2024-04-15",
    endDate: "2024-04-20",
    status: "upcoming",
    image: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800",
  },
  {
    id: 2,
    title: "COD: Modern Warfare Cup",
    game: "Call of Duty",
    entryFee: 10000,
    prizePool: 192000,
    players: 64,
    registered: 64,
    startDate: "2024-04-10",
    endDate: "2024-04-15",
    status: "active",
    image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=800",
  },
  {
    id: 3,
    title: "8Ball Pool Masters",
    game: "8Ball Pool",
    entryFee: 3000,
    prizePool: 230400,
    players: 256,
    registered: 156,
    startDate: "2024-04-20",
    endDate: "2024-04-25",
    status: "upcoming",
    image: "https://images.unsplash.com/photo-1614680376408-81e91ffe3db7?w=800",
  },
]

const activeTournaments = [
  {
    id: 2,
    title: "COD: Modern Warfare Cup",
    round: "Quarter Finals",
    opponent: "SniperElite",
    yourScore: 2,
    opponentScore: 1,
    timeRemaining: "2h 30m",
    prize: "₦50,000",
  }
]

const ads = [
  {
    icon: "🎁",
    title: "Weekly Bonus",
    description: "Deposit ₦10,000 and get ₦2,000 free!",
    buttonText: "Claim Now",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: "⚡",
    title: "Premium Pass",
    description: "Unlock exclusive tournaments with 2x rewards",
    buttonText: "Upgrade Now",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: "🛒",
    title: "Gaming Gear Sale",
    description: "Up to 40% off on gaming accessories",
    buttonText: "Shop Now",
    color: "from-blue-500 to-cyan-500",
  },
]

export function PlayersDashboard() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredTournaments = allTournaments.filter(tournament => {
    const matchesSearch = tournament.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tournament.game.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || tournament.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-foreground/60 mt-2">
          Ready to compete? Check out active tournaments or find new ones below.
        </p>
      </div>

      {/* Product Ads Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ads.map((ad, index) => (
          <Card
            key={index}
            className={`bg-gradient-to-r ${ad.color} border-0 cursor-pointer hover:scale-105 transition-transform duration-300`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{ad.icon}</span>
                <h3 className="text-lg font-semibold text-white">{ad.title}</h3>
              </div>
              <p className="text-white/90 text-sm mb-3">{ad.description}</p>
              <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0">
                {ad.buttonText}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Tournaments Section */}
      {activeTournaments.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Active Tournaments</h2>
          <div className="space-y-4">
            {activeTournaments.map((tournament) => (
              <Card key={tournament.id} className="border-primary/20 bg-gradient-to-r from-primary/10 to-purple-600/10">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{tournament.title}</h3>
                      <p className="text-foreground/60 text-sm mb-3">
                        {tournament.round} • vs {tournament.opponent}
                      </p>
                      
                      <div className="flex items-center gap-4 mb-3">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-500">{tournament.yourScore}</p>
                          <p className="text-xs text-foreground/60">You</p>
                        </div>
                        <span className="text-xl font-bold text-foreground/40">VS</span>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-red-500">{tournament.opponentScore}</p>
                          <p className="text-xs text-foreground/60">{tournament.opponent}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-foreground/60">
                          <Clock className="w-4 h-4" />
                          <span>{tournament.timeRemaining} remaining</span>
                        </div>
                        <div className="text-primary font-semibold">
                          Prize: {tournament.prize}
                        </div>
                      </div>
                    </div>

                    <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                      <Play className="w-4 h-4 mr-2" />
                      Resume Match
                    </Button>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-foreground/60 mb-1">
                      <span>Match Progress</span>
                      <span>Round 3 of 5</span>
                    </div>
                    <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-purple-600 rounded-full" style={{ width: '60%' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tournament Search Section */}
      <div>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Find Tournaments</h2>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <Input
                placeholder="Search tournaments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-primary/5 border-primary/20"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-lg bg-primary/5 border border-primary/20 text-foreground focus:outline-none focus:border-primary"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tournament) => {
            const progress = (tournament.registered / tournament.players) * 100
            return (
              <Card key={tournament.id} className="overflow-hidden border-primary/20 bg-gradient-to-br from-card/50 to-card hover:border-primary/40 transition-all duration-300 group">
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={tournament.image}
                    alt={tournament.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      tournament.status === 'active' 
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-500 text-white'
                    }`}>
                      {tournament.status === 'active' ? 'LIVE' : 'UPCOMING'}
                    </span>
                  </div>

                  <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-white">
                    ₦{tournament.prizePool.toLocaleString()}
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-1">{tournament.title}</h3>
                  <p className="text-foreground/60 text-sm mb-4">{tournament.game}</p>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-foreground/60">
                        <Users className="w-4 h-4" />
                        <span>Players</span>
                      </div>
                      <span>{tournament.registered}/{tournament.players}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-purple-600 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-foreground/60 text-right">
                        {Math.round(progress)}% filled
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-foreground/60">
                        <DollarSign className="w-4 h-4" />
                        <span>Entry Fee</span>
                      </div>
                      <span>₦{tournament.entryFee.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-foreground/60">
                        <Calendar className="w-4 h-4" />
                        <span>Starts</span>
                      </div>
                      <span>{new Date(tournament.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 group-hover:scale-105 transition-transform duration-300">
                    {tournament.status === 'active' ? (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Resume Tournament
                      </>
                    ) : (
                      <>
                        <Trophy className="w-4 h-4 mr-2" />
                        Join Tournament
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredTournaments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-foreground/60">No tournaments found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}