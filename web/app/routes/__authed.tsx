import React from 'react'
import { json, LoaderFunction } from '@remix-run/node'
import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react'
import { authenticator } from '../services/auth.server'
import { User } from '../types'

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/'
  })

  return json({ user })
}

export const useAuth = () => {
  return useOutletContext<{ user: User }>()
}

export default function Authed() {
  const { user } = useLoaderData()
  return <Outlet context={{ user }} />
}
