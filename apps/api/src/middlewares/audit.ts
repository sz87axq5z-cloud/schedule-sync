import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/db'

export type AuditAction = 'create' | 'update' | 'delete'
export type AuditResource = 'session'

export type AuditOpt = { before?: boolean }

export const audit = (
  action: AuditAction,
  resource: AuditResource,
  resourceIdAccessor: (responseBody: any) => string | null,
  opt: AuditOpt = {}
) => {
  return async (_req: Request, res: Response, next: NextFunction) => {
    const ip = (res.req.ip ?? null) as string | null
    const ua = (res.req.headers['user-agent'] ?? null) as string | null
    const beforeData = opt.before ? (res as any).locals?._before : null

    const originalJson: typeof res.json = res.json.bind(res)
    res.json = (body: any) => {
      try {
        const rid = resourceIdAccessor(body)
        const afterData = body?.data ?? null
        // fire-and-forget: non-blocking audit logging
        prisma.auditLog.create({
          data: {
            at: new Date(),
            actor: null,
            ip,
            ua,
            action,
            resource,
            resourceId: rid ?? (afterData?.id ?? 'unknown'),
            before: beforeData ?? null,
            after: afterData ?? null
          }
        }).catch(() => {})
      } catch {
        // 監査失敗は業務処理を妨げない
      }
      return originalJson(body)
    }

    next()
  }
}
