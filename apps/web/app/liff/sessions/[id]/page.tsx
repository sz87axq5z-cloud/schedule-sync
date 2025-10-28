import Card from '../../../../components/ui/Card'
import SessionActions from '../Actions.client'
import Link from 'next/link'

const API_BASE = process.env.API_BASE_URL || 'http://localhost:4000'

// status removed

function fmt(dt?: string): string {
  if (!dt) return ''
  const d = new Date(dt)
  if (isNaN(d.getTime())) return String(dt)
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  }).format(d)
}

async function fetchSession(id: string) {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`${API_BASE}/admin/sessions/${encodeURIComponent(id)}`, { cache: 'no-store', signal: controller.signal })
    clearTimeout(timer)
    if (!res.ok) return null
    const json = await res.json()
    return json?.data ?? null
  } catch {
    return null
  }
}

export default async function SessionDetailPage({ params }: { params: { id: string } }) {
  const data = await fetchSession(params.id)

  return (
    <section className="space-y-6">
      <Card className="p-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">セッション詳細</h2>
        <Link href="/liff/sessions" className="text-sm underline">一覧へ</Link>
      </Card>

      {data ? (
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-lg font-medium">{String(data.title ?? 'Untitled')}</div>
          </div>
          <div className="text-sm text-ink-2">
            <div>開始: {fmt(String(data.startsAt ?? ''))}</div>
            <div>終了: {fmt(String(data.endsAt ?? ''))}</div>
            {data.teacher ? <div>担当: {String(data.teacher)}</div> : null}
            {data.memo ? (
              <div className="mt-2 text-sm text-ink-3 whitespace-pre-wrap">{String(data.memo)}</div>
            ) : null}
          </div>
          <div className="pt-2">
            <SessionActions id={String(data.id)} />
          </div>
          <div className="pt-2 text-sm">
            <Link href={`/liff/sessions/${encodeURIComponent(String(data.id))}/edit`} className="underline">編集</Link>
          </div>
        </Card>
      ) : (
        <Card className="p-4"><div className="text-sm text-ink-2">取得できませんでした。</div></Card>
      )}
    </section>
  )
}
