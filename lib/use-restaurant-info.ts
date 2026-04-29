'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  getLogoUrl,
  getRestaurantName,
  initRestaurantSettings,
  subscribeRestaurantSettings,
} from '@/lib/restaurant-settings'

/**
 * Returns the restaurant's display name and logo URL with live updates.
 * - Initial value comes from localStorage (instant, no flash)
 * - Refreshed from DB on mount
 * - Realtime subscription updates state when admin edits
 */
export function useRestaurantInfo(): { name: string; logoUrl: string | null } {
  const [name, setName] = useState<string>(() => getRestaurantName())
  const [logoUrl, setLogoUrl] = useState<string | null>(() => getLogoUrl())

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
    })
    const unsubscribe = subscribeRestaurantSettings(supabase, (next) => {
      setName(next.name)
      setLogoUrl(next.logoUrl)
    })
    return unsubscribe
  }, [])

  return { name, logoUrl }
}
