import TransactionsManagement from "@/components/admin/transactions/transactions-management"

export const metadata = {
  title: "Transactions | Velqor Admin",
  description: "Monitor deposits, withdrawals, entry fees and prize payouts",
}

export default function AdminTransactionsPage() {
  return <TransactionsManagement />
}