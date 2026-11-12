import TournamentWizard from "@/components/admin/tournaments/tournament-wizard"

export const metadata = {
  title: "Edit tournament | Velqor Admin",
}

export default async function EditTournamentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ step?: string }>
}) {
  const { id } = await params
  const { step } = await searchParams
  const n = Number(step)
  return <TournamentWizard tournamentId={id} initialStep={Number.isInteger(n) ? n : 0} />
}