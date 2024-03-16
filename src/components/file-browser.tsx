'use client'

import { FileCard } from '@/components/file-card'
import { SearchBar } from '@/components/search-bar'
import { UploadButton } from '@/components/upload-button'
import { useOrganization, useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { GridIcon, Loader2, RowsIcon } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { api } from '../../convex/_generated/api'
import { DataTable } from './file-table'
import { columns } from './file-table/columns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Doc } from '../../convex/_generated/dataModel'
import { Label } from './ui/label'

function Placeholder({ title }: { title: string }) {
  const isFavorites = title === 'Favorites'
  const isDeleted = title === 'Deleted files'
  const isAllFiles = title === 'Your Files'

  const text = isFavorites
    ? 'No favorite files found.'
    : isDeleted
    ? 'No deleted files found.'
    : 'No files found. Upload some!'

  return (
    <div className="flex flex-col gap-8 items-center mt-24">
      <Image
        src="/placeholder.svg"
        alt="empty images"
        width="300"
        height="300"
      />
      <span className="text-2xl">{text}</span>
      {isAllFiles ? <UploadButton /> : null}
    </div>
  )
}

export default function FileBrowser({
  title,
  favoritesOnly,
  deleteOnly,
}: {
  title: string
  favoritesOnly?: boolean
  deleteOnly?: boolean
}) {
  const organization = useOrganization()
  const user = useUser()
  const [query, setQuery] = useState('')
  const [type, setType] = useState<Doc<'files'>['type'] | 'all'>('all')

  let orgId: string | undefined = undefined

  if (organization.isLoaded && user.isLoaded)
    orgId = organization.organization?.id ?? user.user?.id

  const favorites = useQuery(
    api.files.getAllFavorites,
    orgId ? { orgId } : 'skip'
  )

  const files = useQuery(
    api.files.getFiles,
    orgId
      ? {
          orgId,
          type: type === 'all' ? undefined : type,
          query,
          favorites: favoritesOnly,
          deleteOnly,
        }
      : 'skip'
  )

  const isLoading = files === undefined

  const modifiedFiles =
    files?.map((file) => {
      const isFavorited = favorites?.some((f) => f.fileId === file._id)
      return { ...file, isFavorited }
    }) ?? []

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">{title}</h1>

        <SearchBar setQuery={setQuery} query={query} />

        <UploadButton />
      </div>

      <Tabs defaultValue="grid" className="mt-4">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <GridIcon /> Grid view
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <RowsIcon /> Table view
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Label htmlFor="type-select">Type</Label>
            <Select
              value={type}
              onValueChange={(newType) => setType(newType as any)}
            >
              <SelectTrigger
                className="w-[105px]"
                defaultValue="all"
                id="type-select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {isLoading ? (
          <div className="flex flex-col gap-8 items-center mt-24 text-gray-500">
            <Loader2 className="h-24 w-24 animate-spin" />
            <span className="text-2xl">Loading your files...</span>
          </div>
        ) : null}

        <TabsContent value="grid">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modifiedFiles?.map((file) => {
              return <FileCard key={file._id} file={file} />
            })}
          </div>
        </TabsContent>
        <TabsContent value="table">
          <DataTable columns={columns} data={modifiedFiles} />
        </TabsContent>
      </Tabs>

      {files && files.length === 0 ? <Placeholder title={title} /> : null}
    </div>
  )
}
