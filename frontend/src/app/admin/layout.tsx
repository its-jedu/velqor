import { AdminSidebarWrapper } from '@/components/admin/admin-sidebar-wrapper'

export const metadata = {
  title: 'Admin Dashboard | Velqor',
  description: 'Manage users, tournaments, and platform settings',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-purple-600/10">
      <AdminSidebarWrapper>
        {children}
      </AdminSidebarWrapper>
    </div>
  )
}