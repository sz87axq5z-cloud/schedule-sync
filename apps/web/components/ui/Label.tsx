import * as React from 'react'
import { cn } from '@/lib/utils'

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn('block text-sm font-medium text-ink', className)}
      {...props}
    />
  )
})

Label.displayName = 'Label'

export default Label
