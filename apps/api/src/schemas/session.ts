import { z } from 'zod'

export const SessionBase = z.object({
  title: z.string().min(1).max(120),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  teacher: z.string().max(80).optional().or(z.literal('').transform(() => undefined)),
  memo: z.string().max(1000).optional().or(z.literal('').transform(() => undefined)),
  calendarId: z.string().max(200).optional().or(z.literal('').transform(() => undefined))
}).refine(v => new Date(v.endsAt) > new Date(v.startsAt), { message: 'endsAt must be after startsAt', path: ['endsAt'] })

export const SessionCreate = SessionBase
export const SessionUpdate = SessionBase.partial().refine(v => {
  if (v.startsAt && v.endsAt) return new Date(v.endsAt) > new Date(v.startsAt)
  return true
}, { message: 'endsAt must be after startsAt', path: ['endsAt'] })

export const SessionId = z.string().min(1)
export type SessionInput = z.infer<typeof SessionBase>
