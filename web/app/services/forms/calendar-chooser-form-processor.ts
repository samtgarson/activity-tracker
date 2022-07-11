import { User } from '@/app/models/user'
import { Account } from '@/app/types'
import { Service } from '@/app/utils/service'
import { withZod } from '@remix-validated-form/with-zod'
import { Validator, ValidatorError } from 'remix-validated-form'
import { z } from 'zod'
import { CalendarChooser } from '../calendars/chooser'
import { CalendarCreator, CalendarCreatorErrors } from '../calendars/creator'

type CalendarChooserFormModel = z.infer<typeof schema>

export const schema = z.object({
  calendarId: z.string(),
  newCalendarTitle: z
    .string()
    .min(1, { message: 'Please give your new calendar a name' })
    .optional(),
  provider: z.literal('google')
})

export const validator: Validator<CalendarChooserFormModel> = withZod(schema)

export const NEW_CALENDAR_KEY = '__new__'

type CalendarChooserFormModelErrors = CalendarCreatorErrors & {
  missing_account: undefined
  invalid_request: ValidatorError
}

export class CalendarChooserFormProcessor extends Service<
  null,
  CalendarChooserFormModelErrors
> {
  constructor(
    private calendarChooser = new CalendarChooser(),
    private calendarCreator = new CalendarCreator()
  ) {
    super()
  }

  async call(user: User, form: FormData) {
    const account = user.activeAccount
    if (!account) {
      return this.failure('missing_account')
    }

    const validatorResult = await this.validateForm(form)
    if (!validatorResult.success) return validatorResult

    let chosenId = validatorResult.data.calendarId

    if (validatorResult.data.newCalendarTitle) {
      const creatorResult = await this.createCalendar(
        user,
        account,
        validatorResult.data.newCalendarTitle
      )
      if (!creatorResult.success) return creatorResult
      chosenId = creatorResult.data
    }

    return this.calendarChooser.call(user, account.provider, chosenId)
  }

  private async validateForm(form: FormData) {
    const formResult = await validator.validate(form)
    if (formResult.error) {
      return this.failure('invalid_request', formResult.error)
    }

    return this.success(formResult.data)
  }

  private async createCalendar(user: User, account: Account, title: string) {
    const res = await this.calendarCreator.call(user, account.provider, title)
    if (!res.success) {
      return this.failure(res.code)
    }
    return this.success(res.data.id)
  }
}
