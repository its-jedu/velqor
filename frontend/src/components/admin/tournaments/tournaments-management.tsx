"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  Gamepad2,
  Info,
  Lock,
  MoreHorizontal,
  Pencil,
  Play,
  Plus,
  Rocket,
  Search,
  Trash2,
  Trophy,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PLATFORMS, STATUS_META } from "./types"
import { formatDateTime, formatLabel, formatNaira } from "./format-utils"
import { useTournaments } from "./store"
import { useGames } from "./games-store"
import { tournamentActions } from "./actions"
import { TournamentConfirmDialog, type ConfirmState } from "./tournament-confirm-dialog"
import { GamesDialog } from "./games-dialog"

const PAGE_SIZE = 10
const card = "rounded-xl border border-border bg-card text-card-foreground"
const selectClass =
  "h-9 rounded-lg border border-input bg-card px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"

export default function TournamentsManagement() {
  const router = useRouter()
  const tournaments = useTournaments()
  const games = useGames()

  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [formatFilter, setFormatFilter] = useState("all")
  const [gameFilter, setGameFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [confirm, setConfirm] = useState<ConfirmState>(null)
  const [gamesOpen, setGamesOpen] = useState(false)

  const stats = useMemo(
    () => [
      { label: "Total tournaments", value: tournaments.length },
      { label: "Registration open", value: tournaments.filter((t) => t.status === "registration_open").length },
      { label: "In progress", value: tournaments.filter((t) => t.status === "in_progress").length },
      { label: "Games", value: games.length },
    ],
    [tournaments, games]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return tournaments.filter((t) => {
      const matchesQuery = !q || t.name.toLowerCase().includes(q) || t.game.toLowerCase().includes(q)
      const matchesStatus = statusFilter === "all" || t.status === statusFilter
      const matchesFormat = formatFilter === "all" || t.format === formatFilter
      const matchesGame = gameFilter === "all" || t.game === gameFilter
      return matchesQuery && matchesStatus && matchesFormat && matchesGame
    })
  }, [tournaments, query, statusFilter, formatFilter, gameFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * PAGE_SIZE
  const pageRows = filtered.slice(start, start + PAGE_SIZE)

  const hasFilters = query !== "" || statusFilter !== "all" || formatFilter !== "all" || gameFilter !== "all"

  function clearFilters() {
    setQuery("")
    setStatusFilter("all")
    setFormatFilter("all")
    setGameFilter("all")
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tournaments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and run leagues and cups, from sign-ups to the final.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setGamesOpen(true)}>
            <Gamepad2 className="size-4" />
            Add game
          </Button>
          <Button asChild>
            <Link href="/admin/tournaments/new">
              <Plus className="size-4" />
              Create tournament
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-warning" />
        <p>Sample data. Changes stay in your browser until the tournaments API is connected.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`${card} p-4`}>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            placeholder="Search by name or game..."
            className="h-9 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className={selectClass}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          {Object.entries(STATUS_META).map(([key, meta]) => (
            <option key={key} value={key}>
              {meta.label}
            </option>
          ))}
        </select>
        <select
          value={formatFilter}
          onChange={(e) => {
            setFormatFilter(e.target.value)
            setPage(1)
          }}
          className={selectClass}
          aria-label="Filter by format"
        >
          <option value="all">All formats</option>
          <option value="league">League</option>
          <option value="cup">Cup</option>
        </select>
        <select
          value={gameFilter}
          onChange={(e) => {
            setGameFilter(e.target.value)
            setPage(1)
          }}
          className={selectClass}
          aria-label="Filter by game"
        >
          <option value="all">All games</option>
          {games.map((g) => (
            <option key={g.id} value={g.name}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      <div className={`${card} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Tournament</th>
                <th className="px-4 py-3 font-medium">Format</th>
                <th className="px-4 py-3 font-medium">Players</th>
                <th className="px-4 py-3 font-medium">Entry</th>
                <th className="px-4 py-3 font-medium">Prize pool</th>
                <th className="px-4 py-3 font-medium">Starts</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {pageRows.map((t) => {
                const meta = STATUS_META[t.status]
                const pct = t.max_players ? Math.min(100, (t.joined_players / t.max_players) * 100) : 0
                const canEdit =
                  t.status === "draft" || t.status === "registration_open" || t.status === "registration_closed"
                const platform = PLATFORMS.find((p) => p.value === t.platform)?.label

                return (
                  <tr key={t.id} className="border-b border-border last:border-0 hover:bg-accent/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
                          <Trophy className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/tournaments/${t.id}`}
                            className="block truncate font-medium hover:text-primary hover:underline"
                          >
                            {t.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {t.game} · {platform}
                            {t.visibility === "private" && " · Private"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatLabel(t)}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm">
                        {t.joined_players}/{t.max_players}
                      </p>
                      <div className="mt-1.5 h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {t.entry_fee === 0 ? "Free" : formatNaira(t.entry_fee)}
                    </td>
                    <td className="px-4 py-3 font-medium text-success">{formatNaira(t.prize_pool)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDateTime(t.starts_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${meta.className}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Row actions">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem onClick={() => router.push(`/admin/tournaments/${t.id}`)}>
                            <Eye className="size-4" />
                            View details
                          </DropdownMenuItem>
                          {canEdit && (
                            <DropdownMenuItem onClick={() => router.push(`/admin/tournaments/${t.id}/edit`)}>
                              <Pencil className="size-4" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {t.status === "draft" && (
                            <DropdownMenuItem onClick={() => tournamentActions.publish(t)}>
                              <Rocket className="size-4" />
                              Publish
                            </DropdownMenuItem>
                          )}
                          {t.status === "registration_open" && (
                            <DropdownMenuItem onClick={() => tournamentActions.closeRegistration(t)}>
                              <Lock className="size-4" />
                              Close registration
                            </DropdownMenuItem>
                          )}
                          {t.status === "registration_closed" && (
                            <DropdownMenuItem onClick={() => tournamentActions.start(t)}>
                              <Play className="size-4" />
                              Start tournament
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => tournamentActions.duplicate(t)}>
                            <Copy className="size-4" />
                            Duplicate
                          </DropdownMenuItem>
                          {(t.status === "registration_open" ||
                            t.status === "registration_closed" ||
                            t.status === "in_progress") && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setConfirm({ kind: "cancel", t })}
                                className="text-destructive focus:text-destructive"
                              >
                                <XCircle className="size-4" />
                                Cancel and refund
                              </DropdownMenuItem>
                            </>
                          )}
                          {t.status === "draft" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setConfirm({ kind: "delete", t })}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="size-4" />
                                Delete draft
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <div className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
                <Trophy className="size-6" />
              </div>
              <h2 className="mt-4 text-base font-semibold">
                {hasFilters ? "No tournaments match your filters" : "No tournaments yet"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {hasFilters
                  ? "Try a different search or clear the filters."
                  : "Create the first one to get players competing."}
              </p>
              {hasFilters ? (
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button asChild className="mt-4">
                  <Link href="/admin/tournaments/new">
                    <Plus className="size-4" />
                    Create tournament
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>

        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
            <p>
              Showing {start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={safePage === 1}
                onClick={() => setPage(safePage - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="min-w-[64px] text-center">
                {safePage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={safePage === totalPages}
                onClick={() => setPage(safePage + 1)}
                aria-label="Next page"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <TournamentConfirmDialog confirm={confirm} onClose={() => setConfirm(null)} />
      <GamesDialog open={gamesOpen} onOpenChange={setGamesOpen} tournaments={tournaments} />
    </div>
  )
}