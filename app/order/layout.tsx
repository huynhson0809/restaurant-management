'use client'

import { useEffect } from 'react'

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    document.documentElement.classList.add('dark')
    return () => {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return <>{children}</>
}
