import Link from 'next/link'

import { cn } from '@/lib/utils'

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn('flex items-center space-x-4 lg:space-x-6', className)}
      {...props}
    >
      <Link
        href='/subjects'
        className='text-3xl font-bold tracking-tight transition-colors hover:text-primary'
      >
        SubjectsMate
      </Link>
    </nav>
  )
}
