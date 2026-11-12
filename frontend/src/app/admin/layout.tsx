import { AdminSidebarWrapper } from '@/components/admin/admin-sidebar-wrapper'

export const metadata = {
  title: 'Admin Dashboard | Velqor',
  description: 'Manage users, tournaments, and platform settings',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminSidebarWrapper>{children}</AdminSidebarWrapper>
}