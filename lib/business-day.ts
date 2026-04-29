/**
 * Business day = a logical operating day for a restaurant that may stay open
 * past midnight. Boundaries are at RESET_HOUR (default 5 AM) instead of 00:00.
 *
 * Examples (RESET_HOUR = 5):
 *   - now = 2026-04-28 23:30 → business day starts 2026-04-28 05:00, ends 2026-04-29 05:00
 *   - now = 2026-04-29 02:00 → business day still 2026-04-28 (we're in the late-night tail)
 *   - now = 2026-04-29 06:00 → business day flips to 2026-04-29
 *
 * Source of truth (priority high → low):
 *   1. localStorage cache (set by initBusinessDaySettings on app mount)
 *   2. NEXT_PUBLIC_BUSINESS_DAY_RESET_HOUR env var
 *   3. Default 5
 *
 * Live edit flow: admin updates restaurant_settings → page reload → cache refreshed.
 */

// The project's generated Supabase types don't match the default SupabaseClient
// generic signature, so accept any client at this boundary.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseLike = any

const DEFAULT_RESET_HOUR = 5
const CACHE_KEY = 'business-day-reset-hour'

function readCache(): number | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw == null) return null
    const n = Number(raw)
    return Number.isFinite(n) && n >= 0 && n < 24 ? n : null
  } catch {
    return null
  }
}

function writeCache(hour: number): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CACHE_KEY, String(hour))
  } catch {
    // ignore
  }
}

export function getResetHour(): number {
  const cached = readCache()
  if (cached != null) return cached
  const env = process.env.NEXT_PUBLIC_BUSINESS_DAY_RESET_HOUR
  const parsed = env ? Number(env) : NaN
  if (Number.isFinite(parsed) && parsed >= 0 && parsed < 24) return parsed
  return DEFAULT_RESET_HOUR
}

/**
 * Fetch reset_hour from DB and update the cache. Call once on app mount
 * (cashier, admin, order-interface). Safe to call multiple times.
 */
export async function initBusinessDaySettings(
  supabase: SupabaseLike,
): Promise<number> {
  try {
    const { data } = await supabase
      .from('restaurant_settings')
      .select('business_day_reset_hour')
      .eq('id', 1)
      .maybeSingle()
    const raw = (data as { business_day_reset_hour?: number } | null)
      ?.business_day_reset_hour
    if (typeof raw === 'number' && raw >= 0 && raw < 24) {
      writeCache(raw)
      return raw
    }
  } catch (err) {
    console.error('Failed to load business-day settings:', err)
  }
  return getResetHour()
}

/**
 * Update reset_hour in DB. After success, page should reload to pick up the
 * new value app-wide. Call from admin UI.
 */
export async function setResetHour(
  supabase: SupabaseLike,
  hour: number,
): Promise<void> {
  if (!Number.isFinite(hour) || hour < 0 || hour >= 24) {
    throw new Error('Reset hour must be 0–23')
  }
  const { error } = await supabase
    .from('restaurant_settings')
    .upsert(
      { id: 1, business_day_reset_hour: hour, updated_at: new Date().toISOString() },
      { onConflict: 'id' },
    )
  if (error) throw error
  writeCache(hour)
}

/**
 * Returns the [from, to) business-day range that `now` falls into.
 * `from` is inclusive, `to` is exclusive (= start of next business day).
 */
export function getBusinessDayRange(now: Date = new Date()): {
  from: Date
  to: Date
} {
  const resetHour = getResetHour()
  const from = new Date(now)
  from.setHours(resetHour, 0, 0, 0)
  if (now.getHours() < resetHour) {
    from.setDate(from.getDate() - 1)
  }
  const to = new Date(from)
  to.setDate(to.getDate() + 1)
  return { from, to }
}

export function getBusinessDayRangeAgo(daysAgo: number): {
  from: Date
  to: Date
} {
  const today = getBusinessDayRange()
  const from = new Date(today.from)
  from.setDate(from.getDate() - daysAgo)
  const to = new Date(from)
  to.setDate(to.getDate() + 1)
  return { from, to }
}

export function formatBusinessDayLabel(now: Date = new Date()): string {
  const { from } = getBusinessDayRange(now)
  return `${String(from.getDate()).padStart(2, '0')}/${String(from.getMonth() + 1).padStart(2, '0')}`
}
