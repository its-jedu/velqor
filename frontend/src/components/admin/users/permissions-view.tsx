"use client"

import { Fragment } from "react"
import { Check, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PERMISSIONS, SCOPES, type Role } from "./access-data"

const card = "rounded-xl border border-border bg-card text-card-foreground"

interface PermissionsViewProps {
  roles: Role[]
  onManageRoles: () => void
}

export function PermissionsView({ roles, onManageRoles }: PermissionsViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          A quick view of what each role can do. {PERMISSIONS.length} permissions in total.
        </p>
        <Button variant="outline" onClick={onManageRoles}>
          Edit roles
        </Button>
      </div>

      <div className={`${card} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Permission</th>
                {roles.map((r) => (
                  <th key={r.id} className="w-28 px-4 py-3 text-center font-medium">
                    {r.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SCOPES.map((scope) => (
                <Fragment key={scope.key}>
                  <tr className="border-b border-border bg-muted/20">
                    <td
                      colSpan={roles.length + 1}
                      className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {scope.title}
                    </td>
                  </tr>
                  {PERMISSIONS.filter((p) => p.scope === scope.key).map((p) => (
                    <tr key={p.code} className="border-b border-border last:border-0 hover:bg-accent/40">
                      <td className="px-4 py-3">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.description}</p>
                      </td>
                      {roles.map((r) => (
                        <td key={r.id} className="px-4 py-3 text-center">
                          {r.permissions.includes(p.code) ? (
                            <Check className="mx-auto size-4 text-success" aria-label="Allowed" />
                          ) : (
                            <Minus
                              className="mx-auto size-4 text-muted-foreground/40"
                              aria-label="Not allowed"
                            />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}