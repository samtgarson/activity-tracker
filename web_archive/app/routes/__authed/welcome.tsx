import { CalendarChooserForm } from '@/app/components/calendar-chooser-form'
import { CalendarListFetcher } from '@/app/services/calendars/list-fetcher'
import { CalendarChooserFormProcessor } from '@/app/services/forms/calendar-chooser-form-processor'
import { getUser } from '@/app/utils/auth.server'
import { ResultType } from '@/app/utils/service'
import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { validationError } from 'remix-validated-form'

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request)
  if (user.activeAccount?.calendarId) return redirect('/dashboard')

  const fetcher = new CalendarListFetcher()
  const data = await fetcher.call(user, 'google')

  return json(data)
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const user = await getUser(request)

  const formModel = new CalendarChooserFormProcessor()
  const result = await formModel.call(user, formData)

  if (result.success) return redirect('/dashboard')
  result
  if (result.code === 'invalid_request' && result.data) {
    return validationError(result.data)
  }

  return redirect('/dashboard')
}

export default function Welcome() {
  const res = useLoaderData<ResultType<CalendarListFetcher>>()

  if (!res.success) return <p>{res.code}</p>

  return (
    <div>
      <p>{res.data.length} calendars</p>
      <CalendarChooserForm calendars={res.data} />
    </div>
  )
}
