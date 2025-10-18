type Props = { title: string; hint?: string }

export default function Empty({ title, hint }: Props) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center">
      <div className="text-sm font-medium mb-1">{title}</div>
      {hint && <div className="text-sm text-ink-2">{hint}</div>}
    </div>
  )
}
