import { Router } from 'express'
import { google } from 'googleapis'
import { prisma } from '../lib/db'
import { SessionCreate, SessionUpdate, SessionId } from '../schemas/session'
import type { Request, Response } from 'express'
import { audit } from '../middlewares/audit'

const r = Router()

export async function syncToGoogleCalendar(item: any) {
  const svcEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const svcKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  const defaultCalendar = process.env.GOOGLE_CALENDAR_ID_DEFAULT
  const adminCalendar = process.env.GOOGLE_CALENDAR_ID_ADMIN || defaultCalendar
  const webClientId = process.env.GOOGLE_CLIENT_ID
  const webClientSecret = process.env.GOOGLE_CLIENT_SECRET

  const tz = process.env.CALENDAR_TZ || 'Asia/Tokyo'
  const localSummary = item.title
  const localDescription = item.memo ?? undefined
  const localStart = { dateTime: new Date(item.startsAt).toISOString(), timeZone: tz }
  const localEnd = { dateTime: new Date(item.endsAt).toISOString(), timeZone: tz }
  const lastSyncedAt = item.syncedAt ? new Date(item.syncedAt).getTime() : 0

  // ---------- Initialize API clients ----------
  let userCalendar: ReturnType<typeof google.calendar> | null = null
  let userCalendarId = item.calendarId ?? 'primary'
  if (item.ownerUserId && webClientId && webClientSecret) {
    const owner = await prisma.user.findUnique({ where: { id: item.ownerUserId } })
    if (owner?.accessToken) {
      const oAuth2 = new google.auth.OAuth2(webClientId, webClientSecret)
      oAuth2.setCredentials({
        access_token: owner.accessToken || undefined,
        refresh_token: owner.refreshToken || undefined,
        expiry_date: owner.tokenExpiry ? new Date(owner.tokenExpiry).getTime() : undefined,
      })
      userCalendar = google.calendar({ version: 'v3', auth: oAuth2 })
    }
  }
  const adminAuth = (svcEmail && svcKey) ? new google.auth.JWT({
    email: svcEmail,
    key: String(svcKey).replace(/\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/calendar.events']
  }) : null
  const adminCal = adminAuth ? google.calendar({ version: 'v3', auth: adminAuth }) : null

  // ---------- Read remote states ----------
  type RemoteEvent = { exists: boolean; deleted: boolean; event?: any; updatedAt?: number }
  const userRemote: RemoteEvent = { exists: false, deleted: false }
  const adminRemote: RemoteEvent = { exists: false, deleted: false }

  if (userCalendar && item.gcalEventId) {
    try {
      const r = await userCalendar.events.get({ calendarId: userCalendarId, eventId: item.gcalEventId })
      userRemote.exists = true
      userRemote.event = r.data
      userRemote.updatedAt = r.data.updated ? new Date(r.data.updated).getTime() : undefined
    } catch (e: any) {
      if (e?.code === 404) userRemote.deleted = true
    }
  }
  if (adminCal && item.gcalAdminEventId) {
    try {
      const r = await adminCal.events.get({ calendarId: adminCalendar!, eventId: item.gcalAdminEventId })
      adminRemote.exists = true
      adminRemote.event = r.data
      adminRemote.updatedAt = r.data.updated ? new Date(r.data.updated).getTime() : undefined
    } catch (e: any) {
      if (e?.code === 404) adminRemote.deleted = true
    }
  }

  // ---------- Handle deletions (Option A) ----------
  if ((userRemote.deleted && (item.gcalEventId)) || (adminRemote.deleted && (item.gcalAdminEventId))) {
    // If one side deleted, delete the other side too and clear both IDs; keep Session
    try {
      if (userRemote.deleted && adminCal && item.gcalAdminEventId) {
        try { await adminCal.events.delete({ calendarId: adminCalendar!, eventId: item.gcalAdminEventId }) } catch {}
      }
      if (adminRemote.deleted && userCalendar && item.gcalEventId) {
        try { await userCalendar.events.delete({ calendarId: userCalendarId, eventId: item.gcalEventId }) } catch {}
      }
    } finally {
      await prisma.session.update({ where: { id: item.id }, data: { gcalEventId: null, gcalAdminEventId: null, syncedAt: new Date() } })
    }
    return
  }

  // ---------- Determine source of truth (pull if Google newer than last sync) ----------
  let source: 'user' | 'admin' | 'local' = 'local'
  const userNewer = userRemote.exists && userRemote.updatedAt && userRemote.updatedAt > lastSyncedAt
  const adminNewer = adminRemote.exists && adminRemote.updatedAt && adminRemote.updatedAt > lastSyncedAt
  if (userNewer && adminNewer) {
    source = (userRemote.updatedAt! >= adminRemote.updatedAt!) ? 'user' : 'admin'
  } else if (userNewer) {
    source = 'user'
  } else if (adminNewer) {
    source = 'admin'
  } else {
    source = 'local'
  }

  // Build fields to write
  const fieldsFrom = (ev: any) => {
    const get = (p: string, def?: string) => p ?? def
    const summary = get(ev?.summary, localSummary)
    const description = get(ev?.description, localDescription)
    const startISO = ev?.start?.dateTime ?? localStart.dateTime
    const endISO = ev?.end?.dateTime ?? localEnd.dateTime
    return {
      summary,
      description,
      start: { dateTime: new Date(startISO).toISOString(), timeZone: tz },
      end: { dateTime: new Date(endISO).toISOString(), timeZone: tz },
      localPatch: {
        title: summary,
        memo: description ?? null,
        startsAt: new Date(startISO),
        endsAt: new Date(endISO),
      }
    }
  }

  const chosen = source === 'user' ? fieldsFrom(userRemote.event) : source === 'admin' ? fieldsFrom(adminRemote.event) : {
    summary: localSummary, description: localDescription, start: localStart, end: localEnd, localPatch: null as any
  }

  // ---------- Admin calendar (Service Account) ----------
  let newUserEventId: string | null | undefined = undefined
  let newAdminEventId: string | null | undefined = undefined

  // Upsert user side first (if OAuth available)
  if (userCalendar) {
    try {
      if (item.gcalEventId) {
        const r = await userCalendar.events.update({ calendarId: userCalendarId, eventId: item.gcalEventId, requestBody: { summary: chosen.summary, description: chosen.description, start: chosen.start, end: chosen.end } })
        newUserEventId = r.data.id || item.gcalEventId
      } else {
        const r = await userCalendar.events.insert({ calendarId: userCalendarId, requestBody: { summary: chosen.summary, description: chosen.description, start: chosen.start, end: chosen.end }, sendUpdates: 'all' })
        newUserEventId = r.data.id || null
      }
    } catch {}
  }

  if (svcEmail && svcKey && adminCalendar && adminCal) {
    try {
      if (item.gcalAdminEventId) {
        try {
          const r = await adminCal.events.update({ calendarId: adminCalendar, eventId: item.gcalAdminEventId, requestBody: { summary: chosen.summary, description: chosen.description, start: chosen.start, end: chosen.end } })
          newAdminEventId = r.data.id || item.gcalAdminEventId
        } catch {
          const r = await adminCal.events.insert({ calendarId: adminCalendar, requestBody: { summary: chosen.summary, description: chosen.description, start: chosen.start, end: chosen.end }, sendUpdates: 'none' })
          newAdminEventId = r.data.id || null
        }
      } else {
        const r = await adminCal.events.insert({ calendarId: adminCalendar, requestBody: { summary: chosen.summary, description: chosen.description, start: chosen.start, end: chosen.end }, sendUpdates: 'none' })
        newAdminEventId = r.data.id || null
      }
    } catch {}
  }

  // Update local session; if pulled from remote, patch local fields
  await prisma.session.update({ where: { id: item.id }, data: {
    ...(newUserEventId !== undefined ? { gcalEventId: newUserEventId ?? undefined } : {}),
    ...(newAdminEventId !== undefined ? { gcalAdminEventId: newAdminEventId ?? undefined } : {}),
    ...(chosen.localPatch ? {
      title: chosen.localPatch.title,
      memo: chosen.localPatch.memo,
      startsAt: chosen.localPatch.startsAt,
      endsAt: chosen.localPatch.endsAt,
    } : {}),
    syncedAt: new Date()
  }})
}

r.get('/', async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit ?? 20), 100)
  const cursor = (req.query.cursor as string | undefined) ?? undefined
  const direction = (String(req.query.direction || 'next') === 'prev') ? 'prev' : 'next'
  const order = (String(req.query.order || 'asc') === 'desc') ? 'desc' as const : 'asc' as const
  const sort = (String(req.query.sort || 'id') === 'startsAt') ? 'startsAt' as const : 'id' as const
  if (direction === 'prev') {
    const list = await prisma.session.findMany({
      take: -(limit + 1),
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: sort === 'startsAt' ? { startsAt: order } : { id: order }
    })
    const hasMoreBefore = list.length > limit
    const trimmed = hasMoreBefore ? list.slice(1) : list
    // When using negative take, Prisma returns items in reverse order; restore requested order
    const data = trimmed.reverse()
    const prevCursor = hasMoreBefore ? (data[0]?.id ?? null) : null
    const nextCursor = data.length ? data[data.length - 1].id : null
    return res.json({ ok: true, data: { items: data, nextCursor, prevCursor } })
  } else {
    const list = await prisma.session.findMany({
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: sort === 'startsAt' ? { startsAt: order } : { id: order }
    })
    const hasNext = list.length > limit
    const data = hasNext ? list.slice(0, limit) : list
    const nextCursor = hasNext ? data[data.length - 1].id : null
    const prevCursor = cursor ? (data[0]?.id ?? null) : null
    return res.json({ ok: true, data: { items: data, nextCursor, prevCursor } })
  }
})

