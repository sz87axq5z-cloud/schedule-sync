import Card from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'
import Link from 'next/link'
import AuthHiddenFields from '../../../../components/AuthHiddenFields.client'
import { redirect } from 'next/navigation'
import ValidateDateRange from '../ValidateDateRange.client'

const API_BASE = process.env.API_BASE_URL || 'http://localhost:4000'

async function create(formData: FormData) {
  'use server'
  const title = String(formData.get('title') || '')
  const sd = String(formData.get('startsDate') || '')
  const sh = String(formData.get('startsHour') || '')
  const sm = String(formData.get('startsMin') || '')
  const ed = String(formData.get('endsDate') || '')
  const eh = String(formData.get('endsHour') || '')
  const em = String(formData.get('endsMin') || '')
  // status removed
  const memo = String(formData.get('memo') || '')
  const ownerGoogleSub = String(formData.get('ownerGoogleSub') || '')

  if (!title || !sd || !sh || !sm || !ed || !eh || !em) {
    // 必須未入力なら一覧へ戻す（簡易動作）
    redirect('/liff/sessions')
  }

  try {
    const startsAt = new Date(`${sd}T${sh}:${sm}:00`).toISOString()
    const endsAt = new Date(`${ed}T${eh}:${em}:00`).toISOString()
    const res = await fetch(`${API_BASE}/admin/sessions`, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        startsAt,
        endsAt,
        memo: memo || undefined,
        ownerGoogleSub: ownerGoogleSub || undefined
      }),
    })
    if (!res.ok) {
      try {
        const j = await res.json()
        const msg = typeof j?.error?.message === 'string' ? j.error.message : '作成に失敗しました。入力内容を見直してください。'
        redirect(`/liff/sessions/new?err=${encodeURIComponent(msg)}`)
      } catch {
        redirect(`/liff/sessions/new?err=${encodeURIComponent('作成に失敗しました。')}`)
      }
    }
  } catch (e) {
    redirect(`/liff/sessions/new?err=${encodeURIComponent('作成に失敗しました。接続状況を確認してください。')}`)
  }

  redirect('/liff/sessions')
}

export default function NewSessionPage({ searchParams }: { searchParams?: { err?: string } }) {
  return (
    <section className="space-y-6">
      <Card className="p-4 space-y-2">
        <h2 className="text-base font-semibold">お片付けスケジュール新規作成</h2>
        <p className="text-sm text-ink-2">必要事項を入力して作成します。</p>
      </Card>

      <Card className="p-4">
        {searchParams?.err ? (
          <div className="mb-3 text-sm text-red-600" role="alert">{searchParams.err}</div>
        ) : null}
        <form id="form-new-session" action={create} className="space-y-4">
          <AuthHiddenFields />
          <div className="space-y-1">
            <label className="text-sm">タイトル</label>
            <input name="title" required className="w-full rounded border px-2 py-1 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm">メモ（任意）</label>
            <textarea name="memo" rows={3} className="w-full rounded border px-2 py-1 text-sm" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm">開始</label>
              <div className="grid grid-cols-3 gap-2">
                <input type="date" name="startsDate" required className="w-full rounded border px-2 py-1 text-sm" />
                <select name="startsHour" required className="w-full rounded border px-2 py-1 text-sm">
                  {Array.from({ length: 24 }).map((_, h) => (
                    <option key={h} value={String(h).padStart(2, '0')}>{String(h).padStart(2, '0')}</option>
                  ))}
                </select>
                <select name="startsMin" required className="w-full rounded border px-2 py-1 text-sm">
                  {['00','15','30','45'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <p id="error-startsAt" role="alert" className="text-xs text-red-600"></p>
            </div>
            <div className="space-y-1">
              <label className="text-sm">終了</label>
              <div className="grid grid-cols-3 gap-2">
                <input type="date" name="endsDate" required className="w-full rounded border px-2 py-1 text-sm" />
                <select name="endsHour" required className="w-full rounded border px-2 py-1 text-sm">
                  {Array.from({ length: 24 }).map((_, h) => (
                    <option key={h} value={String(h).padStart(2, '0')}>{String(h).padStart(2, '0')}</option>
                  ))}
                </select>
                <select name="endsMin" required className="w-full rounded border px-2 py-1 text-sm">
                  {['00','15','30','45'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <p id="error-endsAt" role="alert" className="text-xs text-red-600"></p>
            </div>
          </div>
          

          <div className="flex items-center gap-2 pt-2">
            <Button type="submit">作成</Button>
            <Link href="/liff/sessions" className="text-sm underline">キャンセル</Link>
          </div>
          <ValidateDateRange formId="form-new-session" />
        </form>
      </Card>
    </section>
  )
}
