'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  UtensilsCrossed,
  QrCode,
  ClipboardList,
  Settings,
  ScanLine,
  Sparkles,
  HandPlatter,
} from 'lucide-react'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useLanguage } from '@/lib/i18n/language-context'
import { useRestaurantInfo } from '@/lib/use-restaurant-info'

const STAFF_TAP_COUNT = 5
const STAFF_TAP_WINDOW_MS = 3000

export default function HomePage() {
  const { language } = useLanguage()
  const router = useRouter()
  const { name: restaurantName, logoUrl } = useRestaurantInfo()
  const [staffDialogOpen, setStaffDialogOpen] = useState(false)
  const tapsRef = useRef<number[]>([])

  function handleLogoTap() {
    const now = Date.now()
    tapsRef.current = [
      ...tapsRef.current.filter((t) => now - t < STAFF_TAP_WINDOW_MS),
      now,
    ]
    if (tapsRef.current.length >= STAFF_TAP_COUNT) {
      tapsRef.current = []
      setStaffDialogOpen(true)
    }
  }

  const isEn = language === 'en'

  const steps = [
    {
      icon: ScanLine,
      title: isEn ? 'Scan' : 'Quét mã',
      desc: isEn
        ? 'Scan the QR code on your table to open the menu instantly.'
        : 'Quét mã QR trên bàn để mở thực đơn ngay lập tức.',
    },
    {
      icon: UtensilsCrossed,
      title: isEn ? 'Choose' : 'Chọn món',
      desc: isEn
        ? 'Browse dishes, add to cart, leave notes for the kitchen.'
        : 'Xem món, thêm vào giỏ, ghi chú yêu cầu cho bếp.',
    },
    {
      icon: HandPlatter,
      title: isEn ? 'Enjoy' : 'Thưởng thức',
      desc: isEn
        ? 'Track your order in real time and pay when you’re ready.'
        : 'Theo dõi đơn theo thời gian thực, thanh toán khi sẵn sàng.',
    },
  ]

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Decorative gradient blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-40 -right-32 w-96 h-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-[28rem] h-[28rem] rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute -bottom-32 right-1/3 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Top bar */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleLogoTap}
            aria-label="logo"
            className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center cursor-default focus:outline-none ring-1 ring-border"
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={restaurantName}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              <UtensilsCrossed className="w-5 h-5 text-primary" />
            )}
          </button>
          <span className="font-semibold text-sm sm:text-base truncate max-w-[200px] sm:max-w-none">
            {restaurantName}
          </span>
        </div>
        <LanguageSwitcher />
      </header>

      {/* Hero */}
      <section className="relative pt-28 sm:pt-32 pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6 ring-1 ring-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            {isEn ? 'Order at your table' : 'Đặt món ngay tại bàn'}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-5 text-balance">
            {isEn ? 'Welcome to' : 'Chào mừng đến với'}
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {restaurantName}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-10 text-pretty">
            {isEn
              ? 'Skip the wait. Scan, order, and we’ll bring your food right to you.'
              : 'Không cần đợi. Quét mã, đặt món, và chúng tôi sẽ phục vụ tận bàn.'}
          </p>

          {/* QR call-to-action card */}
          <div className="inline-flex flex-col items-center gap-4 px-6 sm:px-10 py-8 rounded-2xl bg-card border shadow-sm max-w-md mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl" />
              <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center ring-1 ring-primary/20">
                <QrCode className="w-12 h-12 text-primary" strokeWidth={1.5} />
              </div>
            </div>
            <div>
              <div className="font-semibold text-foreground mb-1">
                {isEn
                  ? 'Scan the QR code on your table'
                  : 'Quét mã QR trên bàn của quý khách'}
              </div>
              <div className="text-xs text-muted-foreground">
                {isEn
                  ? 'No app, no signup — just your camera.'
                  : 'Không cần cài app, không cần đăng ký — chỉ cần camera.'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 pb-16 sm:pb-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-2xl sm:text-3xl font-bold mb-2 text-balance">
            {isEn ? 'Three simple steps' : 'Ba bước đơn giản'}
          </h2>
          <p className="text-center text-sm sm:text-base text-muted-foreground mb-10 sm:mb-12">
            {isEn
              ? 'From your table to your plate, faster than ever.'
              : 'Từ bàn ăn đến đĩa món, nhanh hơn bao giờ hết.'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {steps.map((step, idx) => {
              const Icon = step.icon
              return (
                <div
                  key={step.title}
                  className="relative group rounded-2xl border bg-card p-6 sm:p-7 hover:shadow-md transition-shadow"
                >
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-sm">
                    {idx + 1}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-1.5">{step.title}</h3>
                  <p className="text-sm text-muted-foreground text-pretty">
                    {step.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div>
            © {new Date().getFullYear()} {restaurantName}.{' '}
            {isEn ? 'All rights reserved.' : 'Mọi quyền được bảo lưu.'}
          </div>
          <div>{isEn ? 'Powered by QR ordering' : 'Đặt món qua mã QR'}</div>
        </div>
      </footer>

      {/* Staff hidden access */}
      <Dialog open={staffDialogOpen} onOpenChange={setStaffDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {isEn ? 'Staff Access' : 'Truy Cập Nhân Viên'}
            </DialogTitle>
            <DialogDescription>
              {isEn
                ? 'Choose your role to continue. You will be asked for a password.'
                : 'Chọn vai trò để tiếp tục. Bạn sẽ được yêu cầu nhập mật khẩu.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 pt-2">
            <Button
              variant="outline"
              className="justify-start h-12"
              onClick={() => router.push('/cashier')}
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              {isEn ? 'Cashier' : 'Thu Ngân'}
            </Button>
            <Button
              variant="outline"
              className="justify-start h-12"
              onClick={() => router.push('/admin')}
            >
              <Settings className="w-4 h-4 mr-2" />
              {isEn ? 'Admin' : 'Quản Lý'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
