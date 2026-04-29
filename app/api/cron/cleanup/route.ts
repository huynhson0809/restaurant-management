import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Use service role key for admin operations (bypasses RLS)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Missing Supabase environment variables' },
      { status: 500 }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const results: Record<string, unknown> = {}

  try {
    // 1. Aggregate yesterday's business day into daily_summary
    const { data: aggData, error: aggError } = await supabase.rpc(
      'aggregate_daily_summary',
      {
        target_date: getYesterdayDate(),
      }
    )
    if (aggError) {
      results.aggregate_error = aggError.message
    } else {
      results.aggregated = true
    }

    // 2. Cleanup old orders (180 day retention)
    const { data: cleanupData, error: cleanupError } = await supabase.rpc(
      'cleanup_old_orders',
      { retention_days: 180 }
    )
    if (cleanupError) {
      results.cleanup_error = cleanupError.message
    } else {
      results.cleanup = cleanupData
    }

    // 3. Delete orphaned table_carts
    // Get valid session tokens first
    const { data: validTokens } = await supabase
      .from('tables')
      .select('session_token')

    const validSet = new Set(
      (validTokens ?? []).map((t: { session_token: string }) => t.session_token)
    )

    // Get all cart tokens
    const { data: allCarts } = await supabase
      .from('table_carts')
      .select('session_token, updated_at')

    let orphanedDeleted = 0
    if (allCarts) {
      const orphanTokens = allCarts
        .filter((c: { session_token: string; updated_at: string }) => {
          // Delete if session_token is not valid OR cart is older than 24h
          const isOrphan = !validSet.has(c.session_token)
          const isStale =
            new Date(c.updated_at).getTime() < Date.now() - 24 * 60 * 60 * 1000 &&
            !validSet.has(c.session_token)
          return isOrphan || isStale
        })
        .map((c: { session_token: string }) => c.session_token)

      if (orphanTokens.length > 0) {
        const { count } = await supabase
          .from('table_carts')
          .delete({ count: 'exact' })
          .in('session_token', orphanTokens)
        orphanedDeleted = count ?? 0
      }
    }
    results.orphaned_carts_deleted = orphanedDeleted

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      ...results,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Cleanup failed', details: String(error) },
      { status: 500 }
    )
  }
}

function getYesterdayDate(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}
