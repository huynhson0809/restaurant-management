/**
 * Restaurant-wide settings (name, logo) that admin can edit from the dashboard.
 * Cached in localStorage so all reads are synchronous and survive reloads.
 * `initRestaurantSettings(supabase)` should be called once on app mount to
 * refresh from the source of truth.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseLike = any

const NAME_KEY = 'restaurant-name'
const LOGO_KEY = 'restaurant-logo-url'
const DEFAULT_NAME = 'Nhà hàng'

function readCache(key: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeCache(key: string, value: string | null): void {
  if (typeof window === 'undefined') return
  try {
    if (value == null || value === '') {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, value)
    }
  } catch {
    // ignore
  }
}

export function getRestaurantName(): string {
  return readCache(NAME_KEY) || DEFAULT_NAME
}

export function getLogoUrl(): string | null {
  return readCache(LOGO_KEY)
}

/**
 * Fetch restaurant settings from DB and update localStorage cache. Call once
 * on mount of any page that displays the name/logo. Idempotent.
 */
export async function initRestaurantSettings(
  supabase: SupabaseLike,
): Promise<{ name: string; logoUrl: string | null }> {
  try {
    const { data } = await supabase
      .from('restaurant_settings')
      .select('restaurant_name, logo_url')
      .eq('id', 1)
      .maybeSingle()
    const row = data as
      | { restaurant_name?: string; logo_url?: string | null }
      | null
    const name = row?.restaurant_name?.trim() || DEFAULT_NAME
    const logoUrl = row?.logo_url ?? null
    writeCache(NAME_KEY, name)
    writeCache(LOGO_KEY, logoUrl)
    return { name, logoUrl }
  } catch (err) {
    console.error('Failed to load restaurant settings:', err)
    return { name: getRestaurantName(), logoUrl: getLogoUrl() }
  }
}

export async function setRestaurantInfo(
  supabase: SupabaseLike,
  patch: { name?: string; logoUrl?: string | null },
): Promise<void> {
  const update: Record<string, unknown> = {
    id: 1,
    updated_at: new Date().toISOString(),
  }
  if (patch.name !== undefined) update.restaurant_name = patch.name
  if (patch.logoUrl !== undefined) update.logo_url = patch.logoUrl
  const { error } = await supabase
    .from('restaurant_settings')
    .upsert(update, { onConflict: 'id' })
  if (error) throw error
  if (patch.name !== undefined) writeCache(NAME_KEY, patch.name || DEFAULT_NAME)
  if (patch.logoUrl !== undefined) writeCache(LOGO_KEY, patch.logoUrl)
}

/**
 * Subscribe to realtime changes on restaurant_settings so name/logo update
 * everywhere live. Returns an unsubscribe function.
 */
export function subscribeRestaurantSettings(
  supabase: SupabaseLike,
  onChange: (next: { name: string; logoUrl: string | null }) => void,
): () => void {
  const channel = supabase
    .channel('restaurant-settings-live')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'restaurant_settings',
        filter: 'id=eq.1',
      },
      (payload: { new: { restaurant_name?: string; logo_url?: string | null } | null }) => {
        const row = payload.new
        if (!row) return
        const name = row.restaurant_name?.trim() || DEFAULT_NAME
        const logoUrl = row.logo_url ?? null
        writeCache(NAME_KEY, name)
        writeCache(LOGO_KEY, logoUrl)
        onChange({ name, logoUrl })
      },
    )
    .subscribe()
  return () => {
    supabase.removeChannel(channel)
  }
}
