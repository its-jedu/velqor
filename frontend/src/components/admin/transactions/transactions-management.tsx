"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  MoreHorizontal,
  Search,
  XCircle,
  Eye,
  Check,
  X,
  RefreshCw,
} from "lucide-react"
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

const PAGE_SIZE = 10
const card = "rounded-xl border border-border bg-card text-card-foreground"
const selectClass =
  "h-9 rounded-lg border border-input bg-card px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"

type TransactionType = "deposit" | "withdrawal" | "entry_fee" | "prize" | "refund"
type TransactionStatus = "pending" | "completed" | "failed" | "rejected"

export interface Transaction {
  id: string
  user: {
    id: string
    username: string
    first_name: string
    last_name: string
  }
  type: TransactionType
  amount: number
  status: TransactionStatus
  reference: string
  method: string
  created_at: string
  note?: string
}

// ====================== MOCK DATA ======================
export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "txn_001",
    user: { id: "u1", username: "GamerKing", first_name: "Chinedu", last_name: "Okafor" },
    type: "withdrawal",
    amount: 85000,
    status: "pending",
    reference: "WD-20261112-001",
    method: "Bank Transfer",
    created_at: "2026-11-12T08:14:00Z",
  },
  {
    id: "txn_002",
    user: { id: "u2", username: "NaijaBaller", first_name: "Aisha", last_name: "Bello" },
    type: "deposit",
    amount: 25000,
    status: "completed",
    reference: "DP-20261112-014",
    method: "Paystack",
    created_at: "2026-11-12T07:42:00Z",
  },
  {
    id: "txn_003",
    user: { id: "u3", username: "ProShooter", first_name: "Tunde", last_name: "Adeyemi" },
    type: "withdrawal",
    amount: 120000,
    status: "pending",
    reference: "WD-20261111-089",
    method: "Bank Transfer",
    created_at: "2026-11-11T21:05:00Z",
  },
  {
    id: "txn_004",
    user: { id: "u4", username: "PoolMaster", first_name: "Blessing", last_name: "Eze" },
    type: "entry_fee",
    amount: 2500,
    status: "completed",
    reference: "EF-20261112-033",
    method: "Wallet",
    created_at: "2026-11-12T09:01:00Z",
  },
  {
    id: "txn_005",
    user: { id: "u5", username: "SniperX", first_name: "Ibrahim", last_name: "Musa" },
    type: "prize",
    amount: 45000,
    status: "completed",
    reference: "PZ-20261111-012",
    method: "Wallet",
    created_at: "2026-11-11T18:30:00Z",
  },
  {
    id: "txn_006",
    user: { id: "u6", username: "QueenOf8", first_name: "Fatima", last_name: "Yusuf" },
    type: "withdrawal",
    amount: 67000,
    status: "pending",
    reference: "WD-20261112-007",
    method: "Bank Transfer",
    created_at: "2026-11-12T06:55:00Z",
  },
  {
    id: "txn_007",
    user: { id: "u7", username: "EfootballGod", first_name: "David", last_name: "Okoro" },
    type: "deposit",
    amount: 10000,
    status: "failed",
    reference: "DP-20261112-009",
    method: "Paystack",
    created_at: "2026-11-12T05:20:00Z",
    note: "Card declined",
  },
  {
    id: "txn_008",
    user: { id: "u1", username: "GamerKing", first_name: "Chinedu", last_name: "Okafor" },
    type: "refund",
    amount: 2500,
    status: "completed",
    reference: "RF-20261110-004",
    method: "Wallet",
    created_at: "2026-11-10T14:12:00Z",
  },
  {
    id: "txn_009",
    user: { id: "u8", username: "LagosLegend", first_name: "Amaka", last_name: "Nwosu" },
    type: "withdrawal",
    amount: 210000,
    status: "rejected",
    reference: "WD-20261109-055",
    method: "Bank Transfer",
    created_at: "2026-11-09T16:40:00Z",
    note: "Suspicious activity",
  },
  {
    id: "txn_010",
    user: { id: "u9", username: "CODWarrior", first_name: "Emeka", last_name: "Okonkwo" },
    type: "deposit",
    amount: 50000,
    status: "completed",
    reference: "DP-20261111-078",
    method: "Flutterwave",
    created_at: "2026-11-11T11:08:00Z",
  },
  {
    id: "txn_011",
    user: { id: "u10", username: "SilentAssassin", first_name: "Zainab", last_name: "Abdullahi" },
    type: "entry_fee",
    amount: 5000,
    status: "completed",
    reference: "EF-20261112-041",
    method: "Wallet",
    created_at: "2026-11-12T10:15:00Z",
  },
  {
    id: "txn_012",
    user: { id: "u3", username: "ProShooter", first_name: "Tunde", last_name: "Adeyemi" },
    type: "prize",
    amount: 150000,
    status: "completed",
    reference: "PZ-20261108-003",
    method: "Wallet",
    created_at: "2026-11-08T20:00:00Z",
  },
]

