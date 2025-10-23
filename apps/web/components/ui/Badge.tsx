import { HTMLAttributes } from 'react'
import clsx from 'clsx'

type Tone = 'default' | 'ok' | 'warn' | 'muted'

type Props = HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone
}

const base = 'inline-flex h-6 items-center rounded-2xl border px-2 text-xs font-medium'

const toneClass: Record<Tone, string> = {
  default: 'bg-paper text-ink border-border',
  ok: 'bg-ink text-paper border-ink',
  warn: 'bg-paper-2 text-ink border-border',
  muted: 'bg-transparent text-ink-2 border-border'
}

export default function Badge({ tone = 'default', className, ...rest }: Props) {
  return <span className={clsx(base, toneClass[tone], className)} {...rest} />
}
