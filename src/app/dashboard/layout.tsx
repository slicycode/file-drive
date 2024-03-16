import { Sidebar } from '@/components/side-bar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Dashboard for the file management system',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="container mx-auto pt-12">
      <div className="flex gap-8">
        <Sidebar />

        <div className="w-full">{children}</div>
      </div>
    </main>
  )
}
