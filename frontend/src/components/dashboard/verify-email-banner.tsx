"use client"

import { useState } from "react"
import { Mail, X } from "lucide-react"
import { toast } from "sonner"

export function VerifyEmailBanner({ email }: { email: string }) {
  const [dismissed, setDismissed] = useState(false)
  const [sent, setSent] = useState(false)

  if (dismissed) return null

  const handleResend = () => {
    // TODO: call the real "resend verification" endpoint here
    setSent(true)
    toast.success("Verification email sent", {
      description: `Check ${email} for the link.`,
    })
  }

  return (
    <div
      role="status"
      className="flex flex-col gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <Mail className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
        <div>
          <p className="text-sm font-medium">Verify your email</p>
          <p className="text-xs text-foreground/60">
            We need to confirm {email} before you can withdraw winnings.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleResend}
          disabled={sent}
          className="rounded-md bg-yellow-500 px-3 py-1.5 text-xs font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {sent ? "Email sent" : "Resend email"}
        </button>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => setDismissed(true)}
          className="rounded-md p-1.5 text-foreground/60 transition-colors hover:bg-foreground/10"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}