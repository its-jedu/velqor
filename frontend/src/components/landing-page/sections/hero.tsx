"use client"

import Image from "next/image"
import Link from "next/link"
import { MotionConfig, motion } from "framer-motion"
import { Gamepad2, Users, Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatNaira, getPrizePool, tournaments } from "@/components/landing-page/data"

const featured = tournaments[0]

const perks = [
  { icon: Wallet, label: "Pay in and cash out in naira" },
  { icon: Gamepad2, label: "eFootball, 8Ball Pool and Call of Duty" },
  { icon: Users, label: "League and Cup formats" },
]

export default function Hero() {
  const filled = Math.round((featured.joined / featured.slots) * 100)
  const slotsLeft = featured.slots - featured.joined

  return (
    <section className="relative isolate overflow-hidden pt-28 pb-20 lg:pt-40 lg:pb-28">
      <Image
        src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=2070&q=80"
        alt=""
        fill
        sizes="100vw"
        priority
        className="-z-20 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/80 via-black/60 to-background" />
      <div className="absolute -top-24 left-1/4 -z-10 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />

      <MotionConfig reducedMotion="user">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="container mx-auto grid items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8"
        >
          <div>
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Compete. Conquer.
              <br />
              Cash Out.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/80">
              Enter naira tournaments in the games you already play. Fund your wallet, play your
              matches, and withdraw what you win.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-8 text-base">
                <Link href="/auth/register">Create free account</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 border-white/30 bg-white/10 px-8 text-base text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
              >
                <Link href="#tournaments">Browse tournaments</Link>
              </Button>
            </div>

            <ul className="mt-10 flex flex-col gap-3 text-sm text-white/75 sm:flex-row sm:flex-wrap sm:gap-x-8">
              {perks.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* The one memorable element: a real tournament players can join right now */}
          <Card className="border-white/15 bg-white/10 text-white shadow-2xl backdrop-blur-md">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center justify-between">
                <Badge className="bg-amber-500/90 text-black hover:bg-amber-500/90">
                  {slotsLeft} slots left
                </Badge>
                <span className="text-sm text-white/70">{featured.startsLabel}</span>
              </div>

              <div>
                <h2 className="text-2xl font-semibold">{featured.title}</h2>
                <p className="text-sm text-white/70">
                  {featured.game} · {featured.format}
                </p>
              </div>

              <div>
                <p className="text-sm text-white/70">Prize pool</p>
                <p className="text-4xl font-bold">{formatNaira(getPrizePool(featured))}</p>
              </div>

              <div className="space-y-2">
                <Progress value={filled} className="h-2 bg-white/20" />
                <div className="flex justify-between text-sm text-white/70">
                  <span>
                    {featured.joined}/{featured.slots} players
                  </span>
                  <span>Entry {formatNaira(featured.entryFee)}</span>
                </div>
              </div>

              <Button asChild className="h-11 w-full text-base">
                <Link href="/auth/register">Join this tournament</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </MotionConfig>
    </section>
  )
}