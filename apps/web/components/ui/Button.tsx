import { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-2xl font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-ink text-paper hover:bg-ink/90 active:bg-ink/80 focus-visible:outline-ink disabled:bg-ink/40 disabled:text-paper/80',
        outline: 'bg-transparent text-ink border border-border hover:bg-paper-2 active:bg-paper-2 focus-visible:outline-ink disabled:text-ink-2 disabled:border-border',
        ghost: 'bg-transparent text-ink hover:bg-paper-2/60 active:bg-paper-2 focus-visible:outline-ink disabled:text-ink-2'
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-5 text-base'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
)

type Props = PropsWithChildren<{
  loading?: boolean
  className?: string
} & ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>>

export default function Button({ variant, size, loading = false, className, children, disabled, ...rest }: Props) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <span className="mr-2 inline-block h-3 w-3 animate-pulse rounded-full bg-current" aria-hidden />
      )}
      {children}
    </button>
  )
}
