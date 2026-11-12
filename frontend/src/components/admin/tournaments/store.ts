"use client"

import { useSyncExternalStore } from "react"
import { SAMPLE_TOURNAMENTS } from "./mock-data"
import type { Tournament, TournamentInput, TournamentStatus } from "./types"

// In-memory store so the list and the create/edit pages share data.
// Resets on a full page refresh. When the API is ready, replace the
// bodies of these functions with fetch calls. The components only
// use this file.

let tournaments: Tournament[] = SAMPLE_TOURNAMENTS
const listeners = new Set<() => void>()

const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}
const newId = () => `t_${Math.random().toString(36).slice(2, 8)}`

export function useTournaments(): Tournament[] {
  return useSyncExternalStore(
    subscribe,
    () => tournaments,
    () => SAMPLE_TOURNAMENTS
  )
}

export const tournamentStore = {
  create(input: TournamentInput, status: TournamentStatus): Tournament {
    const t: Tournament = {
      ...input,
      id: newId(),
      status,
      joined_players: 0,
      created_at: new Date().toISOString(),
    }
    tournaments = [t, ...tournaments]
    emit()
    return t
  },

  update(id: string, input: TournamentInput) {
    tournaments = tournaments.map((t) => (t.id === id ? { ...t, ...input } : t))
    emit()
  },

  setStatus(id: string, status: TournamentStatus) {
    tournaments = tournaments.map((t) => (t.id === id ? { ...t, status } : t))
    emit()
  },

  remove(id: string) {
    tournaments = tournaments.filter((t) => t.id !== id)
    emit()
  },

  duplicate(id: string): Tournament | undefined {
    const src = tournaments.find((t) => t.id === id)
    if (!src) return undefined
    const copy: Tournament = {
      ...src,
      id: newId(),
      name: `${src.name} (copy)`,
      status: "draft",
      joined_players: 0,
      created_at: new Date().toISOString(),
      invite_code: "",
      registration_opens_at: "",
      registration_closes_at: "",
      starts_at: "",
    }
    tournaments = [copy, ...tournaments]
    emit()
    return copy
  },
}