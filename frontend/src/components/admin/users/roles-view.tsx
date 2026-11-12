"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Lock, RotateCcw, Save, Users as UsersIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PERMISSIONS, SCOPES, type Role, type RoleId } from "./access-data"
import { PermissionRow } from "./permission-row"

const card = "rounded-xl border border-border bg-card text-card-foreground"

const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && a.every((x) => b.includes(x))

interface RolesViewProps {
  roles: Role[]
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>
  counts: Record<RoleId, number>
}

export function RolesView({ roles, setRoles, counts }: RolesViewProps) {
  const [selectedId, setSelectedId] = useState<RoleId>("admin")
  const selected = roles.find((r) => r.id === selectedId) ?? roles[0]
  const isAdmin = selected.id === "admin"

  const [perms, setPerms] = useState<string[]>(selected.permissions)

  // Reset the draft when a different role is picked or the saved role changes
  useEffect(() => {
    setPerms(selected.permissions)
  }, [selected])

  const dirty = !sameSet(perms, selected.permissions)

  function toggle(code: string) {
    setPerms((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]))
  }

  function save() {
    setRoles((prev) => prev.map((r) => (r.id === selected.id ? { ...r, permissions: perms } : r)))
    toast.success("Role saved", {
      description: `${selected.name} now has ${perms.length} permission${perms.length === 1 ? "" : "s"}.`,
    })
  }

  return (
    <div className="space-y-6">
      {/* Role picker */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {roles.map((role) => {
          const active = role.id === selected.id
          return (
            <button
              key={role.id}
              onClick={() => setSelectedId(role.id)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                active
                  ? "border-primary/50 bg-primary/10"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold">{role.name}</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  <Lock className="size-3" />
                  System role
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{role.description}</p>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <UsersIcon className="size-3.5" />
                  {counts[role.id]} user{counts[role.id] === 1 ? "" : "s"}
                </span>
                <span>
                  {role.permissions.length} of {PERMISSIONS.length} permissions
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Editor */}
      <div className={card}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
          <div>
            <h2 className="font-semibold">{selected.name} permissions</h2>
            <p className="text-sm text-muted-foreground">
              {isAdmin
                ? "Admin always has every permission, so this can't be changed."
                : "Tick what players are allowed to do."}
            </p>
          </div>
          {!isAdmin && (
            <div className="flex items-center gap-2">
              {dirty && (
                <span className="mr-1 inline-flex items-center gap-1.5 text-xs text-warning">
                  <span className="size-1.5 rounded-full bg-warning" />
                  Unsaved changes
                </span>
              )}
              <Button variant="outline" onClick={() => setPerms(selected.permissions)} disabled={!dirty}>
                <RotateCcw className="size-4" />
                Reset
              </Button>
              <Button onClick={save} disabled={!dirty}>
                <Save className="size-4" />
                Save changes
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-6 p-5">
          {SCOPES.map((scope) => {
            const items = PERMISSIONS.filter((p) => p.scope === scope.key)
            const lockedOff = !isAdmin && scope.key === "admin"

            return (
              <section key={scope.key}>
                <div className="mb-2">
                  <h3 className="text-sm font-semibold">{scope.title}</h3>
                  <p className="text-xs text-muted-foreground">{scope.hint}</p>
                </div>
                <div className="divide-y divide-border rounded-lg border border-border">
                  {items.map((p) => (
                    <PermissionRow
                      key={p.code}
                      name={p.name}
                      description={p.description}
                      checked={isAdmin ? true : perms.includes(p.code)}
                      disabled={isAdmin || lockedOff}
                      note={lockedOff ? "Admins only" : undefined}
                      onToggle={() => toggle(p.code)}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}