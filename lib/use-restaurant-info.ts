'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  getHeaderImageUrl,
  getLogoUrl,
  getRestaurantName,
  initRestaurantSettings,
  subscribeRestaurantSettings,
} from '@/lib/restaurant-settings'

/**
 * Returns the restaurant's display name, logo URL, and header image URL with live updates.
 */
export function useRestaurantInfo(): { name: string; logoUrl: string | null; headerImageUrl: string | null } {
  const [name, setName] = useState<string>(() => getRestaurantName())
  const [logoUrl, setLogoUrl] = useState<string | null>(() => getLogoUrl())
  const [headerImageUrl, setHeaderImageUrl] = useState<string | null>(() => getHeaderImageUrl())

  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return
    }
    const supabase = createClient()
    initRestaurantSettings(supabase).then((next) => {
      setName(next.name)
      setLogoUrl(next.logoUrl)
      setHeaderImageUrl(next.headerImageUrl)
    })
    const unsubscribe = subscribeRestaurantSettings(supabase, (next) => {
      setName(next.name)
      setLogoUrl(next.logoUrl)
      setHeaderImageUrl(next.headerImageUrl)
    })
    return unsubscribe
  }, [])

  return { name, logoUrl, headerImageUrl }
}
