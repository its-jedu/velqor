"use client"

import { useParams, useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  Clock,
  XCircle,
  User,
  CreditCard,
  Calendar,
  Hash,
  FileText,
  Check,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { MOCK_TRANSACTIONS, type Transaction } from "./transactions-data"

const card = "rounded-xl border border-border bg-card text-card-foreground"

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const typeConfig = {
  deposit: { label: "Deposit", icon: ArrowDownLeft, color: "text-success" },
  withdrawal: { label: "Withdrawal", icon: ArrowUpRight, color: "text-warning" },
  entry_fee: { label: "Entry Fee", icon: Banknote, color: "text-primary" },
  prize: { label: "Prize", icon: CheckCircle2, color: "text-success" },
  refund: { label: "Refund", icon: ArrowDownLeft, color: "text-muted-foreground" },
}

const statusConfig = {
  pending: { label: "Pending", className: "bg-warning/15 text-warning", icon: Clock },
  completed: { label: "Completed", className: "bg-success/15 text-success", icon: CheckCircle2 },
  failed: { label: "Failed", className: "bg-destructive/15 text-destructive", icon: XCircle },
  rejected: { label: "Rejected", className: "bg-destructive/15 text-destructive", icon: XCircle },
}

export default function TransactionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS)
  const [action, setAction] = useState<"approve" | "reject" | null>(null)

  const transaction = useMemo(
    () => transactions.find((t) => t.id === id),
    [transactions, id]
  )

  if (!transaction) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <h2 className="text-xl font-semibold">Transaction not found</h2>
        <p className="mt-2 text-muted-foreground">
          This transaction does not exist or has been removed.
        </p>
        <Button className="mt-6" onClick={() => router.push("/admin/transactions")}>
          Back to Transactions
        </Button>
      </div>
    )
  }

  const TypeIcon = typeConfig[transaction.type].icon
  const StatusIcon = statusConfig[transaction.status].icon

  function handleAction(confirm: boolean) {
    if (!action || !confirm) {
      setAction(null)
      return
    }

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === transaction!.id
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
        description: `${formatMoney(transaction!.amount)} → @${transaction!.user.username}`,
      }
    )

    setAction(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/admin/transactions")}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Transaction Details</h1>
            <p className="text-sm text-muted-foreground font-mono">{transaction.reference}</p>
          </div>
        </div>

        {transaction.status === "pending" && transaction.type === "withdrawal" && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setAction("reject")}
              className="text-destructive hover:text-destructive"
            >
              <X className="size-4" />
              Reject
            </Button>
            <Button onClick={() => setAction("approve")}>
              <Check className="size-4" />
              Approve
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left - Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Amount Card */}
          <div className={`${card} p-6`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="mt-1 text-3xl font-bold">{formatMoney(transaction.amount)}</p>
              </div>
              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${statusConfig[transaction.status].className}`}
              >
                <StatusIcon className="size-4" />
                {statusConfig[transaction.status].label}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <div className={`mt-1 flex items-center gap-2 ${typeConfig[transaction.type].color}`}>
                  <TypeIcon className="size-4" />
                  <span className="font-medium">{typeConfig[transaction.type].label}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Payment Method</p>
                <p className="mt-1 font-medium">{transaction.method}</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className={`${card} p-6`}>
            <h2 className="font-semibold mb-4">Transaction Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-lg bg-muted">
                  <Hash className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Reference</p>
                  <p className="font-mono text-sm">{transaction.reference}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-lg bg-muted">
                  <Calendar className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date & Time</p>
                  <p className="text-sm">{formatDate(transaction.created_at)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-lg bg-muted">
                  <CreditCard className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Method</p>
                  <p className="text-sm">{transaction.method}</p>
                </div>
              </div>

              {transaction.note && (
                <div className="flex items-start gap-3">
                  <div className="grid size-9 place-items-center rounded-lg bg-muted">
                    <FileText className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Note</p>
                    <p className="text-sm">{transaction.note}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right - User Card */}
        <div className="space-y-6">
          <div className={`${card} p-6`}>
            <h2 className="font-semibold mb-4">User</h2>
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-full bg-linear-to-br from-primary to-purple-600 text-sm font-semibold text-white">
                {transaction.user.first_name[0]}
                {transaction.user.last_name[0]}
              </div>
              <div>
                <p className="font-medium">
                  {transaction.user.first_name} {transaction.user.last_name}
                </p>
                <p className="text-sm text-muted-foreground">@{transaction.user.username}</p>
              </div>
            </div>

            <Button
              variant="outline"
              className="mt-5 w-full"
              onClick={() => router.push(`/admin/users`)}
            >
              <User className="size-4" />
              View User Profile
            </Button>
          </div>

          {/* Timeline / Status History (simple version) */}
          <div className={`${card} p-6`}>
            <h2 className="font-semibold mb-4">Status</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current status</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[transaction.status].className}`}
                >
                  {statusConfig[transaction.status].label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{formatDate(transaction.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!action} onOpenChange={(open) => !open && setAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === "approve" ? "Approve this withdrawal?" : "Reject this withdrawal?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to {action} a withdrawal of{" "}
              <strong>{formatMoney(transaction.amount)}</strong> for{" "}
              <strong>@{transaction.user.username}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleAction(true)}
              className={action === "reject" ? "bg-destructive text-white hover:bg-destructive/90" : ""}
            >
              {action === "approve" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}