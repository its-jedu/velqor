import { Suspense } from 'react'
import Admin from '@/components/admin'

export const metadata = {
  title: 'Admin Dashboard | Velqor',
  description: 'Manage users, tournaments, and platform settings',
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    }>
      <Admin />
    </Suspense>
  )
}