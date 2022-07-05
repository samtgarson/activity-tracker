import { CalendarFetcher } from '@/app/services/calendars/fetcher'
import { Calendar } from '@/app/types'
import { getUser } from '@/app/utils/auth.server'
import { ServiceResult } from '@/app/utils/service'
import { json, LoaderFunction, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request)
  const account = user.activeAccount
  if (!account?.calendarId) return redirect('/welcome')

  const fetcher = new CalendarFetcher()
  const data = await fetcher.call(user, account.provider, account.calendarId)
  return json(data)
}

export default function Dashboard() {
  const res = useLoaderData<ServiceResult<Calendar>>()

  if (!res.success) return <p>{res.error}</p>

  const { data } = res
  return (
    <div>
      <p>Calendar: {data.title}</p>
      {data.description && <p>{data.description}</p>}
    </div>
  )
}
