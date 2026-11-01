"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Clock, Trophy } from 'lucide-react'

// Mock active tournaments - replace with API call
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

export function ActiveTournaments() {
  if (activeTournaments.length === 0) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-card/50 to-card">
        <CardContent className="py-12 text-center">
          <Trophy className="w-16 h-16 text-primary/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Active Tournaments</h3>
          <p className="text-foreground/60">
            You're not currently participating in any tournaments. Join one above!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
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
                  
                  {/* Match Score */}
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

              {/* Progress Bar */}
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
  )
}