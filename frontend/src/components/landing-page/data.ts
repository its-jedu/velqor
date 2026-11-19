// Mock content for the homepage. Replace with real API data before launch.

// TODO: confirm this is the real rule (prize pool = 30% of total entry fees)
export const PRIZE_SHARE = 0.3

export type TournamentStatus = "open" | "filling" | "live"

export type Tournament = {
  id: number
  title: string
  game: "eFootball" | "Call of Duty" | "8Ball Pool"
  image: string
  entryFee: number
  slots: number
  joined: number
  format: "League" | "Cup"
  status: TournamentStatus
  startsLabel: string
}

export const formatNaira = (amount: number) => `₦${amount.toLocaleString("en-US")}`

export const getPrizePool = (t: Pick<Tournament, "entryFee" | "slots">) =>
  t.entryFee * t.slots * PRIZE_SHARE

export const games = [
  {
    name: "eFootball" as const,
    tagline: "Pick your squad and win the league on the pitch.",
    image:
      "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Call of Duty" as const,
    tagline: "Fast lobbies, tight brackets, no excuses.",
    image:
      "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "8Ball Pool" as const,
    tagline: "Clear the table before your opponent does.",
    image:
      "https://images.pexels.com/photos/1263349/pexels-photo-1263349.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
]

const img = Object.fromEntries(games.map((g) => [g.name, g.image])) as Record<
  (typeof games)[number]["name"],
  string
>

export const tournaments: Tournament[] = [
  {
    id: 1,
    title: "eFootball Champions League",
    game: "eFootball",
    image: img["eFootball"],
    entryFee: 5000,
    slots: 128,
    joined: 96,
    format: "Cup",
    status: "filling",
    startsLabel: "Starts Saturday, 6:00 PM",
  },
  {
    id: 2,
    title: "COD Modern Warfare Cup",
    game: "Call of Duty",
    image: img["Call of Duty"],
    entryFee: 10000,
    slots: 64,
    joined: 22,
    format: "Cup",
    status: "open",
    startsLabel: "Starts Sunday, 4:00 PM",
  },
  {
    id: 3,
    title: "8Ball Pool Masters",
    game: "8Ball Pool",
    image: img["8Ball Pool"],
    entryFee: 3000,
    slots: 256,
    joined: 256,
    format: "League",
    status: "live",
    startsLabel: "Live now",
  },
  {
    id: 4,
    title: "eFootball Weekly League",
    game: "eFootball",
    image: img["eFootball"],
    entryFee: 2000,
    slots: 32,
    joined: 9,
    format: "League",
    status: "open",
    startsLabel: "Starts Monday, 7:00 PM",
  },
  {
    id: 5,
    title: "COD Squad Showdown",
    game: "Call of Duty",
    image: img["Call of Duty"],
    entryFee: 5000,
    slots: 32,
    joined: 30,
    format: "Cup",
    status: "filling",
    startsLabel: "Starts Friday, 8:00 PM",
  },
  {
    id: 6,
    title: "8Ball Midweek Cup",
    game: "8Ball Pool",
    image: img["8Ball Pool"],
    entryFee: 1500,
    slots: 64,
    joined: 18,
    format: "Cup",
    status: "open",
    startsLabel: "Starts Wednesday, 5:00 PM",
  },
]

// TODO: replace with real winners from the API, or remove the Winners section until you have them.
export const winners = [
  { name: "Chidi_K", game: "eFootball", tournament: "Champions League", prize: 180000, when: "2 days ago" },
  { name: "TundeFC", game: "eFootball", tournament: "Weekly League", prize: 24000, when: "3 days ago" },
  { name: "Zara.Plays", game: "Call of Duty", tournament: "Modern Warfare Cup", prize: 96000, when: "5 days ago" },
  { name: "Bolu_8", game: "8Ball Pool", tournament: "Masters", prize: 230000, when: "1 week ago" },
  { name: "KingEmeka", game: "Call of Duty", tournament: "Squad Showdown", prize: 48000, when: "1 week ago" },
]