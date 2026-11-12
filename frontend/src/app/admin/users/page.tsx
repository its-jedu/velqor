import UsersManagement from '@/components/admin/users/users-management'

export const metadata = {
  title: 'Users | Velqor Admin',
  description: 'Manage player and admin accounts',
}

export default function AdminUsersPage() {
  return <UsersManagement />
}