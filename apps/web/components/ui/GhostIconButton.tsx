import { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

type Size = 'sm' | 'md' | 'lg'

type Props = {
  'aria-label': string
  size?: Size
  className?: string
} & ButtonHTMLAttributes<HTMLButtonElement>

const base = 'inline-flex items-center justify-center rounded-full border border-border bg-transparent text-ink transition-colors duration-200 hover:bg-paper-2 active:bg-paper-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'

const sizeClass: Record<Size, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base'
}

export default function GhostIconButton({ size = 'md', className, ...rest }: Props) {
  return (
    <button className={clsx(base, sizeClass[size], className)} {...rest} />
  )
}
