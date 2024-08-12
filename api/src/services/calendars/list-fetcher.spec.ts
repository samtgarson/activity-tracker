import { buildAccount } from "spec/factories/account-factory"
import { buildCalendar } from "spec/factories/calendar-factory"
import { mockContext } from "spec/util"
import { Provider } from "src/models/types"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CalendarFetcher, CalendarFetcherDeps } from "./fetcher"

describe("CalendarFetcher", () => {
  const deps = {
    google: {
      getCalendar: vi.fn(),
    },
  } satisfies CalendarFetcherDeps
  const account = buildAccount()
  const fetcher = new CalendarFetcher(mockContext, deps)
  const calendarId = "123"

  describe("for google", () => {
    beforeEach(() => {
      vi.spyOn(account, "provider", "get").mockReturnValue(Provider.Google)
    })

    it("should call google fetcher", async () => {
      await fetcher.call(account, calendarId)
      expect(deps.google.getCalendar).toHaveBeenCalledWith(
        account.accessToken,
        calendarId,
      )
    })

    it("should return the correct data", async () => {
      const data = [buildCalendar()]
      deps.google.getCalendar.mockResolvedValue({ success: true, data })

      const result = await fetcher.call(account, calendarId)
      expect(result).toEqual({ success: true, data })
    })

    describe("when account has no access token", () => {
      beforeEach(() => {
        vi.spyOn(account, "accessToken", "get").mockReturnValue(null)
      })

      it("should return a null", async () => {
        const result = await fetcher.call(account, calendarId)
        expect(result).toEqual({ success: true, data: null })
      })
    })
  })
})
