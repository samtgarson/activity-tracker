import * as Radio from '@/app/components/form/radio'
import {
  NEW_CALENDAR_KEY,
  validator
} from '@/app/services/forms/calendar-chooser-form-processor'
import { Calendar } from '@/app/types'
import { FC } from 'react'
import { ValidatedForm } from 'remix-validated-form'
import { Input } from '../form/input'
import { Submit } from '../form/submit'

export type CalendarChooserFormProps = {
  calendars: Calendar[]
}

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
        <Radio.Item value={NEW_CALENDAR_KEY}>
          {({ checked }) =>
            checked ? (
              <Input
                className='bg-gray-50 block'
                type='text'
                name='newCalendarTitle'
                autoFocus
              >
                Create a new calendar
              </Input>
            ) : (
              'Create a new calendar'
            )
          }
        </Radio.Item>
      </Radio.Root>
      <Submit />
    </ValidatedForm>
  )
}
