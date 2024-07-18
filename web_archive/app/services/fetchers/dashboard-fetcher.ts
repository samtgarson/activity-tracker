import { User } from '@/app/models/user'
import { Calendar, CalendarEvent } from '@/app/types'
import { Service } from '@/app/utils/service'
import { CalendarFetcher } from '../calendars/fetcher'
import { EventListFetcher } from '../events/list-fetcher'

export type DashboardProps = {
  calendar: Calendar
  events: CalendarEvent[]
}

type DashboardFetcherErrors = {
  no_calendar: undefined
}

export class DashboardFetcher extends Service<
  DashboardProps,
  DashboardFetcherErrors
> {
  constructor(
    private calendarFetcher: CalendarFetcher = new CalendarFetcher(),
    private eventListFetcher: EventListFetcher = new EventListFetcher()
  ) {
    super()
  }

  async call(user: User) {
    const account = user.activeAccount
    if (!account?.calendarId) return this.failure('no_calendar')

    const [calendar, events] = await Promise.all([
      this.calendarFetcher.call(user, account.provider, account.calendarId),
      this.eventListFetcher.call(user, account.provider, account.calendarId)
    ])

    if (!calendar.success) return calendar
    if (!events.success) return events

    return this.success({ calendar: calendar.data, events: events.data })
  }
}
