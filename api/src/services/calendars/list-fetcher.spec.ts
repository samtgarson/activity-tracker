import { mockContext } from "spec/util"
import { Calendar, Provider } from "src/models/types"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CalendarFetcher, CalendarFetcherDeps } from "./fetcher"

describe("CalendarFetcher", () => {
  const deps = {
    google: {
      getCalendar: vi.fn(),
    },
  } satisfies CalendarFetcherDeps
  const account = mockContext.activeAccount
  const fetcher = new CalendarFetcher(mockContext, deps)
  const calendarId = "123"

  describe("for google", () => {
    beforeEach(() => {
      vi.spyOn(account, "provider", "get").mockReturnValue(Provider.Google)
    })

    it("should call google fetcher", async () => {
      await fetcher.call(calendarId)
      expect(deps.google.getCalendar).toHaveBeenCalledWith(
        account.accessToken,
        calendarId,
      )
    })

    it("should return the correct data", async () => {
      const data = [{ id: 1 }] as unknown as Calendar[]
      deps.google.getCalendar.mockResolvedValue({ success: true, data })

      const result = await fetcher.call(calendarId)
      expect(result).toEqual({ success: true, data })
    })

    describe("when account has no access token", () => {
      beforeEach(() => {
        vi.spyOn(account, "accessToken", "get").mockReturnValue(null)
      })

      it("should return an empty array", async () => {
        const result = await fetcher.call(calendarId)
        expect(result).toEqual({ success: true, data: [] })
      })
    })
  })
})
