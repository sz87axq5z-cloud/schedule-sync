import { InputHTMLAttributes } from 'react'
import clsx from 'clsx'

type Props = {
  id: string
  label: string
  hint?: string
  error?: string
  className?: string
} & InputHTMLAttributes<HTMLInputElement>

export default function FormField({ id, label, hint, error, className, required, ...inputProps }: Props) {
  const describedBy: string[] = []
  if (hint) describedBy.push(`${id}-hint`)
  if (error) describedBy.push(`${id}-error`)

  return (
    <div className={clsx('space-y-2', className)}>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}{required ? ' *' : ''}
      </label>
      <input
        id={id}
        aria-describedby={describedBy.join(' ') || undefined}
        aria-invalid={!!error || undefined}
        required={required}
        className={clsx(
          'w-full rounded-2xl border bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-2',
          'border-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'
        )}
        {...inputProps}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-ink-2">{hint}</p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs text-ink">{error}</p>
      )}
    </div>
  )
}
