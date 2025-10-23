import { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'

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
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}{required ? ' *' : ''}
      </Label>
      <Input
        id={id}
        aria-describedby={describedBy.join(' ') || undefined}
        aria-invalid={!!error || undefined}
        required={required}
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
