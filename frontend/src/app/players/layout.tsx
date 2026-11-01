import { PlayersLayoutClient } from '@/components/players/players-layout-client'

export const metadata = {
  title: 'Player Dashboard | Velqor',
  description: 'Manage your tournaments, wallet, and profile',
}

export default function PlayersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <PlayersLayoutClient>{children}</PlayersLayoutClient>
}