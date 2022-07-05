import { CalendarFetcher } from '@/app/services/calendars/fetcher'
import { EventListFetcher } from '@/app/services/events/list-fetcher'
import { Calendar, CalendarEvent } from '@/app/types'
import { getUser } from '@/app/utils/auth.server'
import { ServiceResult } from '@/app/utils/service'
import { json, LoaderFunction, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

type DashboardProps = ServiceResult<{
  calendar: Calendar
  events: CalendarEvent[]
}>

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request)
  const account = user.activeAccount
  if (!account?.calendarId) return redirect('/welcome')

  const calendarFetcher = new CalendarFetcher()
  const eventFetcher = new EventListFetcher()
  const [calendar, events] = await Promise.all([
    calendarFetcher.call(user, account.provider, account.calendarId),
    eventFetcher.call(user, account.provider, account.calendarId)
  ])

  if (!calendar.success) return json(calendar)
  if (!events.success) return json(events)

  return json<DashboardProps>({
    success: true,
    data: { calendar: calendar.data, events: events.data }
  })
}

export default function Dashboard() {
  const res = useLoaderData<DashboardProps>()

  if (!res.success) return <p>{res.error}</p>

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
