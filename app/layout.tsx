import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Toaster } from '@/components/ui/sonner'
import { LanguageProvider } from '@/lib/i18n/language-context'
import { createClient } from '@supabase/supabase-js'
import './globals.css'

const geist = Geist({ subsets: ["latin", "latin-ext"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin", "latin-ext"], variable: "--font-geist-mono" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://restaurant-hoi-an.vercel.app'

async function getLogoUrl(): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) return null
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data } = await supabase
      .from('restaurant_settings')
      .select('logo_url')
      .eq('id', 1)
      .maybeSingle()
    return (data as { logo_url?: string | null } | null)?.logo_url ?? null
  } catch {
    return null
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const logoUrl = await getLogoUrl()
  const ogImage = logoUrl || `${siteUrl}/api/favicon`

  return {
    title: {
      default: 'Restaurant Hội An - Đặt Món Online',
      template: '%s | Restaurant Hội An',
    },
    description: 'Hệ thống đặt món trực tuyến qua mã QR. Xem menu, đặt món nhanh chóng tại bàn. QR code ordering system for restaurants.',
    keywords: ['nhà hàng', 'đặt món', 'QR code', 'menu online', 'restaurant', 'order', 'Hội An'],
    authors: [{ name: 'Restaurant Hội An' }],
    metadataBase: new URL(siteUrl),
    openGraph: {
      title: 'Restaurant Hội An - Đặt Món Online',
      description: 'Hệ thống đặt món trực tuyến qua mã QR. Xem menu, đặt món nhanh chóng tại bàn.',
      type: 'website',
      locale: 'vi_VN',
      alternateLocale: 'en_US',
      siteName: 'Restaurant Hội An',
      images: [
        {
          url: ogImage,
          width: 512,
          height: 512,
          alt: 'Restaurant Logo',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Restaurant Hội An - Đặt Món Online',
      description: 'Hệ thống đặt món trực tuyến qua mã QR.',
      images: [{ url: ogImage, alt: 'Restaurant Logo' }],
    },
    icons: {
      icon: [{ url: '/api/favicon', type: 'image/png' }],
      apple: '/api/favicon',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
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
