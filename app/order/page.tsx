'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { OrderInterface } from '@/components/order/order-interface'
import { Spinner } from '@/components/ui/spinner'

function OrderContent() {
  const searchParams = useSearchParams()
  const tableId = searchParams.get('table')
  const token = searchParams.get('token')

  if (!tableId || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Mã QR Không Hợp Lệ
          </h1>
          <p className="text-muted-foreground">
            Vui lòng quét mã QR tại bàn của bạn để đặt món.
          </p>
        </div>
      </div>
    )
  }

  return <OrderInterface tableId={tableId} token={token} />
}

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Spinner className="w-8 h-8" />
        </div>
      }
    >
      <OrderContent />
    </Suspense>
  )
}
