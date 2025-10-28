import Link from 'next/link'
import { redirect } from 'next/navigation'

const API_BASE = process.env.API_BASE_URL || 'http://localhost:4000'

async function fetchSessions({ cursor, limit, order }: { cursor?: string; limit: number; order: 'asc'|'desc' }) {
  try {
    const qs = new URLSearchParams()
    qs.set('limit', String(Math.min(Math.max(limit, 1), 100)))
    if (cursor) qs.set('cursor', cursor)
    qs.set('order', order)
    const res = await fetch(`${API_BASE}/admin/sessions?${qs.toString()}`, { cache: 'no-store' })
    if (!res.ok) return { items: [] as any[] }
    const json = await res.json()
    const items = Array.isArray(json?.data?.items) ? json.data.items : []
    const nextCursor = json?.data?.nextCursor ?? null
    const prevCursor = json?.data?.prevCursor ?? null
    return { items, nextCursor, prevCursor }
  } catch {
    return { items: [] as any[] , nextCursor: null as string | null, prevCursor: null as string | null }
  }
}

function fmtTime(dt?: string | Date | null): string {
  if (!dt) return ''
  const d = new Date(String(dt))
  if (isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  }).format(d)
}

function fmtRange(s0?: string, e0?: string): string {
  const s = new Date(String(s0 ?? ''))
  const e = new Date(String(e0 ?? ''))
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return ''
  const sameDay = s.getFullYear()===e.getFullYear() && s.getMonth()===e.getMonth() && s.getDate()===e.getDate()
  const dtf = new Intl.DateTimeFormat('ja-JP', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hour12:false })
  const tf = new Intl.DateTimeFormat('ja-JP', { hour:'2-digit', minute:'2-digit', hour12:false })
  return sameDay ? `${dtf.format(s)}〜${tf.format(e)}` : `${dtf.format(s)}〜${dtf.format(e)}`
}

// status removed

async function syncSession(formData: FormData) {
  'use server'
  const id = String(formData.get('id') || '')
  if (!id) return
  try {
    const res = await fetch(`${API_BASE}/admin/sessions/${encodeURIComponent(id)}/sync`, {
      method: 'POST',
      cache: 'no-store'
    })
    if (!res.ok) {
      let msg = '同期に失敗しました。設定を確認してください。'
      try {
        const j = await res.json()
        msg = String(j?.error?.message ?? msg)
      } catch {}
      redirect(`/admin/sessions?err=${encodeURIComponent(msg)}`)
    }
  } catch {}
  redirect('/admin/sessions?notice=' + encodeURIComponent('同期を受け付けました'))
}

export default async function AdminSessionsPage({ searchParams }: { searchParams?: { order?: 'asc'|'desc'; cursor?: string; limit?: string; notice?: string; err?: string } }) {
  const order = (searchParams?.order === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc'
  const cursor = searchParams?.cursor
  const limit = Math.min(Math.max(Number(searchParams?.limit ?? 20), 1), 100)
  const { items, nextCursor, prevCursor } = await fetchSessions({ cursor, limit, order })
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">お片付けスケジュール（管理）</h2>
        <Link href="/liff/sessions" className="text-sm underline">LIFF一覧へ</Link>
      </div>

      {searchParams?.notice ? (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">{searchParams.notice}</div>
      ) : null}
      {searchParams?.err ? (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{searchParams.err}</div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-ink-3">並び:</span>
          <Link href={`/admin/sessions?order=asc`} className={`underline ${order==='asc'?'font-semibold':''}`}>開始↑</Link>
          <Link href={`/admin/sessions?order=desc`} className={`underline ${order==='desc'?'font-semibold':''}`}>開始↓</Link>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-ink-3">件数:</span>
          <Link href={`/admin/sessions?order=${order}&limit=5`} className={`underline ${limit===5?'font-semibold':''}`}>5</Link>
          <Link href={`/admin/sessions?order=${order}&limit=10`} className={`underline ${limit===10?'font-semibold':''}`}>10</Link>
          <Link href={`/admin/sessions?order=${order}&limit=20`} className={`underline ${limit===20?'font-semibold':''}`}>20</Link>
        </div>
      </div>

      <div className="overflow-auto rounded border">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-3 py-2">タイトル</th>
              <th className="px-3 py-2">時間</th>
              <th className="px-3 py-2">メモ</th>
              <th className="px-3 py-2">同期</th>
              <th className="px-3 py-2">最終同期</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-ink-3">項目がありません</td>
              </tr>
            ) : items.map((it: any) => (
              <tr key={it.id} className="border-t">
                <td className="px-3 py-2">
                  <Link href={`/liff/sessions/${encodeURIComponent(String(it.id))}`} className="underline">
                    {String(it.title ?? 'Untitled')}
                  </Link>
                </td>
                <td className="px-3 py-2">{fmtRange(String(it.startsAt ?? ''), String(it.endsAt ?? ''))}</td>
                <td className="px-3 py-2 max-w-[28rem] truncate" title={String(it.memo ?? '')}>{String(it.memo ?? '')}</td>
                <td className="px-3 py-2">
                  <form action={syncSession}>
                    <input type="hidden" name="id" value={String(it.id)} />
                    <button type="submit" className="rounded border px-2 py-1 text-xs">同期</button>
                  </form>
                </td>
                <td className="px-3 py-2">
                  {it.gcalEventId ? (
                    <span title={String(it.gcalEventId)} className="inline-flex items-center gap-1 text-xs text-green-700">
                      同期済み <span className="text-ink-3">{fmtTime(it.syncedAt)}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-ink-3">未同期</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 text-sm">
        <div className="text-ink-3">表示件数: {limit}</div>
        <div className="flex items-center gap-4">
          {prevCursor ? (
            <Link href={`/admin/sessions?status=${status}&order=${order}&cursor=${encodeURIComponent(prevCursor)}&limit=${limit}&direction=prev`} className="underline">前へ</Link>
          ) : (
            <span className="text-ink-3">先頭</span>
          )}
          {nextCursor ? (
            <Link href={`/admin/sessions?status=${status}&order=${order}&cursor=${encodeURIComponent(nextCursor)}&limit=${limit}`} className="underline">次へ</Link>
          ) : (
            <span className="text-ink-3">最後</span>
          )}
        </div>
      </div>
    </section>
  )
}
