export type TransactionType = "deposit" | "withdrawal" | "entry_fee" | "prize" | "refund"
export type TransactionStatus = "pending" | "completed" | "failed" | "rejected"

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