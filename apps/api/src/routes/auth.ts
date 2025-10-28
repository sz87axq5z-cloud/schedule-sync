import { Router } from 'express'
import type { Request, Response } from 'express'
import { prisma } from '../lib/db'

const r = Router()

// Upsert user and store tokens from NextAuth session
r.post('/session', async (req: Request, res: Response) => {
  const { googleUserId, email, accessToken, refreshToken, tokenExpiry } = req.body || {}
  if (!googleUserId || !email) return res.status(400).json({ ok:false, error:{ code:'BAD_REQUEST', message:'googleUserId and email are required' } })
  try {
    const user = await prisma.user.upsert({
      where: { googleUserId },
      create: {
        googleUserId,
        email,
        accessToken: accessToken ?? null,
        refreshToken: refreshToken ?? null,
        tokenExpiry: tokenExpiry ? new Date(tokenExpiry) : null,
      },
      update: {
        email,
        ...(accessToken !== undefined ? { accessToken } : {}),
        ...(refreshToken !== undefined ? { refreshToken } : {}),
        ...(tokenExpiry !== undefined ? { tokenExpiry: tokenExpiry ? new Date(tokenExpiry) : null } : {}),
      }
    })
    return res.json({ ok:true, data:{ id: user.id } })
  } catch (e:any) {
    return res.status(500).json({ ok:false, error:{ code:'UPSERT_USER_FAILED', message: e?.message || 'failed' } })
  }
})

export default r
