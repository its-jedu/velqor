"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Calendar, DollarSign, Users, Trophy, Play, Clock } from 'lucide-react'

interface Tournament {
  id: number
  title: string
  game: string
  entryFee: number
  prizePool: number
  players: number
  registered: number
  startDate: string
  endDate: string
  status: string
  image: string
}

interface TournamentCardProps {
  tournament: Tournament
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  const [isJoining, setIsJoining] = useState(false)
  const progress = (tournament.registered / tournament.players) * 100

  const handleJoin = async () => {
    setIsJoining(true)
    // API call to join tournament
    setTimeout(() => {
      setIsJoining(false)
      alert(`Joined ${tournament.title} successfully!`)
    }, 1500)
  }

  const handleResume = () => {
    // Redirect to tournament match page
    console.log('Resume tournament:', tournament.id)
  }

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card/50 to-card hover:border-primary/40 transition-all duration-300 group">
      <div className="relative h-40 overflow-hidden">
        <Image
          src={tournament.image}
          alt={tournament.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            tournament.status === 'active' 
              ? 'bg-green-500 text-white'
              : 'bg-blue-500 text-white'
          }`}>
            {tournament.status === 'active' ? 'LIVE' : 'UPCOMING'}
          </span>
        </div>

        {/* Prize Pool */}
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

          {/* Progress Bar */}
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
              <span>Started</span>
            </div>
            <span>{new Date(tournament.startDate).toLocaleDateString()}</span>
          </div>
        </div>

        {tournament.status === 'active' ? (
          <Button
            onClick={handleResume}
            className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 group-hover:scale-105 transition-transform duration-300"
          >
            <Play className="w-4 h-4 mr-2" />
            Resume Tournament
          </Button>
        ) : (
          <Button
            onClick={handleJoin}
            disabled={isJoining}
            className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 group-hover:scale-105 transition-transform duration-300"
          >
            {isJoining ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Joining...
              </div>
            ) : (
              <>
                <Trophy className="w-4 h-4 mr-2" />
                Join Tournament
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}