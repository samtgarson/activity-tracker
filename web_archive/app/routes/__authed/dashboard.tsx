import { DashboardFetcher } from '@/app/services/fetchers/dashboard-fetcher'
import { getUser } from '@/app/utils/auth.server'
import { ResultType } from '@/app/utils/service'
import { json, LoaderFunction, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request)
  const fetcher = new DashboardFetcher()
  const result = await fetcher.call(user)

  if (!result.success && result.code === 'no_calendar')
    return redirect('/welcome')
  return json(result)
}

export default function Dashboard() {
  const res = useLoaderData<ResultType<DashboardFetcher>>()

  if (!res.success) return <p>{res.code}</p>

  const {
    data: { calendar, events }
  } = res
  const lastEvent = events[events.length - 1]
  return (
    <div>
      <p>Calendar: {calendar.title}</p>
      {calendar.description && <p>{calendar.description}</p>}
      {lastEvent ? (
        <p>Last event: {lastEvent.title}</p>
      ) : (
        <p>No events today</p>
      )}
    </div>
  )
}
