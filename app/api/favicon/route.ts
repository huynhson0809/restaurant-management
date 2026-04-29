import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const revalidate = 3600 // Cache for 1 hour

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(new URL('/apple-icon.png', supabaseUrl || 'http://localhost:3000'))
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data } = await supabase
      .from('restaurant_settings')
      .select('logo_url')
      .eq('id', 1)
      .maybeSingle()

    const logoUrl = (data as { logo_url?: string | null } | null)?.logo_url

    if (!logoUrl) {
      // Fallback to default icon
      return new NextResponse(null, {
        status: 302,
        headers: { Location: '/apple-icon.png' },
      })
    }

    // Fetch the logo image and proxy it
    const response = await fetch(logoUrl)
    if (!response.ok) {
      return new NextResponse(null, {
        status: 302,
        headers: { Location: '/apple-icon.png' },
      })
    }

    const contentType = response.headers.get('content-type') || 'image/png'
    const buffer = await response.arrayBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch {
    return new NextResponse(null, {
      status: 302,
      headers: { Location: '/apple-icon.png' },
    })
  }
}
