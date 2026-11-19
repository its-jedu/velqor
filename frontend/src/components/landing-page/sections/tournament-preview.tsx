"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  formatNaira,
  getPrizePool,
  tournaments,
  type TournamentStatus,
} from "@/components/landing-page/data"

const tabs = ["All", "eFootball", "Call of Duty", "8Ball Pool"] as const

const statusStyle: Record<TournamentStatus, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-emerald-500 text-white hover:bg-emerald-500" },
  filling: { label: "Filling fast", className: "bg-amber-500 text-black hover:bg-amber-500" },
  live: { label: "Live now", className: "bg-red-500 text-white hover:bg-red-500" },
}

export default function TournamentPreview() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("All")
  const list = tournaments.filter((t) => tab === "All" || t.game === tab)

  return (
    <section id="tournaments" className="bg-muted/40 py-20 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Tournaments you can join today</h2>
            <p className="mt-3 text-muted-foreground">
              Entry fees and prize pools are shown upfront, so you know what you&apos;re playing for.
            </p>
          </div>
          <div className="overflow-x-auto">
            <Tabs value={tab} onValueChange={(v) => setTab(v as (typeof tabs)[number])}>
              <TabsList>
                {tabs.map((t) => (
                  <TabsTrigger key={t} value={t}>
                    {t}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => {
            const status = statusStyle[t.status]
            const full = t.joined >= t.slots
            return (
              <Card key={t.id} className="overflow-hidden py-0">
                <div className="relative h-40">
                  <Image src={t.image} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <Badge className={`absolute left-4 top-4 ${status.className}`}>{status.label}</Badge>
                  <Badge variant="secondary" className="absolute right-4 top-4">
                    {t.format}
                  </Badge>
                </div>
                <CardContent className="space-y-4 p-5">
                  <div>
                    <h3 className="text-lg font-semibold">{t.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t.game} · {t.startsLabel}
                    </p>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Prize pool</p>
                      <p className="text-2xl font-bold text-primary">{formatNaira(getPrizePool(t))}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Entry fee</p>
                      <p className="font-semibold">{formatNaira(t.entryFee)}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Progress value={(t.joined / t.slots) * 100} className="h-1.5" />
                    <p className="text-xs text-muted-foreground">
                      {t.joined}/{t.slots} players joined
                    </p>
                  </div>

                  <Button asChild={!full} disabled={full} className="w-full">
                    {full ? <span>Tournament full</span> : <Link href="/auth/register">Join tournament</Link>}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}