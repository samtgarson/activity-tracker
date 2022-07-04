import { Calendar } from '@/app/types'
import { withZod } from '@remix-validated-form/with-zod'
import { FC } from 'react'
import { ValidatedForm } from 'remix-validated-form'
import { z } from 'zod'
import * as Radio from '@/app/components/form/radio'
import { Submit } from '../form/submit'

export type CalendarChooserFormProps = {
  calendars: Calendar[]
}

export const validator = withZod(
  z.object({
    calendarId: z.string(),
    provider: z.literal('google')
  })
)

export const CalendarChooserForm: FC<CalendarChooserFormProps> = ({
  calendars
}) => {
  return (
    <ValidatedForm method='post' validator={validator}>
      <input type='hidden' name='provider' value='google' />
      <Radio.Root label='Choose a calendar to track' name='calendarId'>
        {calendars.map((calendar) => (
          <Radio.Item
            value={calendar.id}
            disabled={!calendar.writeAccess}
            key={calendar.id}
          >
            {calendar.title}
          </Radio.Item>
        ))}
      </Radio.Root>
      <Submit />
    </ValidatedForm>
  )
}
