import TournamentWizard from "@/components/admin/tournaments/tournament-wizard"

export const metadata = {
  title: "Edit tournament | Velqor Admin",
}

export function generateStaticParams() {
  return [{ id: "0" }]
}

export default async function EditTournamentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <TournamentWizard tournamentId={id} initialStep={0} />
}