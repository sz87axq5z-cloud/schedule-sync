import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2 py-0.5 text-xs',
  {
    variants: {
      tone: {
        default: 'bg-transparent border-border text-ink',
        ok: 'bg-ink border-ink text-paper',
        warn: 'bg-transparent border-ink text-ink',
        error: 'bg-paper-2 border-ink text-ink',
        muted: 'bg-transparent border-border text-ink-2'
      }
    },
    defaultVariants: {
      tone: 'default'
    }
  }
)

type Props = {
  children: string
  className?: string
} & VariantProps<typeof badgeVariants>

export default function StatusBadge({ children, tone, className }: Props) {
  return (
    <span className={cn(badgeVariants({ tone }), className)}>
      {children}
    </span>
  )
}
