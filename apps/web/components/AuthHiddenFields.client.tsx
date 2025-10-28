"use client"
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export default function AuthHiddenFields() {
  const { data } = useSession()
  const [sub, setSub] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  useEffect(() => {
    const s = (data as any)?.googleSub || (data as any)?.user?.id || ""
    const e = (data as any)?.user?.email || ""
    setSub(s || "")
    setEmail(e || "")
  }, [data])
  return (
    <>
      <input type="hidden" name="ownerGoogleSub" value={sub} />
      <input type="hidden" name="ownerEmail" value={email} />
    </>
  )
}
