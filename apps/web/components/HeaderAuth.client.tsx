"use client"
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function HeaderAuth() {
  const { data: session, status } = useSession()
  if (status === 'loading') return null
  if (!session) {
    return (
      <div className="ml-auto text-sm">
        <Link href="/api/auth/signin?callbackUrl=/liff/sessions" className="underline">ログイン</Link>
      </div>
    )
  }
  return (
    <div className="ml-auto flex items-center gap-3 text-sm">
      <span className="text-ink-3 hidden sm:inline">{session.user?.email}</span>
      <Link href="/api/auth/signout?callbackUrl=/" className="underline">ログアウト</Link>
    </div>
  )
}
