import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import type { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import YAML from 'yaml'
import { fileURLToPath } from 'url'
import sessionsRouter, { syncToGoogleCalendar } from './routes/sessions'
import authRouter from './routes/auth'
import { prisma } from './lib/db'

// __dirname shim for ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

  // try reading progress from ops/progress.yaml at monorepo root
  const yamlPath = path.resolve(__dirname, '../../../ops/progress.yaml')
  let payload: any
  try {
    const raw = fs.readFileSync(yamlPath, 'utf8')
    const doc = YAML.parse(raw) || {}
    payload = {
      phase: doc.phase ?? 'A',
      completed_checklist: Array.isArray(doc.completed_checklist) ? doc.completed_checklist : [],
      next_actions: Array.isArray(doc.next_actions) ? doc.next_actions : [],
      risks: Array.isArray(doc.risks) ? doc.risks : [],
      source: 'ops/progress.yaml'
    }
  } catch (e) {
    // fallback to a safe dummy payload if reading/parsing fails
    payload = {
      phase: 'A',
      completed_checklist: ['web: dev server up'],
      next_actions: [
        'Hook /admin/progress to ops/progress.yaml',
        'Expose API base URL to web via env'
      ],
      risks: [],
      message: 'Fallback: failed to read ops/progress.yaml'
    }
  }

  cachedProgress = { data: payload, ts: now }
  res.setHeader('Cache-Control', 'public, max-age=60')
  return res.status(200).json(payload)
})

// mount Prisma-backed sessions router under admin namespace
app.use('/admin/sessions', sessionsRouter)
app.use('/auth', authRouter)

const port = process.env.PORT ? Number(process.env.PORT) : 4000
app.listen(port, () => {
  console.log(`[api] listening on http://localhost:${port}`)
})

// ---------------- Polling scheduler (Option B) ----------------
function startPoller() {
  const enabled = String(process.env.POLL_ENABLED || 'false').toLowerCase() === 'true'
  if (!enabled) return
  const interval = Math.max(Number(process.env.POLL_INTERVAL_MS || 60000), 10000)
  console.log(`[poller] enabled, interval=${interval}ms`)

  // tick: scan sessions around now and those already linked to calendars
  const tick = async () => {
    try {
      const now = new Date()
      const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // last 7 days
      const until = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000) // next 60 days
      const items = await prisma.session.findMany({
        where: {
          OR: [
            { startsAt: { gte: since, lte: until } },
            { gcalEventId: { not: null } },
            { gcalAdminEventId: { not: null } },
          ]
        },
        orderBy: { startsAt: 'asc' },
        take: 200
      })
      for (const it of items) {
        try {
          await syncToGoogleCalendar(it)
        } catch (e) {
          // swallow per-item errors to keep poller running
        }
      }
    } catch (e) {
      console.error('[poller] tick error', e)
    }
  }

  // initial delay to let server boot
  setTimeout(tick, 5000)
  setInterval(tick, interval)
}

startPoller()
