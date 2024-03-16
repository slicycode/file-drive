'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Doc, Id } from '../../../convex/_generated/dataModel'
import { formatRelative } from 'date-fns'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { FileCardAction } from '../file-card'

function UserCell({ userId }: { userId: Id<'users'> }) {
  const user = useQuery(api.users.getUserProfile, {
    userId,
  })

  return (
    <div className="flex items-center gap-2">
      <Avatar className="w-6 h-6">
        <AvatarImage src={user?.avatar} />
        <AvatarFallback>{user?.name}</AvatarFallback>
      </Avatar>
      {user?.name}
    </div>
  )
}

export type Payment = {
  id: string
  amount: number
  status: 'pending' | 'processing' | 'success' | 'failed'
  email: string
}

export const columns: ColumnDef<Doc<'files'> & { isFavorited?: boolean }>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    header: 'Uploaded By',
    cell: ({ row }) => {
      return <UserCell userId={row.original.userId} />
    },
  },
  {
    header: 'Uploaded On',
    cell: ({ row }) => {
      return (
        <div>
          {formatRelative(new Date(row.original._creationTime), new Date())}
        </div>
      )
    },
  },
  {
    header: 'Action',
    cell: ({ row }) => {
      return (
        <FileCardAction
          file={row.original}
          isFavorited={row.original.isFavorited}
        />
      )
    },
  },
]
