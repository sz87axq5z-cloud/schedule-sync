import './globals.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'Schedule Sync',
  description: 'Monochrome minimal UI'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" className="bg-paper text-ink">
      <body className="min-h-screen antialiased">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <header className="h-14 flex items-center mb-8">
            <h1 className="text-xl font-semibold tracking-tight">Schedule Sync</h1>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}
