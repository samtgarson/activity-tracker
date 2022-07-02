import { json, LoaderFunction } from '@remix-run/node'
import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react'
import { authenticator } from '../services/auth/auth.server'
import { UserWithAccount } from '../types'

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request)
  return json({ user })
}

export default function Authed() {
  const { user } = useLoaderData()
  return <Outlet context={{ user }} />
}

// Helpers

export const getUser = async (request: Request): Promise<UserWithAccount> => {
  return authenticator.isAuthenticated(request, {
    failureRedirect: '/'
  })
}

export const useAuth = () => {
  return useOutletContext<{ user: UserWithAccount }>()
}
