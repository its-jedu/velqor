"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, DollarSign } from "lucide-react"
import Image from "next/image"

// Calculate prize pool as 30% of (entry fee × number of players)
// Entry fee in Naira (converted from string to number for calculation)
const tournaments = [
  {
    id: 1,
    title: "eFootball Champions League",
    game: "eFootball",
    image: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    entryFee: 5000,
    players: 128,
    date: "Mar 15, 2024",
  },
  {
    id: 2,
    title: "COD: Modern Warfare Cup",
    game: "Call of Duty",
    image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    entryFee: 10000,
    players: 64,
    date: "Mar 20, 2024",
  },
  {
    id: 3,
    title: "8Ball Pool Masters",
    game: "8Ball Pool",
    image: "https://images.pexels.com/photos/1263349/pexels-photo-1263349.jpeg?auto=compress&cs=tinysrgb&w=800",
    entryFee: 3000,
    players: 256,
    date: "Mar 25, 2024",
  },
].map(tournament => ({
  ...tournament,
  entryFeeFormatted: `₦${tournament.entryFee.toLocaleString()}`,
  prizePool: tournament.entryFee * tournament.players * 0.3,
  prizePoolFormatted: `₦${(tournament.entryFee * tournament.players * 0.3).toLocaleString()}`,
}))

export default function TournamentPreview() {
  return (
    <section id="tournaments" className="py-24 bg-gradient-to-t from-background to-primary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Featured Tournaments
          </h2>
          <p className="text-foreground/60 max-w-2xl mx-auto">
            Join these exciting tournaments and compete for massive prize pools
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tournaments.map((tournament, index) => (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <Card className="overflow-hidden bg-gradient-to-br from-card/50 to-card border-primary/20 hover:border-primary/40 transition-all duration-300">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={tournament.image}
                    alt={tournament.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-white">
                    {tournament.entryFeeFormatted}
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{tournament.title}</h3>
                  <p className="text-foreground/60 text-sm mb-4">{tournament.game}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-foreground/60">
                        <DollarSign className="w-4 h-4" />
                        <span>Prize Pool</span>
                      </div>
                      <span className="font-semibold text-primary">{tournament.prizePoolFormatted}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-foreground/60">
                        <Users className="w-4 h-4" />
                        <span>Players</span>
                      </div>
                      <span>{tournament.players.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-foreground/60">
                        <Calendar className="w-4 h-4" />
                        <span>Date</span>
                      </div>
                      <span>{tournament.date}</span>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 group-hover:scale-105 transition-transform duration-300 text-white">
                    Join Tournament
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button variant="outline" size="lg" className="border-2">
            View All Tournaments
          </Button>
        </motion.div>
      </div>
    </section>
  )
}