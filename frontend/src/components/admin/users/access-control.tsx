"use client"

import { Info } from "lucide-react"
import type { Role, RoleId } from "./access-data"
import { RolesView } from "./roles-view"
import { PermissionsView } from "./permissions-view"

interface AccessControlProps {
  view: "roles" | "permissions"
  onViewChange: (view: "roles" | "permissions") => void
  roles: Role[]
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>
  counts: Record<RoleId, number>
}

export function AccessControl({ view, onViewChange, roles, setRoles, counts }: AccessControlProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-warning" />
        <p>
          This is sample data. Changes stay in your browser until the roles and permissions API is
          connected.
        </p>
      </div>

      {view === "roles" ? (
        <RolesView roles={roles} setRoles={setRoles} counts={counts} />
      ) : (
        <PermissionsView roles={roles} onManageRoles={() => onViewChange("roles")} />
      )}
    </div>
  )
}