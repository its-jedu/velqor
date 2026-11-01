import { Suspense } from 'react'
import Dashboard from '@/components/dashboard'

export const metadata = {
  title: 'Dashboard | Velqor',
  description: 'View your gaming stats and tournament progress',
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    }>
      <Dashboard />
    </Suspense>
  )
}