r.post('/', audit('create', 'session', (body) => body?.data?.id ?? null), async (req: Request, res: Response) => {
  const parsed = SessionCreate.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: { code: 'VALIDATION', message: 'invalid payload', details: parsed.error.flatten() } })
  }
  const created = await prisma.session.create({ data: {
    title: parsed.data.title,
    startsAt: new Date(parsed.data.startsAt),
    endsAt: new Date(parsed.data.endsAt),
    teacher: parsed.data.teacher,
    memo: parsed.data.memo,
    calendarId: parsed.data.calendarId,
    ownerUserId: await (async () => {
      const sub = (req.headers['x-google-sub'] as string | undefined) || (req.body?.ownerGoogleSub as string | undefined)
      if (!sub) return null
      const u = await prisma.user.findUnique({ where: { googleUserId: sub } })
      return u?.id ?? null
    })()
  }})
  // best-effort auto sync (do not block response)
  syncToGoogleCalendar(created).catch(() => {})
  return res.json({ ok: true, data: created })
})

r.get('/:id', async (req: Request, res: Response) => {
  const id = SessionId.parse(req.params.id)
  const item = await prisma.session.findUnique({ where: { id } })
  if (!item) return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'session not found' } })
  return res.json({ ok: true, data: item })
})

r.put('/:id', audit('update','session', (body) => body?.data?.id ?? null, { before: true }), async (req: Request, res: Response) => {
  const id = SessionId.parse(req.params.id)
  const parsed = SessionUpdate.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ ok:false, error:{ code:'VALIDATION', message:'invalid payload', details: parsed.error.flatten() } })
  const before = await prisma.session.findUnique({ where: { id } })
  if (!before) return res.status(404).json({ ok:false, error:{ code:'NOT_FOUND', message:'session not found' } })
  ;(res as any).locals = { ...(res as any).locals, _before: before }
  const updated = await prisma.session.update({ where: { id }, data: {
    ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
    ...(parsed.data.startsAt !== undefined ? { startsAt: new Date(parsed.data.startsAt) } : {}),
    ...(parsed.data.endsAt !== undefined ? { endsAt: new Date(parsed.data.endsAt) } : {}),
    ...(parsed.data.teacher !== undefined ? { teacher: parsed.data.teacher } : {}),
    ...(parsed.data.memo !== undefined ? { memo: parsed.data.memo } : {}),
    ...(parsed.data.calendarId !== undefined ? { calendarId: parsed.data.calendarId } : {}),
    ...(req.headers['x-google-sub'] || req.body?.ownerGoogleSub ? {
      ownerUserId: await (async () => {
        const sub = (req.headers['x-google-sub'] as string | undefined) || (req.body?.ownerGoogleSub as string | undefined)
        if (!sub) return undefined as any
        const u = await prisma.user.findUnique({ where: { googleUserId: sub } })
        return u?.id
      })()
    } : {})
  }})
  // best-effort auto sync (do not block response)
  syncToGoogleCalendar(updated).catch(() => {})
  return res.json({ ok: true, data: updated })
})

