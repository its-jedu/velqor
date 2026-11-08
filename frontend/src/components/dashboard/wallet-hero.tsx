"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Plus, Trophy } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatNaira } from "@/lib/format"
import type { WalletData } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { Skeleton } from "./skeleton"

interface Props {
  wallet: WalletData | null
  loading?: boolean
}

export function WalletHero({ wallet, loading }: Props) {
  const [hidden, setHidden] = useState(false)
  const balance = wallet?.balance ?? 0

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/15 via-card to-purple-600/15">
      <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-2">
        <div>
          <div className="flex items-center gap-2 text-sm text-foreground/60">
            Wallet balance
            <button
              type="button"
              onClick={() => setHidden((h) => !h)}
              aria-label={hidden ? "Show balance" : "Hide balance"}
              className="rounded p-1 transition-colors hover:bg-foreground/10"
            >
              {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {loading ? (
            <Skeleton className="mt-2 h-10 w-48" />
          ) : (
            <p className="mt-1 text-3xl font-bold sm:text-4xl">
              {hidden ? "₦ ••••••" : formatNaira(balance)}
            </p>
          )}

          {!loading && wallet && wallet.pendingWithdrawals > 0 && (
            <p className="mt-1 text-xs text-foreground/60">
              {formatNaira(wallet.pendingWithdrawals)} pending withdrawal
            </p>
          )}
          {!loading && balance === 0 && (
            <p className="mt-1 text-xs text-foreground/60">
              Add funds to join paid tournaments.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard/wallet"
            className={cn(buttonVariants({ size: "lg" }), "bg-gradient-to-r from-primary to-purple-600 text-white")}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Funds
          </Link>
          <Link
            href="/dashboard/tournaments"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            <Trophy className="mr-1 h-4 w-4" />
            Join Tournament
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}