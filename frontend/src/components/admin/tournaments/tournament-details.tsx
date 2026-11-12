"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  ArrowLeft,
  Check,
  Copy,
  Globe,
  Lock,
  MoreHorizontal,
  Pencil,
  Play,
  Rocket,
  Trash2,
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
import { PLATFORMS, STATUS_META, type TournamentStatus } from "./types"
import { formatDateTime, formatLabel, formatNaira, moneyNotes, summarizeFormat } from "./format-utils"
import { useTournaments } from "./store"
import { tournamentActions } from "./actions"
import { TournamentConfirmDialog, type ConfirmState } from "./tournament-confirm-dialog"

const card = "rounded-xl border border-border bg-card text-card-foreground"

const FLOW: { key: TournamentStatus; label: string }[] = [
  { key: "draft", label: "Draft" },
  { key: "registration_open", label: "Registration open" },
  { key: "registration_closed", label: "Registration closed" },
  { key: "in_progress", label: "In progress" },
  { key: "completed", label: "Completed" },
]

function Panel({
  title,
  edit,
  children,
}: {
  title: string
  edit?: string
  children: React.ReactNode
}) {
  return (
    <section className={card}>
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {edit && (
          <Link href={edit} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            <Pencil className="size-3" />
            Edit
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1 px-5 py-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="max-w-[22rem] text-right font-medium">{children}</dd>
    </div>
  )
}

export default function TournamentDetails({ tournamentId }: { tournamentId: string }) {
  const router = useRouter()
  const t = useTournaments().find((x) => x.id === tournamentId)
  const [confirm, setConfirm] = useState<ConfirmState>(null)

  if (!t) {
    return (
      <div className={`${card} mx-auto max-w-md px-6 py-14 text-center`}>
        <h1 className="text-lg font-semibold">Tournament not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          It may have been deleted, or the sample data was reset by a page refresh.
        </p>
        <Button asChild className="mt-4">
          <Link href="/admin/tournaments">Back to tournaments</Link>
        </Button>
      </div>
    )
  }

  const meta = STATUS_META[t.status]
  const canEdit = t.status === "draft" || t.status === "registration_open" || t.status === "registration_closed"
  const summary = summarizeFormat(t)
  const money = moneyNotes(t)
  const c = t.format_config
  const pct = t.max_players ? Math.min(100, (t.joined_players / t.max_players) * 100) : 0
  const flowIdx = FLOW.findIndex((s) => s.key === t.status)
  const platform = PLATFORMS.find((p) => p.value === t.platform)?.label
  const editHref = (step: number) => (canEdit ? `/admin/tournaments/${t.id}/edit?step=${step}` : undefined)

  const places = [
    { label: "1st place", pct: t.prize_split.first },
    { label: "2nd place", pct: t.prize_split.second },
    { label: "3rd place", pct: t.prize_split.third },
  ]

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(t.invite_code)
      toast.success("Invite code copied")
    } catch {
      toast.error("Couldn't copy the code")
    }
  }

  const duplicate = () => {
    const copy = tournamentActions.duplicate(t)
    if (copy) router.push(`/admin/tournaments/${copy.id}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href="/admin/tournaments"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Tournaments
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{t.name}</h1>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.className}`}>{meta.label}</span>
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
            <span>
              {t.game} · {platform}
            </span>
            <span>·</span>
            <span>{formatLabel(t)}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              {t.visibility === "private" ? <Lock className="size-3.5" /> : <Globe className="size-3.5" />}
              {t.visibility === "private" ? "Private" : "Public"}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canEdit && (
            <Button variant="outline" asChild>
              <Link href={`/admin/tournaments/${t.id}/edit`}>
                <Pencil className="size-4" />
                Edit
              </Link>
            </Button>
          )}
          {t.status === "draft" && (
            <Button onClick={() => tournamentActions.publish(t)}>
              <Rocket className="size-4" />
              Publish
            </Button>
          )}
          {t.status === "registration_open" && (
            <Button onClick={() => tournamentActions.closeRegistration(t)}>
              <Lock className="size-4" />
              Close registration
            </Button>
          )}
          {t.status === "registration_closed" && (
            <Button onClick={() => tournamentActions.start(t)}>
              <Play className="size-4" />
              Start tournament
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="More actions">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={duplicate}>
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
        </div>
      </div>

      {/* Lifecycle */}
      {t.status === "cancelled" ? (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <XCircle className="mt-0.5 size-4 shrink-0" />
          <p>This tournament was cancelled. Entry fees are refunded to the players who joined.</p>
        </div>
      ) : (
        <ol className={`${card} flex flex-wrap items-center gap-2 px-5 py-4`}>
          {FLOW.map((s, i) => {
            const done = i < flowIdx
            const active = i === flowIdx
            return (
              <li key={s.key} className="flex items-center gap-2">
                <span
                  className={`grid size-7 place-items-center rounded-full border-2 text-xs font-semibold ${
                    done
                      ? "border-primary bg-primary text-primary-foreground"
                      : active
                        ? "border-primary text-primary"
                        : "border-input text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                </span>
                <span className={`text-sm font-medium ${active ? "" : "text-muted-foreground"}`}>{s.label}</span>
                {i < FLOW.length - 1 && <span className="mx-1 hidden h-px w-8 bg-border sm:block" />}
              </li>
            )
          })}
        </ol>
      )}

      {/* Key numbers */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className={`${card} p-4`}>
          <p className="text-xs text-muted-foreground">Players</p>
          <p className="mt-1 text-2xl font-semibold">
            {t.joined_players}
            <span className="text-base font-normal text-muted-foreground">/{t.max_players}</span>
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">Needs at least {t.min_players} to start</p>
        </div>
        <div className={`${card} p-4`}>
          <p className="text-xs text-muted-foreground">Entry fee</p>
          <p className="mt-1 text-2xl font-semibold">{t.entry_fee === 0 ? "Free" : formatNaira(t.entry_fee)}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Collected so far: {formatNaira(t.joined_players * t.entry_fee)}
          </p>
        </div>
        <div className={`${card} p-4`}>
          <p className="text-xs text-muted-foreground">Prize pool</p>
          <p className="mt-1 text-2xl font-semibold text-success">{formatNaira(t.prize_pool)}</p>
          <p className="mt-2 text-xs text-muted-foreground">Paid to the top 3</p>
        </div>
        <div className={`${card} p-4`}>
          <p className="text-xs text-muted-foreground">Starts</p>
          <p className="mt-1 text-2xl font-semibold">{formatDateTime(t.starts_at)}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Registration closes {formatDateTime(t.registration_closes_at)}
          </p>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          <Panel title="About" edit={editHref(0)}>
            <div className="space-y-4 p-5 text-sm">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</p>
                <p className="whitespace-pre-line">{t.description || "No description yet."}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Rules</p>
                <p className="whitespace-pre-line">{t.rules || "No rules added yet."}</p>
              </div>
            </div>
          </Panel>

          <Panel title="Format" edit={editHref(1)}>
            <div className="p-5">
              <ol className="space-y-3 border-l-2 border-border pl-4">
                {summary.stages.map((s) => (
                  <li key={s.title} className="relative">
                    <span className="absolute -left-[22px] top-1.5 size-2 rounded-full bg-primary" />
                    <p className="text-sm font-medium">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.detail}</p>
                  </li>
                ))}
              </ol>
            </div>
            <dl className="divide-y divide-border border-t border-border">
              <Row>{null}</Row>
            </dl>
          </Panel>

          <Panel title="Schedule" edit={editHref(3)}>
            <dl className="divide-y divide-border">
              <Row label="Registration opens">{formatDateTime(t.registration_opens_at)}</Row>
              <Row label="Registration closes">{formatDateTime(t.registration_closes_at)}</Row>
              <Row label="Tournament starts">{formatDateTime(t.starts_at)}</Row>
              <Row label="Time to finish each match">{t.match_deadline_hours} hours</Row>
            </dl>
          </Panel>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Panel title="Prizes" edit={editHref(2)}>
            {t.prize_pool > 0 ? (
              <dl className="divide-y divide-border">
                {places.map((p) => (
                  <Row key={p.label} label={`${p.label} · ${p.pct}%`}>
                    {formatNaira((t.prize_pool * p.pct) / 100)}
                  </Row>
                ))}
              </dl>
            ) : (
              <p className="p-5 text-sm text-muted-foreground">No prize money for this tournament.</p>
            )}
          </Panel>

          <Panel title="Money" edit={editHref(2)}>
            <dl className="divide-y divide-border">
              <Row label="Collected so far">{formatNaira(t.joined_players * t.entry_fee)}</Row>
              <Row label="If it fills up">{formatNaira(money.income)}</Row>
              <Row label="Prize pool">{formatNaira(t.prize_pool)}</Row>
              <Row label="Platform margin (full)">
                <span className={money.margin < 0 ? "text-destructive" : "text-success"}>
                  {formatNaira(money.margin)}
                </span>
              </Row>
            </dl>
          </Panel>

          <Panel title="Settings" edit={editHref(3)}>
            <dl className="divide-y divide-border">
              <Row label="Visibility">{t.visibility === "private" ? "Private" : "Public"}</Row>
              {t.visibility === "private" && (
                <Row label="Invite code">
                  <span className="inline-flex items-center gap-2">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{t.invite_code || "Not set"}</code>
                    {t.invite_code && (
                      <button
                        type="button"
                        onClick={copyCode}
                        aria-label="Copy invite code"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="size-4" />
                      </button>
                    )}
                  </span>
                </Row>
              )}
              <Row label="Screenshot proof">{t.require_screenshot_proof ? "Required" : "Not required"}</Row>
              <Row label="Auto-cancel under minimum">{t.auto_cancel_if_under_min ? "Yes" : "No"}</Row>
              {t.format === "cup" && <Row label="Seeding">{c.seeding === "random" ? "Random draw" : "Manual"}</Row>}
              {t.format === "cup" && (
                <Row label="Third-place match">{c.third_place_match ? "Yes" : "No"}</Row>
              )}
            </dl>
          </Panel>
        </div>
      </div>

      <TournamentConfirmDialog
        confirm={confirm}
        onClose={() => setConfirm(null)}
        onDone={(kind) => kind === "delete" && router.push("/admin/tournaments")}
      />
    </div>
  )
}