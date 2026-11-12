export type RoleId = "admin" | "moderator" | "player"
export type Scope = "player" | "admin"

export interface Permission {
  code: string
  name: string
  description: string
  scope: Scope
}

export interface Role {
  id: RoleId
  name: string
  description: string
  permissions: string[] // permission codes
}

export const SCOPES: { key: Scope; title: string; hint: string }[] = [
  { key: "player", title: "Player actions", hint: "What a player can do in the app" },
  { key: "admin", title: "Admin actions", hint: "What an admin/moderator can do in the console" },
]

export const PERMISSIONS: Permission[] = [
  // Player permissions
  { code: "tournaments.join", name: "Join tournaments", description: "Enter tournaments and pay the entry fee", scope: "player" },
  { code: "wallet.deposit", name: "Deposit money", description: "Add money to their wallet", scope: "player" },
  { code: "wallet.withdraw", name: "Withdraw winnings", description: "Request a withdrawal to their bank", scope: "player" },
  { code: "chat.use", name: "Use chat", description: "Send messages to other players", scope: "player" },

  // Admin / Moderator permissions
  { code: "users.manage", name: "Manage users", description: "View, edit, deactivate and delete accounts", scope: "admin" },
  { code: "tournaments.manage", name: "Manage tournaments", description: "Create tournaments and confirm results", scope: "admin" },
  { code: "transactions.manage", name: "Manage transactions", description: "Review deposits and approve withdrawals", scope: "admin" },
  { code: "settings.manage", name: "Manage settings", description: "Change fees and platform settings", scope: "admin" },
]

export const INITIAL_ROLES: Role[] = [
  {
    id: "admin",
    name: "Admin",
    description: "Full control of the platform. Has every permission.",
    permissions: PERMISSIONS.map((p) => p.code),
  },
  {
    id: "moderator",
    name: "Moderator",
    description: "Helps manage the platform. Currently has the same access as Admin (mock).",
    // Same permissions as Admin for now
    permissions: PERMISSIONS.map((p) => p.code),
  },
  {
    id: "player",
    name: "Player",
    description: "Competes in tournaments and manages their own wallet.",
    permissions: PERMISSIONS.filter((p) => p.scope === "player").map((p) => p.code),
  },
]