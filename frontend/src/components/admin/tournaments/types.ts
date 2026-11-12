// ─────────────────────────────────────────────────────────────
// DATA CONTRACT for tournaments (field names are snake_case so
// the Django API can use them as they are).
// Money is in whole naira. Dates are local "YYYY-MM-DDTHH:mm"
// strings for now; send them to the API with a timezone offset.
// ─────────────────────────────────────────────────────────────

export const NAIRA = "\u20A6"

export type TournamentFormat = "league" | "cup"
export type CupStage = "knockout" | "groups_knockout"
export type Legs = "single" | "double"
export type Seeding = "random" | "manual"
export type Visibility = "public" | "private"
export type Platform = "mobile" | "playstation" | "xbox" | "pc"

export type TournamentStatus =
  | "draft"
  | "registration_open"
  | "registration_closed"
  | "in_progress"
  | "completed"
  | "cancelled"

export interface FormatConfig {
  // Used by league and by the group stage
  allow_draws: boolean
  points_win: number // default 3
  points_draw: number // default 1, ignored if allow_draws is false

  // League only
  league_legs: Legs // single = play each other once, double = home and away

  // Cup only
  cup_stage: CupStage // "knockout" or "groups_knockout"
  group_count: number // groups_knockout only
  qualifiers_per_group: number // groups_knockout only
  group_legs: Legs // groups_knockout only
  knockout_legs: Legs // double = two-leg ties, final is always one match
  third_place_match: boolean
  seeding: Seeding
}

// What the admin fills in when creating or editing
export interface TournamentInput {
  // Basics
  name: string
  game: string
  platform: Platform
  description: string
  cover_image_url: string
  visibility: Visibility
  invite_code: string // required when visibility is "private"

  // Format
  format: TournamentFormat
  min_players: number
  max_players: number
  format_config: FormatConfig

  // Entry and prizes
  entry_fee: number // 0 = free
  prize_pool: number // fixed amount set by the admin
  prize_split: { first: number; second: number; third: number } // percentages, must total 100
  auto_cancel_if_under_min: boolean // cancel + refund if min_players isn't reached

  // Schedule and rules
  registration_opens_at: string
  registration_closes_at: string
  starts_at: string
  match_deadline_hours: number // time players get to finish each match
  require_screenshot_proof: boolean
  rules: string
}

// What the server returns (input + server-managed fields)
export interface Tournament extends TournamentInput {
  id: string
  status: TournamentStatus
  joined_players: number
  created_at: string
}

export interface Game {
  id: string
  name: string
  allow_draws: boolean // default for new tournaments of this game
  created_at: string
}

export const PLATFORMS: { value: Platform; label: string }[] = [
  { value: "mobile", label: "Mobile" },
  { value: "playstation", label: "PlayStation" },
  { value: "xbox", label: "Xbox" },
  { value: "pc", label: "PC" },
]

export const STATUS_META: Record<TournamentStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  registration_open: { label: "Registration open", className: "bg-warning/15 text-warning" },
  registration_closed: { label: "Registration closed", className: "bg-primary/15 text-primary" },
  in_progress: { label: "In progress", className: "bg-success/15 text-success" },
  completed: { label: "Completed", className: "bg-muted text-muted-foreground" },
  cancelled: { label: "Cancelled", className: "bg-destructive/15 text-destructive" },
}

export const DEFAULT_FORMAT_CONFIG: FormatConfig = {
  allow_draws: true,
  points_win: 3,
  points_draw: 1,
  league_legs: "single",
  cup_stage: "knockout",
  group_count: 4,
  qualifiers_per_group: 2,
  group_legs: "single",
  knockout_legs: "single",
  third_place_match: false,
  seeding: "random",
}

export function defaultTournamentInput(): TournamentInput {
  return {
    name: "",
    game: "eFootball",
    platform: "mobile",
    description: "",
    cover_image_url: "",
    visibility: "public",
    invite_code: "",
    format: "cup",
    min_players: 8,
    max_players: 16,
    format_config: { ...DEFAULT_FORMAT_CONFIG },
    entry_fee: 1000,
    prize_pool: 10000,
    prize_split: { first: 70, second: 20, third: 10 },
    auto_cancel_if_under_min: true,
    registration_opens_at: "",
    registration_closes_at: "",
    starts_at: "",
    match_deadline_hours: 24,
    require_screenshot_proof: true,
    rules: "",
  }
}

// Strip the server-managed fields so a tournament can be edited as a form
export function toInput(t: Tournament): TournamentInput {
  const input = { ...t } as Partial<Tournament>
  delete input.id
  delete input.status
  delete input.joined_players
  delete input.created_at
  return input as TournamentInput
}