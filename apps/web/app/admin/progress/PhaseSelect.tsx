"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/Select'

const PHASES = [
  { label: 'すべて', value: 'all' },
  { label: 'Phase A', value: 'A' },
  { label: 'Phase B', value: 'B' },
  { label: 'Phase C', value: 'C' },
]

export default function PhaseSelect() {
  const router = useRouter()
  const sp = useSearchParams()
  const current = sp.get('phase') ?? 'all'

  const onChange = (v: string) => {
    const params = new URLSearchParams(sp.toString())
    if (v === 'all') params.delete('phase')
    else params.set('phase', v)
    router.replace(`?${params.toString()}`)
  }

  return (
    <Select value={current} onValueChange={onChange}>
      <SelectTrigger className="w-40" aria-label="フェーズでフィルタ">
        <SelectValue placeholder="フェーズ" />
      </SelectTrigger>
      <SelectContent>
        {PHASES.map(p => (
          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
