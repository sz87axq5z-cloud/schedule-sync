import clsx from 'clsx'

type Props = {
  children: string
  tone?: 'default' | 'ok' | 'warn' | 'error' | 'muted'
  className?: string
}

export default function StatusBadge({ children, tone = 'default', className }: Props) {
  const toneClass = {
    // neutral outline
    default: 'bg-transparent border-border text-ink',
    // positive: solid inverse for明確な強調
    ok: 'bg-ink border-ink text-paper',
    // caution: 強い線で注意喚起（色は変えない）
    warn: 'bg-transparent border-ink text-ink',
    // error: 薄い面で背景を付与（有彩色なし）
    error: 'bg-paper-2 border-ink text-ink',
    // muted: 控えめ
    muted: 'bg-transparent border-border text-ink-2',
  }[tone]

  return (
    <span className={clsx('inline-flex items-center rounded-full border px-2 py-0.5 text-xs', toneClass, className)}>
      {children}
    </span>
  )
}
