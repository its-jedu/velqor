"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Trophy, Users } from "lucide-react"

const recentMatches = [
  {
    id: 1,
    tournament: "eFootball Champions League",
    opponent: "ShadowStrike",
    result: "Win",
    date: "2024-03-15",
    prize: "₦25,000",
  },
  {
    id: 2,
    tournament: "8Ball Pool Masters",
    opponent: "PoolLegend",
    result: "Loss",
    date: "2024-03-14",
    prize: "₦0",
  },
  {
    id: 3,
    tournament: "COD: Modern Warfare Cup",
    opponent: "SniperElite",
    result: "Win",
    date: "2024-03-12",
    prize: "₦50,000",
  },
]

export function RecentMatches() {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card/50 to-card backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Recent Matches</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentMatches.map((match) => (
            <div
              key={match.id}
              className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/10"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  match.result === "Win" 
                    ? "bg-green-500/20 text-green-500" 
                    : "bg-red-500/20 text-red-500"
                }`}>
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold">{match.tournament}</h4>
                  <p className="text-sm text-foreground/60">vs {match.opponent}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-foreground/60">
                    <Calendar className="w-3 h-3" />
                    <span>{match.date}</span>
                    <Users className="w-3 h-3 ml-2" />
                    <span>32 players</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-semibold ${
                  match.result === "Win" ? "text-green-500" : "text-red-500"
                }`}>
                  {match.result}
                </div>
                {match.prize !== "₦0" && (
                  <div className="text-sm text-primary">{match.prize}</div>
                )}
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-4">
          View All Matches
        </Button>
      </CardContent>
    </Card>
  )
}