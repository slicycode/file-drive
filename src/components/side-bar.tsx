'use client'

import { FileIcon, StarIcon, Trash } from 'lucide-react'
import Link from 'next/link'
import { Button } from './ui/button'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-44 hidden sm:flex flex-col gap-4">
      <Link href="/dashboard/files">
        <Button
          variant="link"
          className={clsx('flex items-center gap-2', {
            'text-blue-500': pathname.includes('/dashboard/files'),
          })}
        >
          <FileIcon /> All files
        </Button>
      </Link>
      <Link href="/dashboard/favorites">
        <Button
          variant="link"
          className={clsx('flex items-center gap-2', {
            'text-yellow-500': pathname.includes('/dashboard/favorites'),
          })}
        >
          <StarIcon /> Favorites
        </Button>
      </Link>
      <Link href="/dashboard/trash">
        <Button
          variant="link"
          className={clsx('flex items-center gap-2', {
            'text-red-500': pathname.includes('/dashboard/trash'),
          })}
        >
          <Trash /> Deleted files
        </Button>
      </Link>
    </div>
  )
}
