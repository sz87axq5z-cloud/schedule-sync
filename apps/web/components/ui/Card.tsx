import { PropsWithChildren } from 'react'
import { cn } from '@/lib/utils'

type Props = PropsWithChildren<{ className?: string }>

export default function Card({ className, children }: Props) {
  return (
    <div className={cn('rounded-2xl border border-border bg-paper shadow-sm', className)}>
      {children}
    </div>
  )
}
