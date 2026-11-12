"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Gamepad2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PermissionRow } from "../users/permission-row"
import { gameStore, useGames } from "./games-store"
import type { Tournament } from "./types"

interface GamesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tournaments: Tournament[]
}

export function GamesDialog({ open, onOpenChange, tournaments }: GamesDialogProps) {
  const games = useGames()
  const [name, setName] = useState("")
  const [allowDraws, setAllowDraws] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName("")
      setAllowDraws(true)
      setError(null)
    }
  }, [open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = gameStore.add(name, allowDraws)
    if (!result.ok) {
      setError(result.error)
      return
    }
    toast.success("Game added", { description: result.game.name })
    setName("")
    setAllowDraws(true)
    setError(null)
  }

  function remove(id: string, gameName: string) {
    gameStore.remove(id)
    toast.success("Game removed", { description: gameName })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Games</DialogTitle>
          <DialogDescription>
            Add a new game so it appears when you create a tournament.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="game-name">Game name</Label>
            <div className="flex gap-2">
              <Input
                id="game-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError(null)
                }}
                placeholder="e.g. Tekken 8"
                autoFocus
              />
              <Button type="submit">Add game</Button>
            </div>
          </div>

          <div className="rounded-lg border border-border">
            <PermissionRow
              name="Draws allowed"
              description="New tournaments for this game start with draws turned on. Turn off for games that can't end level."
              checked={allowDraws}
              onToggle={() => setAllowDraws(!allowDraws)}
            />
          </div>

          {error && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </form>

        <div>
          <p className="mb-2 text-sm font-medium">All games ({games.length})</p>
          <div className="divide-y divide-border rounded-lg border border-border">
            {games.map((g) => {
              const used = tournaments.filter((t) => t.game === g.name).length
              return (
                <div key={g.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
                      <Gamepad2 className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{g.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {used} tournament{used === 1 ? "" : "s"} · {g.allow_draws ? "Draws allowed" : "No draws"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={used > 0}
                    onClick={() => remove(g.id, g.name)}
                    title={used > 0 ? "In use by a tournament, so it can't be removed" : "Remove game"}
                    aria-label={`Remove ${g.name}`}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}