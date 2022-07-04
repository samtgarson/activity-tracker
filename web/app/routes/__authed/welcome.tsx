import { CalendarListFetcher } from '@/app/services/calendars/list/fetcher'
import { Calendar, ServiceResult } from '@/app/types'
import { getUser } from '@/app/utils/auth.server'
import { json, LoaderFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request)
  const fetcher = new CalendarListFetcher()
  const data = await fetcher.call(user, 'google')

  return json(data)
}

export default function Dashboard() {
  const res = useLoaderData<ServiceResult<Calendar[]>>()

  return (
    <div>
      {res.error ? <p>{res.error}</p> : null}
      {res.data ? <p>{res.data.length} calendars</p> : null}
    </div>
  )
}
