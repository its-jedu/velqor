import TournamentsManagement from "@/components/admin/tournaments/tournaments-management"

export const metadata = {
  title: "Tournaments | Velqor Admin",
  description: "Create and manage leagues and cups",
}

export default function AdminTournamentsPage() {
  return <TournamentsManagement />
}