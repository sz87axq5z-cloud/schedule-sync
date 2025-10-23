"use client"

import { useState } from 'react'
import Button from '../../../components/ui/Button'
import { Toaster } from '../../../components/ui/Toaster'

export default function ToastDemo() {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex items-center gap-2">
      <Button size="sm" onClick={() => setOpen(true)}>通知を表示</Button>
      <Toaster open={open} onOpenChange={setOpen} title="保存しました" description="最新の設定が反映されました" />
    </div>
  )
}
