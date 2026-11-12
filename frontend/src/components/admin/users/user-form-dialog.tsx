"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { api, type AdminUser } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AdminUser | null // null = create, otherwise edit
  onSaved: (user: AdminUser, mode: "create" | "edit") => void
}

const empty = {
  email: "",
  username: "",
  first_name: "",
  last_name: "",
  phone_number: "",
  is_active: true,
}

export function UserFormDialog({ open, onOpenChange, user, onSaved }: UserFormDialogProps) {
  const isEdit = !!user
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    setForm(
      user
        ? {
            email: user.email,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            phone_number: user.phone_number ?? "",
            is_active: user.is_active,
          }
        : empty
    )
  }, [open, user])

  const set = (key: keyof typeof empty, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!isEdit && (!form.email.trim() || !form.username.trim())) {
      setError("Email and username are required.")
      return
    }

    setSaving(true)
    try {
      if (isEdit && user) {
        const updated = await api.adminUpdateUser(user.id, {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          ...(form.phone_number.trim() && { phone_number: form.phone_number.trim() }),
          is_active: form.is_active,
        })
        onSaved(updated, "edit")
        toast.success("User updated", { description: `@${user.username} was saved.` })
      } else {
        const created = await api.adminCreateUser({
          email: form.email.trim(),
          username: form.username.trim(),
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          ...(form.phone_number.trim() && { phone_number: form.phone_number.trim() }),
        })
        onSaved(created, "create")
        toast.success("User created", { description: `@${created.username} was added.` })
      }
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !saving && onOpenChange(next)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit user" : "Add user"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this person's details or access. Email and username can't be changed here."
              : "Create a new account. They'll appear in the list straight away."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">First name</Label>
              <Input
                id="first_name"
                value={form.first_name}
                onChange={(e) => set("first_name", e.target.value)}
                placeholder="Emmanuel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last name</Label>
              <Input
                id="last_name"
                value={form.last_name}
                onChange={(e) => set("last_name", e.target.value)}
                placeholder="Adesemowo"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="user@example.com"
              disabled={isEdit}
              required={!isEdit}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={form.username}
                onChange={(e) => set("username", e.target.value)}
                placeholder="GamerTag2026"
                disabled={isEdit}
                required={!isEdit}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone (optional)</Label>
              <Input
                id="phone_number"
                value={form.phone_number}
                onChange={(e) => set("phone_number", e.target.value)}
                placeholder="+2348012345678"
              />
            </div>
          </div>

          {isEdit && (
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Account active</p>
                <p className="text-xs text-muted-foreground">
                  Inactive users can&apos;t log in or join tournaments.
                </p>
              </div>
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) => set("is_active", checked)}
              />
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Save changes" : "Create user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}