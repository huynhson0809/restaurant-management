import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Toaster } from '@/components/ui/sonner'
import { LanguageProvider } from '@/lib/i18n/language-context'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: 'Restaurant Hội An - Đặt Món Online',
    template: '%s | Restaurant Hội An',
  },
  description: 'Hệ thống đặt món trực tuyến qua mã QR. Xem menu, đặt món nhanh chóng tại bàn. QR code ordering system for restaurants.',
  keywords: ['nhà hàng', 'đặt món', 'QR code', 'menu online', 'restaurant', 'order', 'Hội An'],
  authors: [{ name: 'Restaurant Hội An' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://restaurant-hoi-an.vercel.app'),
  openGraph: {
    title: 'Restaurant Hội An - Đặt Món Online',
    description: 'Hệ thống đặt món trực tuyến qua mã QR. Xem menu, đặt món nhanh chóng tại bàn.',
    type: 'website',
    locale: 'vi_VN',
    alternateLocale: 'en_US',
    siteName: 'Restaurant Hội An',
    images: [
      {
        url: '/api/favicon',
        width: 512,
        height: 512,
        alt: 'Restaurant Hội An Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Restaurant Hội An - Đặt Món Online',
    description: 'Hệ thống đặt món trực tuyến qua mã QR.',
    images: ['/api/favicon'],
  },
  icons: {
    icon: [
      { url: '/api/favicon', type: 'image/png' },
    ],
    apple: '/api/favicon',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body className="font-sans antialiased">
        <LanguageProvider>
          {children}
          <Toaster richColors position="top-center" />
        </LanguageProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
        {process.env.NODE_ENV === 'production' && <SpeedInsights />}
      </body>
    </html>
  )
}
