import {
  CalendarChooserForm,
  validator
} from '@/app/components/calendar-chooser-form'
import { CalendarChooser } from '@/app/services/calendars/chooser'
import { CalendarListFetcher } from '@/app/services/calendars/list-fetcher'
import { Calendar } from '@/app/types'
import { getUser } from '@/app/utils/auth.server'
import { ServiceResult } from '@/app/utils/service'
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
  const formResult = await validator.validate(await request.formData())

  if (formResult.error) {
    return validationError(formResult.error)
  }

  const { provider, calendarId } = formResult.data
  const chooser = new CalendarChooser()
  const user = await getUser(request)

  await chooser.call(user, provider, calendarId)
  return redirect('/dashboard')
}

export default function Welcome() {
  const res = useLoaderData<ServiceResult<Calendar[]>>()

  if (!res.success) return <p>{res.error}</p>

  return (
    <div>
      <p>{res.data.length} calendars</p>
      <CalendarChooserForm calendars={res.data} />
    </div>
  )
}
