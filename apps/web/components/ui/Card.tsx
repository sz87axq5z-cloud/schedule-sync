import { PropsWithChildren } from 'react'
import clsx from 'clsx'

type Props = PropsWithChildren<{ className?: string }>

export default function Card({ className, children }: Props) {
  return (
    <div className={clsx('rounded-2xl border border-border bg-paper', className)}>
      {children}
    </div>
  )
}
