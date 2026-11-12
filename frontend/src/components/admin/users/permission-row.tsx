"use client"

import { Check } from "lucide-react"

interface PermissionRowProps {
  name: string
  description: string
  checked: boolean
  disabled?: boolean
  note?: string
  onToggle: () => void
}

export function PermissionRow({
  name,
  description,
  checked,
  disabled,
  note,
  onToggle,
}: PermissionRowProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={onToggle}
      className={`flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors ${
        disabled ? "cursor-not-allowed" : "cursor-pointer hover:bg-accent/40"
      }`}
    >
      <div className="min-w-0">
        <p className={`text-sm font-medium ${disabled && !checked ? "text-muted-foreground" : ""}`}>
          {name}
        </p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {note && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {note}
          </span>
        )}
        <span
          className={`grid size-6 place-items-center rounded-full border-2 transition-colors ${
            checked
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input text-transparent"
          } ${disabled ? "opacity-60" : ""}`}
        >
          <Check className="size-3.5" strokeWidth={3} />
        </span>
      </div>
    </button>
  )
}