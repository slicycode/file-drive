'use client'

import FileBrowser from '@/components/file-browser'

export default function TrashPage() {
  return (
    <div>
      <FileBrowser title="Deleted files" deleteOnly />
    </div>
  )
}