// ====================== HELPERS ======================
function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function fullName(user: Transaction["user"]) {
  return `${user.first_name} ${user.last_name}`
}

function initials(user: Transaction["user"]) {
  return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
}

const typeConfig: Record<
  TransactionType,
  { label: string; icon: React.ElementType; className: string }
> = {
  deposit: { label: "Deposit", icon: ArrowDownLeft, className: "text-success" },
  withdrawal: { label: "Withdrawal", icon: ArrowUpRight, className: "text-warning" },
  entry_fee: { label: "Entry Fee", icon: Banknote, className: "text-primary" },
  prize: { label: "Prize", icon: CheckCircle2, className: "text-success" },
  refund: { label: "Refund", icon: RefreshCw, className: "text-muted-foreground" },
}

const statusConfig: Record<
  TransactionStatus,
  { label: string; className: string }
> = {
  pending: { label: "Pending", className: "bg-warning/15 text-warning" },
  completed: { label: "Completed", className: "bg-success/15 text-success" },
  failed: { label: "Failed", className: "bg-destructive/15 text-destructive" },
  rejected: { label: "Rejected", className: "bg-destructive/15 text-destructive" },
}

// ====================== COMPONENT ======================
export default function TransactionsPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS)
  const [query, setQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [page, setPage] = useState(1)

  const [actionTarget, setActionTarget] = useState<{
    txn: Transaction
    action: "approve" | "reject"
  } | null>(null)

  const stats = useMemo(() => {
    const pending = transactions.filter((t) => t.status === "pending" && t.type === "withdrawal")
    const completedToday = transactions.filter(
      (t) =>
        t.status === "completed" &&
        new Date(t.created_at).toDateString() === new Date().toDateString()
    )
    const totalVolume = transactions
      .filter((t) => t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0)

    return [
      {
        label: "Pending withdrawals",
        value: pending.length,
        sub: formatMoney(pending.reduce((s, t) => s + t.amount, 0)),
      },
      {
        label: "Completed today",
        value: completedToday.length,
        sub: formatMoney(completedToday.reduce((s, t) => s + t.amount, 0)),
      },
      {
        label: "Total volume",
        value: formatMoney(totalVolume),
        sub: "All completed transactions",
      },
      {
        label: "Failed / Rejected",
        value: transactions.filter((t) => t.status === "failed" || t.status === "rejected").length,
        sub: "Needs review",
      },
    ]
  }, [transactions])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return transactions.filter((t) => {
      const matchesQuery =
        !q ||
        t.user.username.toLowerCase().includes(q) ||
        fullName(t.user).toLowerCase().includes(q) ||
        t.reference.toLowerCase().includes(q) ||
        t.amount.toString().includes(q)

      const matchesType = typeFilter === "all" || t.type === typeFilter
      const matchesStatus = statusFilter === "all" || t.status === statusFilter

      return matchesQuery && matchesType && matchesStatus
    })
  }, [transactions, query, typeFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * PAGE_SIZE
  const pageRows = filtered.slice(start, start + PAGE_SIZE)

  const hasFilters = query !== "" || typeFilter !== "all" || statusFilter !== "all"

  function clearFilters() {
    setQuery("")
    setTypeFilter("all")
    setStatusFilter("all")
    setPage(1)
  }

  function handleAction(confirm: boolean) {
    if (!actionTarget || !confirm) {
      setActionTarget(null)
      return
    }

    const { txn, action } = actionTarget

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === txn.id
          ? {
              ...t,
              status: action === "approve" ? "completed" : "rejected",
              note: action === "reject" ? "Rejected by admin" : t.note,
            }
          : t
      )
    )

    toast.success(
      action === "approve" ? "Withdrawal approved" : "Withdrawal rejected",
      {
        description: `${formatMoney(txn.amount)} → @${txn.user.username}`,
      }
    )

    setActionTarget(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor deposits, withdrawals, entry fees and prize payouts.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`${card} p-5`}>
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.sub}</p>
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
            placeholder="Search user, reference, amount..."
            className="h-9 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value)
            setPage(1)
          }}
          className={selectClass}
        >
          <option value="all">All types</option>
          <option value="deposit">Deposit</option>
          <option value="withdrawal">Withdrawal</option>
          <option value="entry_fee">Entry Fee</option>
          <option value="prize">Prize</option>
          <option value="refund">Refund</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className={selectClass}
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="rejected">Rejected</option>
        </select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      {/* Table */}
      <div className={`${card} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {pageRows.map((txn) => {
                const TypeIcon = typeConfig[txn.type].icon
                return (
                  <tr
                    key={txn.id}
                    className="border-b border-border last:border-0 hover:bg-accent/40"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-linear-to-br from-primary to-purple-600 text-xs font-semibold text-white">
                          {initials(txn.user)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{fullName(txn.user)}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            @{txn.user.username}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center gap-1.5 ${typeConfig[txn.type].className}`}>
                        <TypeIcon className="size-3.5" />
                        <span className="text-sm font-medium">
                          {typeConfig[txn.type].label}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-medium">{formatMoney(txn.amount)}</td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig[txn.status].className}`}
                      >
                        {txn.status === "pending" && <Clock className="size-3" />}
                        {txn.status === "completed" && <CheckCircle2 className="size-3" />}
                        {(txn.status === "failed" || txn.status === "rejected") && (
                          <XCircle className="size-3" />
                        )}
                        {statusConfig[txn.status].label}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div>
                        <p className="font-mono text-xs">{txn.reference}</p>
                        <p className="text-xs text-muted-foreground">{txn.method}</p>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {formatDate(txn.created_at)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => router.push(`/admin/transactions/${txn.id}`)}
                          >
                            <Eye className="size-4" />
                            View details
                          </DropdownMenuItem>

                          {txn.status === "pending" && txn.type === "withdrawal" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setActionTarget({ txn, action: "approve" })}
                              >
                                <Check className="size-4 text-success" />
                                Approve withdrawal
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setActionTarget({ txn, action: "reject" })}
                                className="text-destructive focus:text-destructive"
                              >
                                <X className="size-4" />
                                Reject withdrawal
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
                <Banknote className="size-6" />
              </div>
              <h2 className="mt-4 text-base font-semibold">
                {hasFilters ? "No transactions match your filters" : "No transactions yet"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {hasFilters
                  ? "Try changing or clearing the filters."
                  : "Transactions will appear here once users start depositing or withdrawing."}
              </p>
              {hasFilters && (
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
            <p>
              Showing {start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={safePage === 1}
                onClick={() => setPage(safePage - 1)}
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
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Approve / Reject Dialog */}
      <AlertDialog open={!!actionTarget} onOpenChange={(open) => !open && setActionTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionTarget?.action === "approve"
                ? "Approve this withdrawal?"
                : "Reject this withdrawal?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionTarget && (
                <>
                  You are about to{" "}
                  <strong>{actionTarget.action === "approve" ? "approve" : "reject"}</strong> a
                  withdrawal of <strong>{formatMoney(actionTarget.txn.amount)}</strong> for{" "}
                  <strong>@{actionTarget.txn.user.username}</strong>.
                  {actionTarget.action === "approve"
                    ? " The money will be sent to their bank account."
                    : " The user will be notified and the amount will remain in their wallet."}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleAction(true)}
              className={
                actionTarget?.action === "reject"
                  ? "bg-destructive text-white hover:bg-destructive/90"
                  : ""
              }
            >
              {actionTarget?.action === "approve" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


