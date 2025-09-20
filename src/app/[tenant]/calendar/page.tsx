import { MainNav } from '@/components/main-nav'
import { UserNav } from '@/components/user-nav'
import { CalendarPage } from '@/modules/calendar/components/CalendarPage'

interface CalendarPageProps {
  params: {
    tenant: string
  }
}

export default function Calendar({ params }: CalendarPageProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="flex h-16 items-center px-4">
          <MainNav tenant={params.tenant} />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </div>

      <CalendarPage />
    </div>
  )
}

export const metadata = {
  title: 'Calendar | Scout Hub 2',
  description: 'Manage your scouting events, trials, and schedule',
}