'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface MainNavProps {
  tenant: string
}

export function MainNav({ tenant }: MainNavProps) {
  const pathname = usePathname()

  const routes: Array<{ href: string; label: string; active: boolean; disabled?: boolean }> = [
    {
      href: `/${tenant}/dashboard`,
      label: 'Dashboard',
      active: pathname === `/${tenant}/dashboard`
    },
    {
      href: `/${tenant}/players`,
      label: 'Players',
      active: pathname === `/${tenant}/players`
    },
    {
      href: `/${tenant}/requests`,
      label: 'Requests (Soon)',
      active: false,
      disabled: true
    },
    {
      href: `/${tenant}/trials`,
      label: 'Trials (Soon)',
      active: false,
      disabled: true
    },
    {
      href: `/${tenant}/calendar`,
      label: 'Calendar (Soon)',
      active: false,
      disabled: true
    },
  ]

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link
        href={`/${tenant}/dashboard`}
        className="text-xl font-semibold text-gray-900 transition-all duration-200 hover:text-blue-600 mr-6"
      >
        Scout Hub
      </Link>
      {routes.map((route) => (
        route.disabled ? (
          <span
            key={route.href}
            className="text-sm font-medium text-gray-400 cursor-not-allowed"
          >
            {route.label}
          </span>
        ) : (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              'text-sm font-medium transition-all duration-200',
              route.active
                ? 'text-blue-600 font-semibold'
                : 'text-gray-600 hover:text-blue-600'
            )}
          >
            {route.label}
          </Link>
        )
      ))}
    </nav>
  )
}