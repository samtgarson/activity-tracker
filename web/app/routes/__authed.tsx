import { json, LoaderFunction, redirect } from '@remix-run/node'
import { Link, Outlet, useLoaderData } from '@remix-run/react'
import { getUser } from '../utils/auth.server'

export const loader = async (
  { request }: Parameters<LoaderFunction>[0],
  deps = { getUser, json, redirect }
) => {
  const user = await deps.getUser(request)
  if (!user.activeAccount?.calendarId && !request.url.endsWith('/welcome')) {
    return deps.redirect('/welcome')
  }
  return deps.json({ user })
}

export default function Authed() {
  const { user } = useLoaderData()
  return (
    <div>
      <h1>Welcome to Remix, {user?.givenName}</h1>
      <Link to='/auth/logout'>Logout</Link>
      <Outlet context={{ user }} />
    </div>
  )
}
