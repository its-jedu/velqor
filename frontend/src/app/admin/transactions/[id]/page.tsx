import TransactionDetail from "@/components/admin/transactions/transaction-detail"

export const metadata = {
  title: "Transaction Details | Velqor Admin",
  description: "View transaction details",
}

export function generateStaticParams() {
  return [{ id: "0" }]
}

export default function TransactionDetailPage() {
  return <TransactionDetail />
}