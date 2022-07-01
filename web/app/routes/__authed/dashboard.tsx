import { CalendarsListFetcher } from '@/app/services/calendars/list/fetcher'
import { Calendar, ServiceResult } from '@/app/types'
import { json, LoaderFunction } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { getUser, useAuth } from '../__authed'

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request)
  const fetcher = new CalendarsListFetcher()
  const data = await fetcher.call(user, 'google')

  return json(data)
}

export default function Dashboard() {
  const { user } = useAuth()
  const res = useLoaderData<ServiceResult<Calendar[]>>()

  return (
    <div>
      <h1>Welcome to Remix, {user?.givenName}</h1>
      <Link to='/auth/logout'>Logout</Link>
      {res.error ? <p>{res.error}</p> : null}
      {res.data ? <p>{res.data.length} calendars</p> : null}
    </div>
  )
}
