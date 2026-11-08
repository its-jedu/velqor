// ---------------------------------------------------------------
// MOCK DATA. Replace each fetchX function with a real api call
// when the endpoints are ready (see api.getWalletBalance(), etc.).
// Set MOCK_MODE to "empty" to see the new-user empty states.
// ---------------------------------------------------------------
const MOCK_MODE: "full" | "empty" = "full"

export type MatchResult = "win" | "loss" | "draw"

export interface WalletData {
  balance: number
  pendingWithdrawals: number
}

export interface DashboardStatsData {
  totalMatches: number
  wins: number
  losses: number
  draws: number
  totalWinnings: number
  tournamentsPlayed: number
  tournamentsWon: number
}

export interface Tournament {
  id: string
  name: string
  game: string
  entryFee: number
  prizePool: number
  startsAt: string // ISO date
  players: number
  maxPlayers: number
  status: "live" | "upcoming"
}

export interface Match {
  id: string
  tournament: string
  opponent: string
  result: MatchResult
  date: string // ISO date
  prize: number
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))
const hoursFromNow = (h: number) => new Date(Date.now() + h * 3_600_000).toISOString()
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString()

export async function fetchWallet(): Promise<WalletData> {
  await delay(700)
  return MOCK_MODE === "empty"
    ? { balance: 0, pendingWithdrawals: 0 }
    : { balance: 48500, pendingWithdrawals: 10000 }
}

export async function fetchStats(): Promise<DashboardStatsData> {
  await delay(900)
  return MOCK_MODE === "empty"
    ? { totalMatches: 0, wins: 0, losses: 0, draws: 0, totalWinnings: 0, tournamentsPlayed: 0, tournamentsWon: 0 }
    : { totalMatches: 24, wins: 15, losses: 7, draws: 2, totalWinnings: 185000, tournamentsPlayed: 9, tournamentsWon: 3 }
}

export async function fetchTournaments(): Promise<Tournament[]> {
  await delay(1000)
  return [
    {
      id: "t1",
      name: "eFootball Champions League",
      game: "eFootball",
      entryFee: 1000,
      prizePool: 50000,
      startsAt: hoursFromNow(-0.5),
      players: 28,
      maxPlayers: 32,
      status: "live",
    },
    {
      id: "t2",
      name: "8 Ball Pool Masters",
      game: "8 Ball Pool",
      entryFee: 500,
      prizePool: 20000,
      startsAt: hoursFromNow(3),
      players: 12,
      maxPlayers: 16,
      status: "upcoming",
    },
    {
      id: "t3",
      name: "COD Mobile Warzone Cup",
      game: "COD Mobile",
      entryFee: 2000,
      prizePool: 100000,
      startsAt: hoursFromNow(26),
      players: 40,
      maxPlayers: 64,
      status: "upcoming",
    },
  ]
}

export async function fetchMatches(): Promise<Match[]> {
  await delay(1100)
  if (MOCK_MODE === "empty") return []
  return [
    { id: "m1", tournament: "eFootball Champions League", opponent: "ShadowStrike", result: "win", date: daysAgo(1), prize: 25000 },
    { id: "m2", tournament: "8 Ball Pool Masters", opponent: "PoolLegend", result: "loss", date: daysAgo(2), prize: 0 },
    { id: "m3", tournament: "COD Mobile Warzone Cup", opponent: "SniperElite", result: "win", date: daysAgo(4), prize: 50000 },
    { id: "m4", tournament: "eFootball Weekend Cup", opponent: "GoalMachine", result: "draw", date: daysAgo(6), prize: 0 },
  ]
}