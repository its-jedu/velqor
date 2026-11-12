"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Globe,
  Info,
  LayoutGrid,
  ListOrdered,
  Lock,
  RefreshCw,
  Swords,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PermissionRow } from "../users/permission-row"
import {
  NAIRA,
  PLATFORMS,
  defaultTournamentInput,
  toInput,
  type FormatConfig,
  type TournamentInput,
} from "./types"
import { useGames } from "./games-store"
import {
  formatDateTime,
  formatLabel,
  formatNaira,
  moneyNotes,
  summarizeFormat,
  validateAll,
  validateBasics,
  validateStep,
} from "./format-utils"
import { tournamentStore, useTournaments } from "./store"

const card = "rounded-xl border border-border bg-card text-card-foreground"
const selectClass =
  "h-9 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"

const STEPS = ["Basics", "Format", "Entry & prizes", "Schedule & rules", "Review"]

// ───────── small building blocks ─────────

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </section>
  )
}

function ChoiceCard({
  selected,
  onClick,
  icon: Icon,
  title,
  description,
}: {
  selected: boolean
  onClick: () => void
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
        selected ? "border-primary/60 bg-primary/10" : "border-border bg-card hover:border-primary/30"
      }`}
    >
      <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <span
        className={`grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors ${
          selected ? "border-primary bg-primary text-primary-foreground" : "border-input text-transparent"
        }`}
      >
        <Check className="size-3.5" strokeWidth={3} />
      </span>
    </button>
  )
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div className="inline-flex flex-wrap rounded-lg bg-muted p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            value === o.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function NumberField({
  id,
  value,
  onChange,
  min = 0,
  prefix,
  suffix,
}: {
  id?: string
  value: number
  onChange: (value: number) => void
  min?: number
  prefix?: string
  suffix?: string
}) {
  return (
    <div className="relative">
      {prefix && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {prefix}
        </span>
      )}
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        value={Number.isFinite(value) ? value : ""}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        className={`${prefix ? "pl-8" : ""} ${suffix ? "pr-8" : ""}`}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {suffix}
        </span>
      )}
    </div>
  )
}

function ToggleRow(props: { name: string; description: string; checked: boolean; onToggle: () => void }) {
  return (
    <div className="rounded-lg border border-border">
      <PermissionRow {...props} />
    </div>
  )
}

function ErrorList({ errors }: { errors: string[] }) {
  if (!errors.length) return null
  return (
    <div className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <ul className="space-y-1">
        {errors.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    </div>
  )
}

function ReviewBlock({
  title,
  onEdit,
  rows,
}: {
  title: string
  onEdit: () => void
  rows: [string, string][]
}) {
  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button type="button" onClick={onEdit} className="text-xs font-medium text-primary hover:underline">
          Edit
        </button>
      </div>
      <dl className="divide-y divide-border">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-wrap justify-between gap-x-6 gap-y-1 px-4 py-2.5 text-sm">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="max-w-[28rem] text-right font-medium">{value || "–"}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

// ───────── the wizard ─────────

export default function TournamentWizard({
  tournamentId,
  initialStep,
}: {
  tournamentId?: string
  initialStep?: number
}) {
  const router = useRouter()
  const all = useTournaments()
    const games = useGames()
  const existing = tournamentId ? all.find((t) => t.id === tournamentId) : undefined

  const [form, setForm] = useState<TournamentInput>(() =>
    existing ? toInput(existing) : defaultTournamentInput()
  )
   const [step, setStep] = useState(() => Math.min(Math.max(initialStep ?? 0, 0), STEPS.length - 1))
  const [attempted, setAttempted] = useState(false)

  const summary = useMemo(() => summarizeFormat(form), [form])
  const money = moneyNotes(form)
  const stepErrors = validateStep(step, form)

  const set = <K extends keyof TournamentInput>(key: K, value: TournamentInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))
  const setConfig = <K extends keyof FormatConfig>(key: K, value: FormatConfig[K]) =>
    setForm((prev) => ({ ...prev, format_config: { ...prev.format_config, [key]: value } }))
  const setSplit = (key: "first" | "second" | "third", value: number) =>
    setForm((prev) => ({ ...prev, prize_split: { ...prev.prize_split, [key]: value } }))

    const changeGame = (name: string) => {
    const g = games.find((x) => x.name === name)
    setForm((prev) => ({
      ...prev,
      game: name,
      format_config: g && !existing ? { ...prev.format_config, allow_draws: g.allow_draws } : prev.format_config,
    }))
  }

  if (tournamentId && !existing) {
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

  const c = form.format_config
  const isEdit = !!existing
  const isDraftLike = !existing || existing.status === "draft"
  const hasTable = form.format === "league" || c.cup_stage === "groups_knockout"
  const showErrors = attempted || step === STEPS.length - 1

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" })

  function goTo(i: number) {
    setStep(i)
    setAttempted(false)
    scrollTop()
  }

  function next() {
    if (stepErrors.length) {
      setAttempted(true)
      return
    }
    goTo(step + 1)
  }

  function save(mode: "draft" | "publish" | "update") {
    if (mode === "draft") {
      if (validateBasics(form).length && form.name.trim().length < 3) {
        setStep(0)
        setAttempted(true)
        toast.error("Give the tournament a name first")
        return
      }
    } else {
      const bad = validateAll(form)
      if (bad) {
        setStep(bad.step)
        setAttempted(true)
        scrollTop()
        toast.error("Some details need fixing", { description: bad.errors[0] })
        return
      }
    }

    const payload = { ...form, name: form.name.trim() }

    if (existing) {
      tournamentStore.update(existing.id, payload)
      if (mode === "publish" && existing.status === "draft") {
        tournamentStore.setStatus(existing.id, "registration_open")
      }
    } else {
      tournamentStore.create(payload, mode === "publish" ? "registration_open" : "draft")
    }

    toast.success(
      mode === "publish" ? "Tournament published" : mode === "draft" ? "Draft saved" : "Changes saved",
      { description: payload.name }
    )
       router.push(existing ? `/admin/tournaments/${existing.id}` : "/admin/tournaments")
  }

  const places: { label: string; pct: number }[] = [
    { label: "1st", pct: form.prize_split.first },
    { label: "2nd", pct: form.prize_split.second },
    { label: "3rd", pct: form.prize_split.third },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/tournaments"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Tournaments
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {isEdit ? "Edit tournament" : "Create tournament"}
          </h1>
        </div>
                {isDraftLike ? (
          <Button variant="outline" onClick={() => save("draft")}>
            Save draft
          </Button>
        ) : (
          <Button onClick={() => save("update")}>Save changes</Button>
        )}
      </div>

      {/* Stepper */}
      <ol className="flex flex-wrap items-center gap-2">
        {STEPS.map((label, i) => {
          const done = i < step
          const active = i === step
          return (
            <li key={label} className="flex items-center gap-2">
              <button
                type="button"
                                disabled={!isEdit && i > step}
                onClick={() => goTo(i)}
                className="flex items-center gap-2 disabled:cursor-default"
              >
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
                <span className={`hidden text-sm font-medium sm:inline ${active ? "" : "text-muted-foreground"}`}>
                  {label}
                </span>
              </button>
              {i < STEPS.length - 1 && <span className="h-px w-6 bg-border sm:w-10" />}
            </li>
          )
        })}
      </ol>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Form */}
        <div className={card}>
          <div className="space-y-6 p-5 sm:p-6">
            {/* STEP 0: BASICS */}
            {step === 0 && (
              <>
                <Field label="Tournament name" htmlFor="name">
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g. eFootball Naija Cup"
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Game" htmlFor="game">
                                        <select
                      id="game"
                      value={form.game}
                      onChange={(e) => changeGame(e.target.value)}
                      className={selectClass}
                    >
                      {form.game && !games.some((g) => g.name === form.game) && (
                        <option value={form.game}>{form.game}</option>
                      )}
                      {games.map((g) => (
                        <option key={g.id} value={g.name}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Platform" htmlFor="platform">
                    <select
                      id="platform"
                      value={form.platform}
                      onChange={(e) => set("platform", e.target.value as TournamentInput["platform"])}
                      className={selectClass}
                    >
                      {PLATFORMS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Description" htmlFor="description" hint="Shown to players on the tournament page.">
                  <Textarea
                    id="description"
                    rows={3}
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="What is this tournament about?"
                  />
                </Field>

                <Field label="Cover image URL (optional)" htmlFor="cover">
                  <Input
                    id="cover"
                    value={form.cover_image_url}
                    onChange={(e) => set("cover_image_url", e.target.value)}
                    placeholder="https://..."
                  />
                </Field>

                <Section title="Who can join?">
                  <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
                    <ChoiceCard
                      selected={form.visibility === "public"}
                      onClick={() => set("visibility", "public")}
                      icon={Globe}
                      title="Public"
                      description="Anyone on Velqor can find and join."
                    />
                    <ChoiceCard
                      selected={form.visibility === "private"}
                      onClick={() => set("visibility", "private")}
                      icon={Lock}
                      title="Private"
                      description="Only players with the invite code can join."
                    />
                  </div>
                  {form.visibility === "private" && (
                    <Field label="Invite code" htmlFor="invite">
                      <div className="flex gap-2">
                        <Input
                          id="invite"
                          value={form.invite_code}
                          onChange={(e) => set("invite_code", e.target.value.toUpperCase())}
                          placeholder="e.g. VQ7K2P"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => set("invite_code", Math.random().toString(36).slice(2, 8).toUpperCase())}
                        >
                          <RefreshCw className="size-4" />
                          Generate
                        </Button>
                      </div>
                    </Field>
                  )}
                </Section>
              </>
            )}

            {/* STEP 1: FORMAT */}
            {step === 1 && (
              <>
                <Section title="Tournament type">
                  <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
                    <ChoiceCard
                      selected={form.format === "league"}
                      onClick={() => set("format", "league")}
                      icon={ListOrdered}
                      title="League"
                      description="Everyone plays everyone. Points decide the table."
                    />
                    <ChoiceCard
                      selected={form.format === "cup"}
                      onClick={() => set("format", "cup")}
                      icon={Swords}
                      title="Cup"
                      description="Knockout rounds, with an optional group stage first."
                    />
                  </div>
                </Section>

                {form.format === "cup" && (
                  <Section title="How does the cup start?">
                    <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
                      <ChoiceCard
                        selected={c.cup_stage === "knockout"}
                        onClick={() => setConfig("cup_stage", "knockout")}
                        icon={Swords}
                        title="Straight to knockout"
                        description="Lose and you're out from round one."
                      />
                      <ChoiceCard
                        selected={c.cup_stage === "groups_knockout"}
                        onClick={() => setConfig("cup_stage", "groups_knockout")}
                        icon={LayoutGrid}
                        title="Group stage first"
                        description="Play in groups, then the top players go into a knockout."
                      />
                    </div>
                  </Section>
                )}

                <Section title="Players" hint="Fixtures are built from the players who actually join.">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Minimum to start" htmlFor="min">
                      <NumberField id="min" min={2} value={form.min_players} onChange={(v) => set("min_players", v)} />
                    </Field>
                    <Field label="Maximum allowed" htmlFor="max">
                      <NumberField id="max" min={2} value={form.max_players} onChange={(v) => set("max_players", v)} />
                    </Field>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    Quick pick for maximum:
                    {[8, 16, 32, 64].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => set("max_players", n)}
                        className={`rounded-md border px-2.5 py-1 font-medium transition-colors ${
                          form.max_players === n
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </Section>

                {form.format === "league" && (
                  <Section title="League rounds">
                    <Segmented
                      value={c.league_legs}
                      onChange={(v) => setConfig("league_legs", v)}
                      options={[
                        { value: "single", label: "Single round (play once)" },
                        { value: "double", label: "Double round (home and away)" },
                      ]}
                    />
                  </Section>
                )}

                {form.format === "cup" && c.cup_stage === "groups_knockout" && (
                  <Section
                    title="Group stage"
                    hint={`${form.max_players} players ÷ ${c.group_count || 0} groups = ${
                      c.group_count > 0 ? Math.floor(form.max_players / c.group_count) : 0
                    } per group`}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Number of groups" htmlFor="groups">
                        <NumberField
                          id="groups"
                          min={2}
                          value={c.group_count}
                          onChange={(v) => setConfig("group_count", v)}
                        />
                      </Field>
                      <Field label="Qualifiers per group" htmlFor="qualifiers">
                        <NumberField
                          id="qualifiers"
                          min={1}
                          value={c.qualifiers_per_group}
                          onChange={(v) => setConfig("qualifiers_per_group", v)}
                        />
                      </Field>
                    </div>
                    <Segmented
                      value={c.group_legs}
                      onChange={(v) => setConfig("group_legs", v)}
                      options={[
                        { value: "single", label: "Play each other once" },
                        { value: "double", label: "Home and away" },
                      ]}
                    />
                  </Section>
                )}

                {form.format === "cup" && (
                  <Section title="Knockout rules">
                    <Segmented
                      value={c.knockout_legs}
                      onChange={(v) => setConfig("knockout_legs", v)}
                      options={[
                        { value: "single", label: "Single match" },
                        { value: "double", label: "Two legs (final is one match)" },
                      ]}
                    />
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Seeding</p>
                      <Segmented
                        value={c.seeding}
                        onChange={(v) => setConfig("seeding", v)}
                        options={[
                          { value: "random", label: "Random draw" },
                          { value: "manual", label: "Manual (admin places players)" },
                        ]}
                      />
                    </div>
                    <ToggleRow
                      name="Third-place match"
                      description="Semi-final losers play for third."
                      checked={c.third_place_match}
                      onToggle={() => setConfig("third_place_match", !c.third_place_match)}
                    />
                  </Section>
                )}

                {hasTable && (
                  <Section title="Scoring">
                    <ToggleRow
                      name="Allow draws"
                      description="Turn off for games that can't end level, like 8 Ball Pool."
                      checked={c.allow_draws}
                      onToggle={() => setConfig("allow_draws", !c.allow_draws)}
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Points for a win" htmlFor="pw">
                        <NumberField id="pw" min={1} value={c.points_win} onChange={(v) => setConfig("points_win", v)} />
                      </Field>
                      {c.allow_draws && (
                        <Field label="Points for a draw" htmlFor="pd">
                          <NumberField
                            id="pd"
                            min={0}
                            value={c.points_draw}
                            onChange={(v) => setConfig("points_draw", v)}
                          />
                        </Field>
                      )}
                    </div>
                  </Section>
                )}
              </>
            )}

            {/* STEP 2: ENTRY & PRIZES */}
            {step === 2 && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Entry fee" htmlFor="fee" hint="Set to 0 for a free tournament.">
                    <NumberField id="fee" prefix={NAIRA} value={form.entry_fee} onChange={(v) => set("entry_fee", v)} />
                  </Field>
                  <Field label="Prize pool" htmlFor="pool" hint="A fixed amount paid out to the winners.">
                    <NumberField id="pool" prefix={NAIRA} value={form.prize_pool} onChange={(v) => set("prize_pool", v)} />
                  </Field>
                </div>

                <Section title="Prize split" hint="Percentages of the prize pool. They must add up to 100%.">
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ["Winner takes all", 100, 0, 0],
                        ["70 / 20 / 10", 70, 20, 10],
                        ["50 / 30 / 20", 50, 30, 20],
                      ] as const
                    ).map(([label, a, b, d]) => (
                      <Button
                        key={label}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setForm((p) => ({ ...p, prize_split: { first: a, second: b, third: d } }))}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {places.map((p, i) => {
                      const key = (["first", "second", "third"] as const)[i]
                      return (
                        <Field key={p.label} label={`${p.label} place`} htmlFor={`split-${key}`}>
                          <NumberField id={`split-${key}`} suffix="%" value={p.pct} onChange={(v) => setSplit(key, v)} />
                          <p className="text-xs text-muted-foreground">
                            {formatNaira((form.prize_pool * p.pct) / 100)}
                          </p>
                        </Field>
                      )
                    })}
                  </div>
                </Section>

                {money.warning ? (
                  <div className="flex gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning" />
                    <p>{money.warning}</p>
                  </div>
                ) : (
                  <div className="flex gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
                    <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <p>
                      A full tournament collects {formatNaira(money.income)} in entry fees and pays out{" "}
                      {formatNaira(form.prize_pool)}, leaving {formatNaira(money.margin)} for the platform.
                    </p>
                  </div>
                )}

                <ToggleRow
                  name="Cancel and refund if it doesn't fill"
                  description={`If fewer than ${form.min_players} players join by the registration deadline, cancel automatically and refund everyone.`}
                  checked={form.auto_cancel_if_under_min}
                  onToggle={() => set("auto_cancel_if_under_min", !form.auto_cancel_if_under_min)}
                />
              </>
            )}

            {/* STEP 3: SCHEDULE & RULES */}
            {step === 3 && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Registration opens" htmlFor="opens">
                    <Input
                      id="opens"
                      type="datetime-local"
                      value={form.registration_opens_at}
                      onChange={(e) => set("registration_opens_at", e.target.value)}
                    />
                  </Field>
                  <Field label="Registration closes" htmlFor="closes">
                    <Input
                      id="closes"
                      type="datetime-local"
                      value={form.registration_closes_at}
                      onChange={(e) => set("registration_closes_at", e.target.value)}
                    />
                  </Field>
                  <Field label="Tournament starts" htmlFor="starts">
                    <Input
                      id="starts"
                      type="datetime-local"
                      value={form.starts_at}
                      onChange={(e) => set("starts_at", e.target.value)}
                    />
                  </Field>
                  <Field
                    label="Time to finish each match"
                    htmlFor="deadline"
                    hint="Players who don't report a result in time can be flagged."
                  >
                    <NumberField
                      id="deadline"
                      min={1}
                      suffix="hrs"
                      value={form.match_deadline_hours}
                      onChange={(v) => set("match_deadline_hours", v)}
                    />
                  </Field>
                </div>

                <ToggleRow
                  name="Require screenshot proof"
                  description="Both players submit the score with a screenshot. A mismatch becomes a dispute for you to resolve."
                  checked={form.require_screenshot_proof}
                  onToggle={() => set("require_screenshot_proof", !form.require_screenshot_proof)}
                />

                <Field label="Rules" htmlFor="rules" hint="Shown to players before they pay to join.">
                  <Textarea
                    id="rules"
                    rows={6}
                    value={form.rules}
                    onChange={(e) => set("rules", e.target.value)}
                    placeholder={"e.g.\n- Match duration: 10 minutes\n- No custom squads\n- Report the score within 1 hour"}
                  />
                </Field>

                <div className="flex gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
                  <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <p>Fixtures are generated automatically once registration closes.</p>
                </div>
              </>
            )}

            {/* STEP 4: REVIEW */}
            {step === 4 && (
              <>
                <div>
                  <h2 className="text-lg font-semibold">Review</h2>
                  <p className="text-sm text-muted-foreground">Check everything before you save.</p>
                </div>

                <ReviewBlock
                  title="Basics"
                  onEdit={() => goTo(0)}
                  rows={[
                    ["Name", form.name],
                    ["Game", `${form.game} · ${PLATFORMS.find((p) => p.value === form.platform)?.label}`],
                    [
                      "Visibility",
                      form.visibility === "private" ? `Private (code ${form.invite_code || "not set"})` : "Public",
                    ],
                  ]}
                />
                <ReviewBlock
                  title="Format"
                  onEdit={() => goTo(1)}
                  rows={[
                    ["Type", formatLabel(form)],
                    ["Players", `${form.min_players} to ${form.max_players}`],
                    ...summary.stages.map((s): [string, string] => [s.title, s.detail]),
                    ["Total matches", `About ${summary.totalMatches}`],
                  ]}
                />
                <ReviewBlock
                  title="Entry & prizes"
                  onEdit={() => goTo(2)}
                  rows={[
                    ["Entry fee", form.entry_fee === 0 ? "Free" : formatNaira(form.entry_fee)],
                    ["Prize pool", formatNaira(form.prize_pool)],
                    [
                      "Split",
                      `1st ${form.prize_split.first}% · 2nd ${form.prize_split.second}% · 3rd ${form.prize_split.third}%`,
                    ],
                    ["Auto-cancel if under minimum", form.auto_cancel_if_under_min ? "Yes" : "No"],
                  ]}
                />
                <ReviewBlock
                  title="Schedule & rules"
                  onEdit={() => goTo(3)}
                  rows={[
                    ["Registration opens", formatDateTime(form.registration_opens_at)],
                    ["Registration closes", formatDateTime(form.registration_closes_at)],
                    ["Starts", formatDateTime(form.starts_at)],
                    ["Time per match", `${form.match_deadline_hours} hours`],
                    ["Screenshot proof", form.require_screenshot_proof ? "Required" : "Not required"],
                  ]}
                />
              </>
            )}

            {showErrors && <ErrorList errors={stepErrors} />}
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4 sm:px-6">
            <Button variant="outline" onClick={() => goTo(step - 1)} disabled={step === 0}>
              <ArrowLeft className="size-4" />
              Back
            </Button>

            {step < STEPS.length - 1 ? (
              <Button onClick={next}>
                Next
                <ArrowRight className="size-4" />
              </Button>
            ) : isDraftLike ? (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => save("draft")}>
                  Save as draft
                </Button>
                <Button onClick={() => save("publish")}>Publish tournament</Button>
              </div>
            ) : (
              <Button onClick={() => save("update")}>Save changes</Button>
            )}
          </div>
        </div>

        {/* Live summary */}
        <aside className={`${card} p-5 lg:sticky lg:top-24`}>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Summary</p>
          <h2 className="mt-1 truncate text-lg font-semibold">{form.name.trim() || "Untitled tournament"}</h2>
          <p className="text-sm text-muted-foreground">
            {form.game} · {formatLabel(form)}
          </p>

          <ol className="mt-4 space-y-3 border-l-2 border-border pl-4">
            {summary.stages.map((s) => (
              <li key={s.title} className="relative">
                <span className="absolute -left-[22px] top-1.5 size-2 rounded-full bg-primary" />
                <p className="text-sm font-medium">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.detail}</p>
              </li>
            ))}
          </ol>

          <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Total matches</dt>
              <dd className="font-medium">{summary.totalMatches}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Players</dt>
              <dd className="font-medium">
                {form.min_players}–{form.max_players}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Entry fee</dt>
              <dd className="font-medium">{form.entry_fee === 0 ? "Free" : formatNaira(form.entry_fee)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Prize pool</dt>
              <dd className="font-medium text-success">{formatNaira(form.prize_pool)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  )
}