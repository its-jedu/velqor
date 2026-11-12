"use client"

import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatNaira } from "./format-utils"
import { tournamentStore } from "./store"
import type { Tournament } from "./types"

export type ConfirmState = { kind: "cancel" | "delete"; t: Tournament } | null

interface Props {
  confirm: ConfirmState
  onClose: () => void
  onDone?: (kind: "cancel" | "delete") => void
}

export function TournamentConfirmDialog({ confirm, onClose, onDone }: Props) {
  function run() {
    if (!confirm) return
    const { kind, t } = confirm
    if (kind === "cancel") {
      tournamentStore.setStatus(t.id, "cancelled")
      toast.success("Tournament cancelled", {
        description: `${formatNaira(t.joined_players * t.entry_fee)} will be refunded to ${t.joined_players} players.`,
      })
    } else {
      tournamentStore.remove(t.id)
      toast.success("Draft deleted", { description: t.name })
    }
    onClose()
    onDone?.(kind)
  }

  return (
    <AlertDialog open={!!confirm} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {confirm?.kind === "cancel" ? "Cancel this tournament?" : "Delete this draft?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {confirm?.kind === "cancel"
              ? `${confirm.t.name} will be cancelled and ${formatNaira(
                  confirm.t.joined_players * confirm.t.entry_fee
                )} in entry fees will be refunded to ${confirm.t.joined_players} players. This can't be undone.`
              : `${confirm?.t.name ?? "This draft"} will be removed. This can't be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction
            onClick={run}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {confirm?.kind === "cancel" ? "Cancel and refund" : "Delete draft"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}