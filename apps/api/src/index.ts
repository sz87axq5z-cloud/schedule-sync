import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import type { Request, Response } from 'express'

const app = express()
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

app.get('/healthz', (_req: Request, res: Response) => {
  res.status(200).json({ ok: true })
})

// simple in-memory cache for progress endpoint
let cachedProgress: { data: unknown; ts: number } | null = null
const PROGRESS_TTL_MS = 60 * 1000 // 60 seconds

app.get('/admin/progress', (_req: Request, res: Response) => {
  const now = Date.now()
  if (cachedProgress && now - cachedProgress.ts < PROGRESS_TTL_MS) {
    res.setHeader('Cache-Control', 'public, max-age=60')
    return res.status(200).json(cachedProgress.data)
  }

  // dummy payload for initial implementation
  const payload = {
    phase: 'A',
    completed_checklist: ['web:dev server up'],
    next_actions: [
      'Implement API health endpoint',
      'Add /admin/progress UI in web app'
    ],
    risks: [],
    message: 'Monorepo progress endpoint (dummy)'
  }

  cachedProgress = { data: payload, ts: now }
  res.setHeader('Cache-Control', 'public, max-age=60')
  return res.status(200).json(payload)
})

const port = process.env.PORT ? Number(process.env.PORT) : 4000
app.listen(port, () => {
  console.log(`[api] listening on http://localhost:${port}`)
})
