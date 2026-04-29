import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { PasswordGate } from '@/components/auth/password-gate'

export default function AdminPage() {
  return (
    <PasswordGate role="admin" title="Quản Trị / Admin">
      <AdminDashboard />
    </PasswordGate>
  )
}
