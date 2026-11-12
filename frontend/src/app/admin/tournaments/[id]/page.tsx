import TournamentDetails from "@/components/admin/tournaments/tournament-details"

export const metadata = {
  title: "Tournament | Velqor Admin",
}

export default async function TournamentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <TournamentDetails tournamentId={id} />
}