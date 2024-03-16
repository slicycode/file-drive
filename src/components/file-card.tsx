import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Protect } from '@clerk/nextjs'
import { useMutation, useQuery } from 'convex/react'
import {
  FileIcon,
  FileTextIcon,
  GanttChartIcon,
  ImageIcon,
  MoreVertical,
  StarIcon,
  TrashIcon,
  UndoIcon,
} from 'lucide-react'
import Image from 'next/image'
import { ReactNode, useState } from 'react'
import { api } from '../../convex/_generated/api'
import { Doc, Id } from '../../convex/_generated/dataModel'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { useToast } from './ui/use-toast'

import { formatRelative } from 'date-fns'

interface FileProps {
  file: Doc<'files'> & { isFavorited?: boolean }
  favorites?: Doc<'favorites'>[]
  isFavorited?: boolean
}

export function FileCardAction({ file, isFavorited }: FileProps) {
  const deleteFile = useMutation(api.files.deleteFile)
  const restoreFile = useMutation(api.files.restoreFile)
  const toggleFavorite = useMutation(api.files.toggleFavorite)
  const me = useQuery(api.users.getMe)

  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const { toast } = useToast()

  async function handleDelete() {
    try {
      await deleteFile({
        fileId: file._id,
      })
      toast({
        variant: 'default',
        title: 'File deleted',
        description: 'Your file has been deleted.',
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error deleting file',
        description: error.message.includes(
          'You must be an admin to delete a file.'
        )
          ? 'You must be an admin to delete a file.'
          : 'An error occurred while deleting the file.',
      })
    }
  }

  return (
    <>
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete()}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <MoreVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => window.open(getFileUrl(file.fileId), '_blank')}
          >
            <FileIcon className="w-4 h-4" /> Download
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => toggleFavorite({ fileId: file._id })}
            className="flex items-center gap-2 cursor-pointer"
          >
            {isFavorited ? (
              <>
                <StarIcon className="w-4 h-4" fill="black" />
                Unfavorite
              </>
            ) : (
              <>
                <StarIcon className="w-4 h-4" />
                Favorite
              </>
            )}
          </DropdownMenuItem>

          <Protect
            condition={(check) => {
              return (
                check({
                  role: 'org:admin',
                }) || file.userId === me?._id
              )
            }}
            fallback={<></>}
          >
            <DropdownMenuSeparator />
            {file.shouldDelete ? (
              <DropdownMenuItem
                onClick={() => restoreFile({ fileId: file._id })}
                className="flex items-center gap-2 text-success cursor-pointer"
              >
                <UndoIcon className="w-4 h-4" />
                Restore
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => setIsConfirmOpen(true)}
                className="flex items-center gap-2 text-destructive cursor-pointer"
              >
                <TrashIcon className="w-4 h-4" />
                Delete
              </DropdownMenuItem>
            )}
          </Protect>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

function getFileUrl(fileId: Id<'_storage'>) {
  return `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${fileId}`
}

export function FileCard({ file }: FileProps) {
  const userProfile = useQuery(api.users.getUserProfile, {
    userId: file.userId,
  })

  const typeIcons = {
    image: <ImageIcon />,
    pdf: <FileTextIcon />,
    csv: <GanttChartIcon />,
  } as Record<Doc<'files'>['type'], ReactNode>

  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle className="flex gap-2 items-center text-base font-normal">
          {typeIcons[file.type]} {file.name}
        </CardTitle>
        <div className="absolute top-2 right-2">
          <FileCardAction isFavorited={file.isFavorited} file={file} />
        </div>
      </CardHeader>
      <CardContent className="h-[200px] flex justify-center items-center">
        {file.type === 'image' ? (
          <Image
            src={getFileUrl(file.fileId)}
            alt={file.name}
            width="150"
            height="100"
          />
        ) : file.type === 'pdf' ? (
          <FileTextIcon className="h-20 w-20" />
        ) : file.type === 'csv' ? (
          <GanttChartIcon className="h-20 w-20" />
        ) : null}
      </CardContent>
      <CardFooter className="flex justify-between items-center text-xs text-gray-700">
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6">
            <AvatarImage src={userProfile?.avatar} />
            <AvatarFallback>{userProfile?.name}</AvatarFallback>
          </Avatar>
          {userProfile?.name}
        </div>
        Uploaded {formatRelative(new Date(file._creationTime), new Date())}
      </CardFooter>
    </Card>
  )
}
