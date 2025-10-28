import Card from '../../../components/ui/Card'
import Empty from '../../../components/ui/Empty'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

const API_BASE = process.env.API_BASE_URL || 'http://localhost:4000'

async function fetchSessions() {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`${API_BASE}/admin/sessions?limit=100&sort=startsAt&order=asc`, { cache: 'no-store', signal: controller.signal })
    clearTimeout(timer)
    if (!res.ok) return []
    const json = await res.json()
    return Array.isArray(json?.data?.items) ? json.data.items : []
  } catch {
    return []
  }
}

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

export default async function SessionsPage() {
  const session = await getServerSession()
  if (!session) {
    redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent('/liff/sessions')}`)
  }
  const sessions = await fetchSessions()

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <Card className="p-4">
          <h2 className="text-base font-semibold">お片付けスケジュール一覧</h2>
          <p className="text-sm text-ink-2">直近のお片付けスケジュールを確認できます。</p>
          <div className="mt-2 text-sm">
            <Link href="/liff/sessions/new" className="underline">新規作成</Link>
          </div>
        </Card>
      </div>

      <div className="space-y-3" role="region" aria-label="セッション一覧">
        {Array.isArray(sessions) && sessions.length > 0 ? (
          <div className="grid gap-3">
            {sessions.map((it: any) => (
              <Card key={it.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">
                    <Link href={`/liff/sessions/${encodeURIComponent(String(it.id))}`} className="underline">
                      {String(it.title ?? 'Untitled')}
                    </Link>
                  </div>
                  <div className="text-xs text-ink-2 mt-1">
                    {(() => {
                      const s = new Date(String(it.startsAt ?? ''))
                      const e = new Date(String(it.endsAt ?? ''))
                      const sameDay = !isNaN(s.getTime()) && !isNaN(e.getTime()) && s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth() && s.getDate() === e.getDate()
                      const dtf = new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
                      const tf = new Intl.DateTimeFormat('ja-JP', { hour: '2-digit', minute: '2-digit', hour12: false })
                      if (sameDay) return `${dtf.format(s)}〜${tf.format(e)}`
                      return `${dtf.format(s)}〜${dtf.format(e)}`
                    })()}
                    {it.teacher ? <span className="ml-2">担当: {String(it.teacher)}</span> : null}
                    {it.memo ? (
                      <div className="mt-1 text-ink-3">{String(it.memo)}</div>
                    ) : null}
                  </div>
                </div>
                {/* status badge removed */}
              </Card>
            ))}
          </div>
        ) : (
          <Empty title="項目がありません" />
        )}
      </div>
    </section>
  )
}
