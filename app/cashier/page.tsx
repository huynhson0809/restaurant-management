'use client'

import { CashierDashboard } from '@/components/cashier/cashier-dashboard'
import { PasswordGate } from '@/components/auth/password-gate'

export default function CashierPage() {
  return (
    <PasswordGate role="cashier" title="Thu Ngân / Cashier">
      <CashierDashboard />
    </PasswordGate>
  )
}
