import { PlayersPage } from '@/modules/players/components/PlayersPage'

interface PlayersPageProps {
  params: {
    tenant: string
  }
}

export default function Players({ params }: PlayersPageProps) {
  return <PlayersPage tenantId={params.tenant} />
}

export const metadata = {
  title: 'Players | Scout Hub 2',
  description: 'Manage and view your scouted players',
}