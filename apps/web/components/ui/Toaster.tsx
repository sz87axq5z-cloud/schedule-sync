"use client"

import * as Toast from "@radix-ui/react-toast"
import { PropsWithChildren } from "react"

export function ToasterProvider({ children }: PropsWithChildren) {
  return (
    <Toast.Provider swipeDirection="right" duration={3000}>
      {children}
      <Toast.Viewport className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] outline-none" />
    </Toast.Provider>
  )
}

export function Toaster({ title, description, open, onOpenChange }: { title?: string; description?: string; open?: boolean; onOpenChange?: (o: boolean) => void }) {
  return (
    <Toast.Root
      open={open}
      onOpenChange={onOpenChange}
      className="bg-ink text-paper border border-border data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 rounded-2xl shadow-sm px-4 py-3 grid gap-1"
    >
      {title && <Toast.Title className="text-sm font-medium">{title}</Toast.Title>}
      {description && <Toast.Description className="text-xs text-paper/80">{description}</Toast.Description>}
      <Toast.Close className="absolute right-3 top-3 h-6 w-6 text-paper/80 hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper" aria-label="閉じる">
        ×
      </Toast.Close>
    </Toast.Root>
  )
}
