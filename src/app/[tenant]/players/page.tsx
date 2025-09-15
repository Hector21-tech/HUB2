import { MainNav } from '@/components/main-nav'
import { UserNav } from '@/components/user-nav'
import { PlayersPage } from '@/modules/players/components/PlayersPage'

interface PlayersPageProps {
  params: {
    tenant: string
  }
}

export default function Players({ params }: PlayersPageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-gradient-to-r from-[#020617]/60 via-[#0c1532]/50 via-[#1e3a8a]/40 to-[#0f1b3e]/60 border-b border-[#3B82F6]/40 backdrop-blur-xl">
        <div className="flex h-16 items-center px-4">
          <MainNav tenant={params.tenant} />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </div>

      <PlayersPage tenantId={params.tenant} />
    </div>
  )
}

export const metadata = {
  title: 'Players | Scout Hub 2',
  description: 'Manage and view your scouted players',
}