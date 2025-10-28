import Card from '../../../../../components/ui/Card'
import Button from '../../../../../components/ui/Button'
import Link from 'next/link'
import AuthHiddenFields from '../../../../../components/AuthHiddenFields.client'
import { redirect } from 'next/navigation'
import ValidateDateRange from '../../ValidateDateRange.client'

const API_BASE = process.env.API_BASE_URL || 'http://localhost:4000'

const pad = (n: number) => String(n).padStart(2, '0')
function splitDate(dt?: string) {
  if (!dt) return ''
  const d = new Date(dt)
  if (isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
function splitHour(dt?: string) {
  if (!dt) return ''
  const d = new Date(dt)
  if (isNaN(d.getTime())) return ''
  return pad(d.getHours())
}
function splitMin(dt?: string) {
  if (!dt) return ''
  const d = new Date(dt)
  if (isNaN(d.getTime())) return ''
  const m = d.getMinutes()
  const snap = [0,15,30,45].reduce((prev, cur) => Math.abs(cur - m) < Math.abs(prev - m) ? cur : prev, 0)
  return pad(snap)
}

async function fetchSession(id: string) {
  try {
    const res = await fetch(`${API_BASE}/admin/sessions/${encodeURIComponent(id)}`, { cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()
    return json?.data ?? null
  } catch {
    return null
  }
}

async function update(id: string, formData: FormData) {
  'use server'
  const title = String(formData.get('title') || '')
  const sd = String(formData.get('startsDate') || '')
  const sh = String(formData.get('startsHour') || '')
  const sm = String(formData.get('startsMin') || '')
  const ed = String(formData.get('endsDate') || '')
  const eh = String(formData.get('endsHour') || '')
  const em = String(formData.get('endsMin') || '')
  // status removed
  const teacher = String(formData.get('teacher') || '')
  const memo = String(formData.get('memo') || '')
  const ownerGoogleSub = String(formData.get('ownerGoogleSub') || '')

  try {
    const startsAt = (sd && sh && sm) ? new Date(`${sd}T${sh}:${sm}:00`).toISOString() : undefined
    const endsAt = (ed && eh && em) ? new Date(`${ed}T${eh}:${em}:00`).toISOString() : undefined
    await fetch(`${API_BASE}/admin/sessions/${encodeURIComponent(id)}`, {
      method: 'PUT',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title || undefined,
        startsAt,
        endsAt,
        teacher: teacher || undefined,
        memo: memo || undefined,
        ownerGoogleSub: ownerGoogleSub || undefined,
      }),
    })
  } catch {}

  redirect(`/liff/sessions/${encodeURIComponent(id)}`)
}

export default async function EditSessionPage({ params }: { params: { id: string } }) {
  const data = await fetchSession(params.id)

  return (
    <section className="space-y-6">
      <Card className="p-4 space-y-2">
        <h2 className="text-base font-semibold">セッション編集</h2>
        <p className="text-sm text-ink-2">必要事項を編集して更新します。</p>
      </Card>

      <Card className="p-4">
        <form id="form-edit-session" action={update.bind(null, params.id)} className="space-y-4">
          <AuthHiddenFields />
          <div className="space-y-1">
            <label className="text-sm">タイトル</label>
            <input name="title" defaultValue={String(data?.title ?? '')} className="w-full rounded border px-2 py-1 text-sm" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm">開始</label>
              <div className="grid grid-cols-3 gap-2">
                <input type="date" name="startsDate" defaultValue={splitDate(String(data?.startsAt ?? ''))} className="w-full rounded border px-2 py-1 text-sm" />
                <select name="startsHour" className="w-full rounded border px-2 py-1 text-sm" defaultValue={splitHour(String(data?.startsAt ?? ''))}>
                  {Array.from({ length: 24 }).map((_, h) => (
                    <option key={h} value={pad(h)}>{pad(h)}</option>
                  ))}
                </select>
                <select name="startsMin" className="w-full rounded border px-2 py-1 text-sm" defaultValue={splitMin(String(data?.startsAt ?? ''))}>
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
                <input type="date" name="endsDate" defaultValue={splitDate(String(data?.endsAt ?? ''))} className="w-full rounded border px-2 py-1 text-sm" />
                <select name="endsHour" className="w-full rounded border px-2 py-1 text-sm" defaultValue={splitHour(String(data?.endsAt ?? ''))}>
                  {Array.from({ length: 24 }).map((_, h) => (
                    <option key={h} value={pad(h)}>{pad(h)}</option>
                  ))}
                </select>
                <select name="endsMin" className="w-full rounded border px-2 py-1 text-sm" defaultValue={splitMin(String(data?.endsAt ?? ''))}>
                  {['00','15','30','45'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <p id="error-endsAt" role="alert" className="text-xs text-red-600"></p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm">担当（任意）</label>
              <input name="teacher" defaultValue={String(data?.teacher ?? '')} className="w-full rounded border px-2 py-1 text-sm" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm">メモ（任意）</label>
            <textarea name="memo" rows={3} defaultValue={String(data?.memo ?? '')} className="w-full rounded border px-2 py-1 text-sm" />
          </div>
          

          <div className="flex items-center gap-2 pt-2">
            <Button type="submit">更新</Button>
            <Link href={`/liff/sessions/${encodeURIComponent(params.id)}`} className="text-sm underline">キャンセル</Link>
          </div>
          <ValidateDateRange formId="form-edit-session" />
        </form>
      </Card>
    </section>
  )
}
