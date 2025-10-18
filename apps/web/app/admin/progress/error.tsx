'use client'
type Props = { error: Error & { digest?: string }; reset: () => void }

export default function Error({ reset }: Props) {
  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-border p-4">
        <div className="text-sm font-medium mb-1">エラーが発生しました</div>
        <button onClick={reset} className="text-sm underline">再試行する</button>
      </div>
    </section>
  )
}
