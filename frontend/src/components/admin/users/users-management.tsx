"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  AlertCircle,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
  Users as UsersIcon,
} from "lucide-react"
import { api, type AdminUser } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { UserFormDialog } from "./user-form-dialog"
import { AccessControl } from "./access-control"
import { INITIAL_ROLES, type Role } from "./access-data"
import { useRouter } from "next/navigation";
import { User } from "lucide-react";

const PAGE_SIZE = 10
const card = "rounded-xl border border-border bg-card text-card-foreground"
const selectClass =
  "h-9 rounded-lg border border-input bg-card px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"

type TabKey = "users" | "roles" | "permissions"

const roleClass: Record<string, string> = {
  admin: "bg-primary/15 text-primary",
  moderator: "bg-warning/15 text-warning",
  player: "bg-muted text-muted-foreground",
}

function fullName(u: AdminUser) {
  return [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username
}

function initials(u: AdminUser) {
  return fullName(u)
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("")
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function timeAgo(iso: string | null) {
  if (!iso) return "Never"
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(iso)
}

export default function UsersManagement() {
  const { user: me } = useAuth()

  const [tab, setTab] = useState<TabKey>("users")
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [deleting, setDeleting] = useState<AdminUser | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setUsers(await api.adminListUsers())
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // const roles = useMemo(() => Array.from(new Set(users.map((u) => u.role))), [users])

const stats = useMemo(
  () => [
    { label: "Total users", value: users.length },
    { label: "Active", value: users.filter((u) => u.is_active).length },
    { label: "Admins", value: users.filter((u) => u.role === "admin").length },
    { label: "Moderators", value: users.filter((u) => u.role === "moderator").length },
  ],
  [users]
)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users.filter((u) => {
      const matchesQuery =
        !q ||
        [u.username, u.email, u.first_name, u.last_name, u.phone_number ?? ""].some((v) =>
          v.toLowerCase().includes(q)
        )
      const matchesRole = roleFilter === "all" || u.role === roleFilter
      const matchesStatus =
        statusFilter === "all" || (statusFilter === "active" ? u.is_active : !u.is_active)
      return matchesQuery && matchesRole && matchesStatus
    })
  }, [users, query, roleFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * PAGE_SIZE
  const pageRows = filtered.slice(start, start + PAGE_SIZE)
  const router = useRouter();

  const hasFilters = query !== "" || roleFilter !== "all" || statusFilter !== "all"

  function clearFilters() {
    setQuery("")
    setRoleFilter("all")
    setStatusFilter("all")
    setPage(1)
  }

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(u: AdminUser) {
    setEditing(u)
    setFormOpen(true)
  }

  function handleSaved(saved: AdminUser, mode: "create" | "edit") {
    setUsers((prev) =>
      mode === "create"
        ? [saved, ...prev]
        : prev.map((u) => (u.id === saved.id ? { ...u, ...saved } : u))
    )
  }

  async function toggleActive(u: AdminUser) {
    setBusyId(u.id)
    try {
      const updated = await api.adminUpdateUser(u.id, { is_active: !u.is_active })
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, ...updated } : x)))
      toast.success(updated.is_active ? "User activated" : "User deactivated", {
        description: `${fullName(u)} (@${u.username})`,
      })
    } catch (e) {
      toast.error("Update failed", {
        description: e instanceof Error ? e.message : "Please try again.",
      })
    } finally {
      setBusyId(null)
    }
  }

  async function confirmDelete() {
    const target = deleting
    if (!target) return
    setBusyId(target.id)
    try {
      await api.adminDeleteUser(target.id)
      setUsers((prev) => prev.filter((x) => x.id !== target.id))
      toast.success("User deleted", { description: `@${target.username} was removed.` })
    } catch (e) {
      toast.error("Delete failed", {
        description: e instanceof Error ? e.message : "Please try again.",
      })
    } finally {
      setBusyId(null)
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage accounts, roles and access across Velqor.
          </p>
        </div>
        {tab === "users" && (
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Add user
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-border">
        {(["users", "roles", "permissions"] as TabKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 pb-3 text-sm font-medium capitalize transition-colors ${
              tab === key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {key}
          </button>
        ))}
      </div>

           {tab !== "users" ? (
        <AccessControl
  view={tab}
  onViewChange={setTab}
  roles={roles}
  setRoles={setRoles}
  counts={{
  admin: users.filter((u) => u.role === "admin").length,
  moderator: users.filter((u) => u.role === "moderator").length,
  player: users.filter((u) => u.role === "player").length,
}}
/>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className={`${card} p-4`}>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-2xl font-semibold">
                  {loading && users.length === 0 ? "–" : s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(1)
                }}
                placeholder="Search name, email, username, phone..."
                className="h-9 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value)
                setPage(1)
              }}
              className={selectClass}
              aria-label="Filter by role"
            >
              <option value="all">All roles</option>
              {roles.map((r) => (
  <option key={r.id} value={r.id}>
    {r.name}
  </option>
))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className={selectClass}
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <Button
              variant="outline"
              size="icon"
              onClick={load}
              disabled={loading}
              aria-label="Refresh"
              className="ml-auto"
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {/* Table */}
          <div className={`${card} overflow-hidden`}>
            {error && users.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-16 text-center">
                <div className="grid size-12 place-items-center rounded-full bg-destructive/15 text-destructive">
                  <AlertCircle className="size-6" />
                </div>
                <h2 className="mt-4 text-lg font-semibold">Couldn&apos;t load users</h2>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">{error}</p>
                <Button variant="outline" className="mt-4" onClick={load}>
                  Try again
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
                      <th className="px-4 py-3 font-medium">User</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="hidden px-4 py-3 font-medium md:table-cell">Email</th>
                      <th className="hidden px-4 py-3 font-medium md:table-cell">Joined</th>
                      <th className="hidden px-4 py-3 font-medium lg:table-cell">Last login</th>
                      <th className="w-12 px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {loading && users.length === 0 &&
                      Array.from({ length: 6 }).map((_, i) => (
                        <tr key={i} className="border-b border-border last:border-0">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="size-9 animate-pulse rounded-full bg-muted" />
                              <div className="space-y-2">
                                <div className="h-3 w-28 animate-pulse rounded bg-muted" />
                                <div className="h-3 w-40 animate-pulse rounded bg-muted" />
                              </div>
                            </div>
                          </td>
                          {Array.from({ length: 6 }).map((__, j) => (
                            <td key={j} className="px-4 py-3">
                              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                            </td>
                          ))}
                        </tr>
                      ))}

                    {pageRows.map((u) => {
                      const isSelf = u.id === me?.id
                      return (
                        <tr
                          key={u.id}
                          className={`border-b border-border last:border-0 hover:bg-accent/40 ${
                            busyId === u.id ? "opacity-60" : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="grid size-9 shrink-0 place-items-center rounded-full bg-linear-to-br from-primary to-purple-600 text-xs font-semibold text-white">
                                {initials(u)}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-medium">
                                  {fullName(u)}
                                  {isSelf && (
                                    <span className="ml-2 rounded bg-accent px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                      You
                                    </span>
                                  )}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">@{u.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                                roleClass[u.role] ?? "bg-muted text-muted-foreground"
                              }`}
                            >
                              {u.is_superuser && <ShieldCheck className="size-3" />}
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                                u.is_active
                                  ? "bg-success/15 text-success"
                                  : "bg-destructive/15 text-destructive"
                              }`}
                            >
                              <span
                                className={`size-1.5 rounded-full ${
                                  u.is_active ? "bg-success" : "bg-destructive"
                                }`}
                              />
                              {u.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="hidden px-4 py-3 md:table-cell">
                            <div className="flex items-center gap-1.5">
                              <span className="max-w-[180px] truncate text-muted-foreground">
                                {u.email}
                              </span>
                              {u.is_email_verified ? (
                                <BadgeCheck className="size-4 shrink-0 text-success" aria-label="Verified" />
                              ) : (
                                <span className="shrink-0 rounded-full bg-warning/15 px-1.5 py-0.5 text-[10px] font-medium text-warning">
                                  Unverified
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                            {formatDate(u.date_joined)}
                          </td>
                          <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                            {timeAgo(u.last_login)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label="Row actions">
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
  <DropdownMenuItem
    onClick={() => router.push(`/admin/users/${u.id}`)}
  >
    <User className="size-4" />
    View Details
  </DropdownMenuItem>

  {/* <DropdownMenuItem onClick={() => openEdit(u)}>
    <Pencil className="size-4" />
    Edit details
  </DropdownMenuItem> */}

  <DropdownMenuItem disabled={isSelf} onClick={() => toggleActive(u)}>
    {u.is_active ? (
      <UserX className="size-4" />
    ) : (
      <UserCheck className="size-4" />
    )}
    {u.is_active ? "Deactivate" : "Activate"}
  </DropdownMenuItem>

  <DropdownMenuSeparator />

  <DropdownMenuItem
    disabled={isSelf}
    onClick={() => setDeleting(u)}
    className="text-destructive focus:text-destructive"
  >
    <Trash2 className="size-4" />
    Delete
  </DropdownMenuItem>
</DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {!loading && filtered.length === 0 && (
                  <div className="flex flex-col items-center px-6 py-14 text-center">
                    <div className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
                      <UsersIcon className="size-6" />
                    </div>
                    <h2 className="mt-4 text-base font-semibold">
                      {hasFilters ? "No users match your filters" : "No users yet"}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {hasFilters
                        ? "Try a different search or clear the filters."
                        : "Add the first user to get started."}
                    </p>
                    {hasFilters ? (
                      <Button variant="outline" className="mt-4" onClick={clearFilters}>
                        Clear filters
                      </Button>
                    ) : (
                      <Button className="mt-4" onClick={openCreate}>
                        <Plus className="size-4" />
                        Add user
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {filtered.length > 0 && (
              <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
                <p>
                  Showing {start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)} of{" "}
                  {filtered.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={safePage === 1}
                    onClick={() => setPage(safePage - 1)}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="min-w-[64px] text-center">
                    {safePage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={safePage === totalPages}
                    onClick={() => setPage(safePage + 1)}
                    aria-label="Next page"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editing}
        onSaved={handleSaved}
      />

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting
                ? `${fullName(deleting)} (@${deleting.username}) will be removed. This can't be undone. If you only want to block access, deactivate the account instead.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}