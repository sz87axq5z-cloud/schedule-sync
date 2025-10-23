"use client"

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '@/lib/utils'

export const TooltipProvider = TooltipPrimitive.Provider
export const Tooltip = TooltipPrimitive.Root
export const TooltipTrigger = TooltipPrimitive.Trigger

export function TooltipContent({ className, sideOffset = 6, ...props }: React.ComponentProps<typeof TooltipPrimitive.Content> & { sideOffset?: number }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        {...props}
        className={cn(
          'z-50 rounded-2xl border border-border bg-paper px-2 py-1 text-xs text-ink shadow-sm',
          'data-[state=delayed-open]:animate-in data-[state=closed]:animate-out',
          className
        )}
      />
    </TooltipPrimitive.Portal>
  )
}
