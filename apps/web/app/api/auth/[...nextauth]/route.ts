import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

const handler = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: [
            "openid",
            "email",
            "profile",
            // Minimum needed for create/update/delete/read of events
            "https://www.googleapis.com/auth/calendar.events",
          ].join(" "),
        },
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        ;(token as any).accessToken = (account as any).access_token
        ;(token as any).refreshToken = (account as any).refresh_token
        const expSec = Number((account as any).expires_in ?? 0)
        ;(token as any).expiresAt = Date.now() + expSec * 1000
        ;(token as any).googleSub = (profile as any)?.sub
        ;(token as any).email = (profile as any)?.email
        ;(token as any).name = (profile as any)?.name
      }
      return token
    },
    async session({ session, token }) {
      (session as any).accessToken = (token as any).accessToken
      ;(session as any).googleSub = (token as any).googleSub
      // send token to API (best-effort)
      try {
        const API_BASE = process.env.API_BASE_URL || 'http://localhost:4000'
        await fetch(`${API_BASE}/auth/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            googleUserId: (token as any).googleSub,
            email: (session.user?.email as string) || (token as any).email,
            accessToken: (token as any).accessToken,
            refreshToken: (token as any).refreshToken,
            tokenExpiry: typeof (token as any).expiresAt === 'number' ? new Date((token as any).expiresAt).toISOString() : null,
          })
        })
      } catch {}
      return session
    },
  },
})

export { handler as GET, handler as POST }
