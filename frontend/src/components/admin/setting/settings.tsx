
"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  UserRound,
  ShieldCheck,
  Bell,
  LockKeyhole,
  Eye,
  EyeOff,
  Save,
  Check,
  Info,
} from "lucide-react"

type Tab = "general" | "security" | "notifications"

const tabs = [
  { id: "general" as Tab, label: "General", icon: UserRound },
  { id: "security" as Tab, label: "Security", icon: ShieldCheck },
  { id: "notifications" as Tab, label: "Notifications", icon: Bell },
]

const card =
  "rounded-xl border border-border bg-card text-card-foreground"

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-muted"
      }`}
    >
      <span
        className={`absolute top-1 size-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  )
}

export default function Settings() {
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState<Tab>("general")
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const [notifications, setNotifications] = useState({
    newUsers: true,
    transactions: true,
    withdrawals: true,
    security: true,
    tournaments: false,
  })

  const [passwords, setPasswords] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  })

  const [passwordMessage, setPasswordMessage] = useState("")

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (passwords.newPassword !== passwords.confirm) {
      setPasswordMessage("Your new passwords do not match.")
      return
    }

    if (passwords.newPassword.length < 8) {
      setPasswordMessage("Password must contain at least 8 characters.")
      return
    }

    setPasswordMessage(
      "Password validation successful. Connect your password update API to complete this action."
    )
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your administrator account and platform preferences.
        </p>
      </div>

      {/* Settings navigation */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {tabs.map((tab) => {
          const active = activeTab === tab.id
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* General settings */}
      {activeTab === "general" && (
        <div className="space-y-5">
          <section className={`${card} p-5 sm:p-6`}>
            <div className="mb-6">
              <h2 className="font-semibold">Administrator profile</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Information about your administrator account.
              </p>
            </div>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="grid size-16 shrink-0 place-items-center rounded-full bg-linear-to-br from-primary to-purple-600 text-2xl font-bold text-white">
                {user?.username?.charAt(0).toUpperCase() || "A"}
              </div>

              <div>
                <p className="text-lg font-semibold">
                  {user?.username || "Administrator"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Administrator account
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 border-t border-border pt-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Username
                </label>
                <input
                  value={user?.username || ""}
                  readOnly
                  className="h-11 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Account role
                </label>
                <input
                  value={user?.role || "admin"}
                  readOnly
                  className="h-11 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm capitalize outline-none"
                />
              </div>
            </div>

            <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="size-4 shrink-0" />
              Account information is currently read-only.
            </p>
          </section>

          <section className={`${card} p-5 sm:p-6`}>
            <h2 className="font-semibold">Platform information</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Application details.
            </p>

            <div className="mt-5 divide-y divide-border">
              <div className="flex items-center justify-between py-4">
                <span className="text-sm text-muted-foreground">
                  Platform
                </span>
                <span className="text-sm font-medium">Velqor</span>
              </div>

              <div className="flex items-center justify-between py-4">
                <span className="text-sm text-muted-foreground">
                  Dashboard
                </span>
                <span className="text-sm font-medium">Admin Console</span>
              </div>

              <div className="flex items-center justify-between py-4">
                <span className="text-sm text-muted-foreground">
                  Account status
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
                  <span className="size-2 rounded-full bg-success" />
                  Active
                </span>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Security settings */}
      {activeTab === "security" && (
        <div className="space-y-5">
          <section className={`${card} p-5 sm:p-6`}>
            <div className="mb-6 flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-lg bg-primary/15 text-primary">
                <LockKeyhole className="size-5" />
              </div>
              <div>
                <h2 className="font-semibold">Change password</h2>
                <p className="text-sm text-muted-foreground">
                  Keep your administrator account secure.
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Current password
                </label>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={passwords.current}
                    onChange={(e) =>
                      setPasswords({ ...passwords, current: e.target.value })
                    }
                    placeholder="Enter current password"
                    className="h-11 w-full rounded-lg border border-input bg-background px-3 pr-11 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  New password
                </label>
                <div className="relative">
                  <input
                    required
                    type={showNewPassword ? "text" : "password"}
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Enter new password"
                    className="h-11 w-full rounded-lg border border-input bg-background px-3 pr-11 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-label="Toggle new password visibility"
                  >
                    {showNewPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Use at least 8 characters.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Confirm new password
                </label>
                <input
                  required
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      confirm: e.target.value,
                    })
                  }
                  placeholder="Confirm new password"
                  className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </div>

              {passwordMessage && (
                <p className="text-sm text-warning" role="status">
                  {passwordMessage}
                </p>
              )}

              <button
                type="submit"
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Save className="size-4" />
                Validate password
              </button>
            </form>
          </section>

          <section className={`${card} p-5 sm:p-6`}>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 text-success" />
              <div>
                <h2 className="font-semibold">Account protection</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Always use a strong, unique password. Never share your
                  administrator credentials with anyone.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Notification settings */}
      {activeTab === "notifications" && (
        <section className={`${card} p-5 sm:p-6`}>
          <div className="mb-6">
            <h2 className="font-semibold">Notification preferences</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose which platform activities you want to receive
              notifications about.
            </p>
          </div>

          <div className="divide-y divide-border">
            {[
              {
                key: "newUsers" as const,
                title: "New user registrations",
                description: "Get notified when a new player joins Velqor.",
              },
              {
                key: "transactions" as const,
                title: "Transactions",
                description: "Receive updates about deposits and payments.",
              },
              {
                key: "withdrawals" as const,
                title: "Withdrawal requests",
                description: "Get notified when players request withdrawals.",
              },
              {
                key: "security" as const,
                title: "Security alerts",
                description: "Receive important account and security alerts.",
              },
              {
                key: "tournaments" as const,
                title: "Tournament updates",
                description: "Receive updates about tournament activities.",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-4 py-5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>

                <Toggle
                  checked={notifications[item.key]}
                  onChange={(value) =>
                    setNotifications((prev) => ({
                      ...prev,
                      [item.key]: value,
                    }))
                  }
                />
              </div>
            ))}
          </div>

          <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="size-4 shrink-0" />
            Notification preferences are currently stored in component state.
          </p>
        </section>
      )}
    </div>
  )
}
