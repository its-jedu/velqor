import { toast } from "sonner"
import { validateAll } from "./format-utils"
import { tournamentStore } from "./store"
import { toInput, type Tournament } from "./types"

export const tournamentActions = {
  publish(t: Tournament) {
    const problem = validateAll(toInput(t))
    if (problem) {
      toast.error("This draft isn't finished yet", { description: problem.errors[0] })
      return
    }
    tournamentStore.setStatus(t.id, "registration_open")
    toast.success("Registration is open", { description: t.name })
  },

  closeRegistration(t: Tournament) {
    tournamentStore.setStatus(t.id, "registration_closed")
    toast.success("Registration closed", {
      description: `${t.joined_players} players joined ${t.name}.`,
    })
  },

  start(t: Tournament) {
    if (t.joined_players < t.min_players) {
      toast.error("Not enough players", {
        description: `${t.joined_players} joined but at least ${t.min_players} are needed.`,
      })
      return
    }
    tournamentStore.setStatus(t.id, "in_progress")
    toast.success("Tournament started", { description: t.name })
  },

  duplicate(t: Tournament): Tournament | undefined {
    const copy = tournamentStore.duplicate(t.id)
    if (copy) toast.success("Draft created", { description: copy.name })
    return copy
  },
}