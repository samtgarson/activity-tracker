import { json, LoaderFunction } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import React from 'react'
import { authenticator } from '../services/auth.server'

type IndexProps = { loggedIn: boolean }

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request)

  return json<IndexProps>({ loggedIn: !!user })
}

export default function Index() {
  const { loggedIn } = useLoaderData<IndexProps>()

  return (
    <div>
      <h1>Welcome to Remix</h1>
      {loggedIn ? (
        <a href='/dashboard'>Dashboard</a>
      ) : (
        <Form action='/auth/google' method='post'>
          <button>Login with Google</button>
        </Form>
      )}
    </div>
  )
}
