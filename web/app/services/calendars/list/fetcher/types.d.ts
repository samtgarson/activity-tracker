import { Calendar, ServiceResult } from '@/app/types'

export interface CalendarFetcher {
  call(accessToken: string): Promise<ServiceResult<Calendar[]>>
}