r.delete('/:id', audit('delete','session', () => null, { before: true }), async (req: Request, res: Response) => {
  const id = SessionId.parse(req.params.id)
  const before = await prisma.session.findUnique({ where: { id } })
  if (!before) return res.status(404).json({ ok:false, error:{ code:'NOT_FOUND', message:'session not found' } })
  ;(res as any).locals = { ...(res as any).locals, _before: before }
  // Best-effort: delete Google Calendar event if linked
  try {
    const svcEmailDel = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const svcKeyDel = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
    const adminCalendarDel = process.env.GOOGLE_CALENDAR_ID_ADMIN || process.env.GOOGLE_CALENDAR_ID_DEFAULT

    // delete user-side event using user OAuth if possible
    const webClientId = process.env.GOOGLE_CLIENT_ID
    const webClientSecret = process.env.GOOGLE_CLIENT_SECRET
    if (before.gcalEventId && before.ownerUserId && webClientId && webClientSecret) {
      try {
        const owner = await prisma.user.findUnique({ where: { id: before.ownerUserId } })
        if (owner?.accessToken) {
          const oAuth2 = new google.auth.OAuth2(webClientId, webClientSecret)
          oAuth2.setCredentials({
            access_token: owner.accessToken || undefined,
            refresh_token: owner.refreshToken || undefined,
            expiry_date: owner.tokenExpiry ? new Date(owner.tokenExpiry).getTime() : undefined,
          })
          const userCal = google.calendar({ version: 'v3', auth: oAuth2 })
          const userCalId = before.calendarId ?? 'primary'
          await userCal.events.delete({ calendarId: userCalId, eventId: before.gcalEventId })
        }
      } catch {}
    }

    // delete admin-side event using service account
    if (before.gcalAdminEventId && svcEmailDel && svcKeyDel && adminCalendarDel) {
      try {
        const auth = new google.auth.JWT({
          email: svcEmailDel,
          key: String(svcKeyDel).replace(/\\n/g, '\n'),
          scopes: ['https://www.googleapis.com/auth/calendar.events']
        })
        const adminCal = google.calendar({ version: 'v3', auth })
        await adminCal.events.delete({ calendarId: adminCalendarDel, eventId: before.gcalAdminEventId })
      } catch {}
    }
  } catch {}
  await prisma.session.delete({ where: { id } })
  return res.status(204).end()
})

// Google Calendar sync placeholder
r.post('/:id/sync', async (req: Request, res: Response) => {
  const id = SessionId.parse(req.params.id)
  const item = await prisma.session.findUnique({ where: { id } })
  if (!item) return res.status(404).json({ ok:false, error:{ code:'NOT_FOUND', message:'session not found' } })
  try {
    await syncToGoogleCalendar(item)
    const updated = await prisma.session.findUnique({ where: { id } })
    return res.json({ ok:true, data: { gcalEventId: updated?.gcalEventId ?? null, gcalAdminEventId: updated?.gcalAdminEventId ?? null, syncedAt: updated?.syncedAt ?? null } })
  } catch (e:any) {
    return res.status(500).json({ ok:false, error:{ code:'SYNC_FAILED', message: e?.message || 'failed' } })
  }
})

export default r
