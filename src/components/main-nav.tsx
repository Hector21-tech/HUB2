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
        className="text-xl font-serif font-bold text-[#FFD700] transition-all duration-200 hover:text-[#FFD700]/90 mr-6 drop-shadow-lg"
      >
        Scout Hub
      </Link>
      {routes.map((route) => (
        route.disabled ? (
          <span
            key={route.href}
            className="text-sm font-medium text-[#f1f5f9]/40 cursor-not-allowed"
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
                ? 'text-[#FFD700] font-semibold drop-shadow-sm hover:text-[#FFD700]/90'
                : 'text-[#f1f5f9]/80 hover:text-[#FFD700] hover:drop-shadow-sm'
            )}
          >
            {route.label}
          </Link>
        )
      ))}
    </nav>
  )
}