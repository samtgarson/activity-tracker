import { json, LoaderFunction } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { authenticator } from '../services/auth.server'
import { getSession } from '../services/session.server'

type IndexProps = { loggedIn: boolean; error?: string }

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request)
  const session = await getSession(request.headers.get('cookie'))
  const error = session.get(authenticator.sessionErrorKey)
  session.unset(authenticator.sessionErrorKey)

  return json<IndexProps>({ loggedIn: !!user, error })
}

export default function Index() {
  const { loggedIn, error } = useLoaderData<IndexProps>()

  return (
    <div>
      <h1>Welcome to Remix</h1>
      {error && <p>{JSON.stringify(error)}</p>}
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
