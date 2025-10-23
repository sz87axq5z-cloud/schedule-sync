import { cn } from '@/lib/utils'

type Props = { title: string; hint?: string; className?: string }

export default function Empty({ title, hint, className }: Props) {
  return (
    <div className={cn('rounded-2xl border border-dashed border-border p-section text-center', className)}>
      <div className="text-body font-medium mb-element2">{title}</div>
      {hint && <div className="text-body text-ink-2">{hint}</div>}
    </div>
  )
}
