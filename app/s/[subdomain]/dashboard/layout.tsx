import { notFound } from 'next/navigation'
import { getTenantBySlug } from '@/src/lib/tenant'

interface DashboardLayoutProps {
  children: React.ReactNode
  params: Promise<{ subdomain: string }>
}

export default async function DashboardLayout({
  children,
  params
}: DashboardLayoutProps) {
  const { subdomain } = await params
  const tenant = await getTenantBySlug(subdomain)

  if (!tenant) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-white">
                {tenant.name} ⚽
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <a href={`/s/${subdomain}/dashboard`} className="text-slate-300 hover:text-white transition-colors">
                Dashboard
              </a>
              <a href={`/s/${subdomain}/dashboard/players`} className="text-slate-300 hover:text-white transition-colors">
                Players
              </a>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}