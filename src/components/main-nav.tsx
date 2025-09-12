'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface MainNavProps {
  tenant: string
}

export function MainNav({ tenant }: MainNavProps) {
  const pathname = usePathname()

  const routes: Array<{ href: string; label: string; active: boolean }> = [
    {
      href: `/${tenant}/dashboard`,
      label: 'Dashboard',
      active: pathname === `/${tenant}/dashboard`
    },
    {
      href: `/${tenant}/players`,
      label: 'Players',
      active: pathname?.startsWith(`/${tenant}/players`)
    },
    {
      href: `/${tenant}/requests`,
      label: 'Requests',
      active: pathname?.startsWith(`/${tenant}/requests`)
    },
    {
      href: `/${tenant}/trials`,
      label: 'Trials',
      active: pathname?.startsWith(`/${tenant}/trials`)
    },
    {
      href: `/${tenant}/calendar`,
      label: 'Calendar',
      active: pathname?.startsWith(`/${tenant}/calendar`)
    },
  ]

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link 
        href={`/${tenant}/dashboard`}
        className="text-sm font-medium transition-colors hover:text-primary mr-6"
      >
        Scout Hub
      </Link>
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            route.active
              ? 'text-black dark:text-white'
              : 'text-muted-foreground'
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  )
}