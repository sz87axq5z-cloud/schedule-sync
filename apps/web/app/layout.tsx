import './globals.css'
import type { ReactNode } from 'react'
import { ToasterProvider } from '@/components/ui/Toaster'

export const metadata = {
  title: 'Schedule Sync',
  description: 'Monochrome minimal UI'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" className="bg-paper text-ink">
      <body className="min-h-screen antialiased">
        <ToasterProvider>
          <div className="mx-auto max-w-3xl px-6 py-pagey space-y-section">
            <header className="h-14 flex items-center">
              <h1 className="text-title font-semibold tracking-tight">Schedule Sync</h1>
            </header>
            <main>{children}</main>
          </div>
        </ToasterProvider>
      </body>
    </html>
  )
}
