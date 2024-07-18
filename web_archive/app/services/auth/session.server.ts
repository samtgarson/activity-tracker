// app/services/session.server.ts
import { getEnv } from '@/app/utils/env'
import { createCookieSessionStorage } from '@remix-run/node'

const secret = getEnv('SESSION_SECRET')

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '_session',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secrets: [secret],
    secure: process.env.NODE_ENV === 'production'
  }
})

export const { getSession, commitSession, destroySession } = sessionStorage
