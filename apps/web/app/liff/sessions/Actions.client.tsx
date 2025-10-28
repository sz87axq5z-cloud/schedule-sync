'use client'

import Button from '../../../components/ui/Button'

export default function SessionActions({ id }: { id: string }) {
  function getApiBase() {
    if (process.env.NEXT_PUBLIC_API_BASE_URL) return process.env.NEXT_PUBLIC_API_BASE_URL as string
    if (typeof location !== 'undefined') return `${location.protocol}//${location.hostname}:4000`
    return 'http://localhost:4000'
  }

  async function remove() {
    if (!confirm('このセッションを削除します。よろしいですか？')) return
    try {
      const res = await fetch(`${getApiBase()}/admin/sessions/${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.text().catch(() => '')
        throw new Error(`delete failed: ${res.status} ${body}`)
      }
      if (typeof location !== 'undefined') location.assign('/liff/sessions')
    } catch (e) {
      console.error(e)
      alert('削除に失敗しました')
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={remove}>削除</Button>
    </div>
  )
}
