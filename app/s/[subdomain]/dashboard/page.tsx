import { getTenantBySlug } from '@/src/lib/tenant'
import { notFound } from 'next/navigation'

interface DashboardPageProps {
  params: Promise<{ subdomain: string }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { subdomain } = await params
  const tenant = await getTenantBySlug(subdomain)

  if (!tenant) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome to {tenant.name}
        </h1>
        <p className="text-slate-300">
          {tenant.description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Players</h3>
          <p className="text-slate-300 text-sm mb-4">
            Manage your player database
          </p>
          <a
            href={`/s/${subdomain}/dashboard/players`}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            View Players →
          </a>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Scout Requests</h3>
          <p className="text-slate-300 text-sm mb-4">
            Manage incoming scout requests
          </p>
          <div className="inline-block bg-gray-600 text-white font-medium py-2 px-4 rounded-md opacity-50">
            Coming Soon
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Trials</h3>
          <p className="text-slate-300 text-sm mb-4">
            Schedule and manage trials
          </p>
          <div className="inline-block bg-gray-600 text-white font-medium py-2 px-4 rounded-md opacity-50">
            Coming Soon
          </div>
        </div>
      </div>
    </div>
  )
}