'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

const PASSWORDS: Record<string, string> = {
  admin: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123',
  cashier: process.env.NEXT_PUBLIC_CASHIER_PASSWORD || 'cashier123',
}

const SESSION_KEY_PREFIX = 'auth_'
const SESSION_DURATION = 8 * 60 * 60 * 1000 // 8 hours

interface PasswordGateProps {
  role: 'admin' | 'cashier'
  title: string
  children: React.ReactNode
}

export function PasswordGate({ role, title, children }: PasswordGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const stored = sessionStorage.getItem(`${SESSION_KEY_PREFIX}${role}`)
    if (stored) {
      try {
        const { expiresAt } = JSON.parse(stored)
        if (Date.now() < expiresAt) {
          setIsAuthenticated(true)
        } else {
          sessionStorage.removeItem(`${SESSION_KEY_PREFIX}${role}`)
        }
      } catch {
        sessionStorage.removeItem(`${SESSION_KEY_PREFIX}${role}`)
      }
    }
    setIsChecking(false)
  }, [role])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    if (password === PASSWORDS[role]) {
      sessionStorage.setItem(
        `${SESSION_KEY_PREFIX}${role}`,
        JSON.stringify({ expiresAt: Date.now() + SESSION_DURATION })
      )
      setIsAuthenticated(true)
      setPassword('')
    } else {
      toast.error('Sai mật khẩu / Incorrect password')
      setPassword('')
    }
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Nhập mật khẩu để truy cập / Enter password to access
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mật khẩu / Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button type="submit" className="w-full" disabled={!password.trim()}>
              <Lock className="w-4 h-4 mr-2" />
              Đăng nhập / Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
