import type { Legs, Tournament, TournamentInput } from "./types"
import { NAIRA } from "./types"

export function formatNaira(n: number) {
  return `${NAIRA}${Math.round(Number.isFinite(n) ? n : 0).toLocaleString("en-US")}`
}

export function formatDateTime(value: string) {
  if (!value) return "Not set"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "Not set"
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function formatLabel(t: Pick<TournamentInput, "format" | "format_config">) {
  if (t.format === "league") {
    return `League · ${t.format_config.league_legs === "double" ? "Double" : "Single"} round`
  }
  return `Cup · ${t.format_config.cup_stage === "groups_knockout" ? "Groups + knockout" : "Knockout"}`
}

// ───────── match-count maths ─────────

const nextPowerOfTwo = (n: number) => (n <= 1 ? 1 : 2 ** Math.ceil(Math.log2(n)))

export function leagueMatches(players: number, legs: Legs) {
  if (players < 2) return 0
  return ((players * (players - 1)) / 2) * (legs === "double" ? 2 : 1)
}

export function knockoutMatches(players: number, legs: Legs, thirdPlace: boolean) {
  if (players < 2) return 0
  const multiplier = legs === "double" ? 2 : 1
  const ties = players - 1 // every tie knocks one player out
  let matches = (ties - 1) * multiplier + 1 // the final is always one match
  if (thirdPlace && players >= 4) matches += 1
  return matches
}

function knockoutDetail(players: number, f: TournamentInput) {
  if (players < 2) return "Needs at least 2 players."
  const c = f.format_config
  const rounds = Math.ceil(Math.log2(players))
  const byes = nextPowerOfTwo(players) - players
  const parts = [
    `${players} players, ${rounds} round${rounds === 1 ? "" : "s"}`,
    byes > 0 ? `${byes} bye${byes === 1 ? "" : "s"} in round 1` : null,
    c.knockout_legs === "double" ? "two-leg ties (final is one match)" : "single matches",
    c.third_place_match && players >= 4 ? "third-place match" : null,
  ].filter(Boolean)
  return parts.join(" · ")
}

export interface FormatSummary {
  stages: { title: string; detail: string }[]
  totalMatches: number
}

export function summarizeFormat(f: TournamentInput): FormatSummary {
  const n = Number.isFinite(f.max_players) ? Math.max(0, Math.floor(f.max_players)) : 0
  const c = f.format_config
  const scoring = `Win ${c.points_win} pts${c.allow_draws ? `, draw ${c.points_draw}` : ", no draws"}`

  if (f.format === "league") {
    const mult = c.league_legs === "double" ? 2 : 1
    return {
      totalMatches: leagueMatches(n, c.league_legs),
      stages: [
        {
          title: "League",
          detail: `${n} players play each other ${
            c.league_legs === "double" ? "home and away" : "once"
          } · ${Math.max(0, n - 1) * mult} matches each`,
        },
        { title: "Table", detail: scoring },
      ],
    }
  }

  if (c.cup_stage === "knockout") {
    return {
      totalMatches: knockoutMatches(n, c.knockout_legs, c.third_place_match),
      stages: [{ title: "Knockout", detail: knockoutDetail(n, f) }],
    }
  }

  const g = Math.max(0, Math.floor(c.group_count))
  const size = g > 0 ? Math.floor(n / g) : 0
  const qualifiers = g * Math.max(0, Math.floor(c.qualifiers_per_group))
  return {
    totalMatches:
      g * leagueMatches(size, c.group_legs) +
      knockoutMatches(qualifiers, c.knockout_legs, c.third_place_match),
    stages: [
      {
        title: "Group stage",
        detail: `${g} groups of ${size} · top ${c.qualifiers_per_group} qualify · ${scoring}`,
      },
      { title: "Knockout", detail: knockoutDetail(qualifiers, f) },
    ],
  }
}

// ───────── money helper ─────────

export function moneyNotes(f: TournamentInput) {
  const income = f.entry_fee * f.max_players
  const margin = income - f.prize_pool
  return {
    income,
    margin,
    warning:
      margin < 0
        ? `A full tournament collects ${formatNaira(income)} but pays out ${formatNaira(
            f.prize_pool
          )}. The platform would cover ${formatNaira(-margin)}.`
        : null,
  }
}

// ───────── validation (the backend should repeat these rules) ─────────

export function validateBasics(f: TournamentInput): string[] {
  const errors: string[] = []
  if (f.name.trim().length < 3) errors.push("Give the tournament a name (at least 3 characters).")
  if (!f.game) errors.push("Choose a game.")
  if (f.visibility === "private" && f.invite_code.trim().length < 4) {
    errors.push("Private tournaments need an invite code of at least 4 characters.")
  }
  return errors
}

export function validateFormat(f: TournamentInput): string[] {
  const errors: string[] = []
  const c = f.format_config
  const min = f.min_players
  const max = f.max_players

  if (!Number.isInteger(min) || min < 2) errors.push("Minimum players must be a whole number of at least 2.")
  if (!Number.isInteger(max) || max < min) errors.push("Maximum players can't be less than the minimum.")

  const hasTable = f.format === "league" || c.cup_stage === "groups_knockout"
  if (hasTable) {
    if (c.points_win < 1) errors.push("A win must be worth at least 1 point.")
    if (c.allow_draws && c.points_draw >= c.points_win) errors.push("A draw must be worth less than a win.")
  }

  if (f.format === "league" && min < 3) errors.push("A league needs at least 3 players.")

  if (f.format === "cup" && c.cup_stage === "groups_knockout") {
    const g = c.group_count
    const q = c.qualifiers_per_group
    if (!Number.isInteger(g) || g < 2) {
      errors.push("Use at least 2 groups.")
    } else {
      const maxSize = Math.floor(max / g)
      const minSize = Math.floor(min / g)
      if (max % g !== 0) {
        errors.push(`${max} players can't be split into ${g} equal groups. Change the player limit or the number of groups.`)
      }
      if (maxSize < 3) errors.push(`Each group needs at least 3 players, so ${g} groups need at least ${g * 3} players.`)
      if (q < 1 || q >= maxSize) errors.push(`Qualifiers per group must be between 1 and ${Math.max(1, maxSize - 1)}.`)
      if (minSize < 3) errors.push(`Set the minimum players to at least ${g * 3} so every group has 3 players.`)
      else if (q >= minSize && q < maxSize) errors.push(`With only ${min} players, groups would have ${minSize} players but ${q} qualify. Raise the minimum players.`)
      if (g * q < 2) errors.push("At least 2 players must qualify for the knockout stage.")
    }
  }
  return errors
}

export function validateMoney(f: TournamentInput): string[] {
  const errors: string[] = []
  if (f.entry_fee < 0) errors.push("Entry fee can't be negative.")
  if (f.prize_pool < 0) errors.push("Prize pool can't be negative.")
  const { first, second, third } = f.prize_split
  if (first < 0 || second < 0 || third < 0) errors.push("Prize percentages can't be negative.")
  if (f.prize_pool > 0 && first + second + third !== 100) {
    errors.push(`Prize split adds up to ${first + second + third}%. It must be exactly 100%.`)
  }
  return errors
}

export function validateSchedule(f: TournamentInput): string[] {
  const errors: string[] = []
  if (!f.registration_opens_at) errors.push("Set when registration opens.")
  if (!f.registration_closes_at) errors.push("Set when registration closes.")
  if (!f.starts_at) errors.push("Set when the tournament starts.")
  if (f.registration_opens_at && f.registration_closes_at && f.starts_at) {
    const opens = new Date(f.registration_opens_at).getTime()
    const closes = new Date(f.registration_closes_at).getTime()
    const starts = new Date(f.starts_at).getTime()
    if (closes <= opens) errors.push("Registration must close after it opens.")
    if (starts < closes) errors.push("The tournament can't start before registration closes.")
  }
  if (!(f.match_deadline_hours >= 1)) errors.push("Players need at least 1 hour to finish a match.")
  return errors
}

export function validateStep(step: number, f: TournamentInput): string[] {
  switch (step) {
    case 0:
      return validateBasics(f)
    case 1:
      return validateFormat(f)
    case 2:
      return validateMoney(f)
    case 3:
      return validateSchedule(f)
    default:
      return [...validateBasics(f), ...validateFormat(f), ...validateMoney(f), ...validateSchedule(f)]
  }
}

export function validateAll(f: TournamentInput): { step: number; errors: string[] } | null {
  for (let step = 0; step < 4; step++) {
    const errors = validateStep(step, f)
    if (errors.length) return { step, errors }
  }
  return null
}

export type { Tournament }