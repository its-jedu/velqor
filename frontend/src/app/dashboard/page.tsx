import { Suspense } from 'react'
import Dashboard from '@/components/dashboard/dashboard'

export const metadata = {
  title: 'Dashboard | Velqor',
  description: 'View your gaming stats and tournament progress',
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>
      }
    >
      <Dashboard />
    </Suspense>
  )
}