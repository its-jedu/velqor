"use client"

import { useState } from 'react'
import { Search, Filter, Calendar, DollarSign, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TournamentCard } from './tournament-card'

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

export function TournamentSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredTournaments = allTournaments.filter(tournament => {
    const matchesSearch = tournament.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tournament.game.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || tournament.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
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
        {filteredTournaments.map((tournament) => (
          <TournamentCard key={tournament.id} tournament={tournament} />
        ))}
      </div>

      {filteredTournaments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-foreground/60">No tournaments found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}