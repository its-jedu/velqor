"use client"

import { useSyncExternalStore } from "react"
import type { Game } from "./types"

const INITIAL_GAMES: Game[] = [
  { id: "g_efootball", name: "eFootball", allow_draws: true, created_at: "2026-10-01T10:00:00.000Z" },
  { id: "g_eafc", name: "EA FC Mobile", allow_draws: true, created_at: "2026-10-01T10:00:00.000Z" },
  { id: "g_pool", name: "8 Ball Pool", allow_draws: false, created_at: "2026-10-01T10:00:00.000Z" },
  { id: "g_cod", name: "COD Mobile", allow_draws: false, created_at: "2026-10-01T10:00:00.000Z" },
]

let games: Game[] = INITIAL_GAMES
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

export function useGames(): Game[] {
  return useSyncExternalStore(
    subscribe,
    () => games,
    () => INITIAL_GAMES
  )
}

type AddResult = { ok: true; game: Game } | { ok: false; error: string }

export const gameStore = {
  add(name: string, allowDraws: boolean): AddResult {
    const trimmed = name.trim()
    if (trimmed.length < 2) return { ok: false, error: "Enter the game's name (at least 2 characters)." }
    if (games.some((g) => g.name.toLowerCase() === trimmed.toLowerCase())) {
      return { ok: false, error: "That game already exists." }
    }
    const game: Game = {
      id: `g_${Math.random().toString(36).slice(2, 8)}`,
      name: trimmed,
      allow_draws: allowDraws,
      created_at: new Date().toISOString(),
    }
    games = [...games, game]
    emit()
    return { ok: true, game }
  },

  remove(id: string) {
    games = games.filter((g) => g.id !== id)
    emit()
  },
}