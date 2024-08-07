import { buildCalendar } from "spec/factories/calendar-factory"
import { mockContext } from "spec/util"
import { Provider } from "src/models/types"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CalendarCreator, CalendarCreatorDeps } from "./creator"

describe("CalendarCreator", () => {
  const deps = {
    google: {
      createCalendar: vi.fn(),
    },
  } satisfies CalendarCreatorDeps
  const account = mockContext.activeAccount
  const fetcher = new CalendarCreator(mockContext, deps)
  const calendarTitle = "title"

  describe("for google", () => {
    beforeEach(() => {
      vi.spyOn(account, "provider", "get").mockReturnValue(Provider.Google)
    })

    it("should call google creator", async () => {
      await fetcher.call(calendarTitle)
      expect(deps.google.createCalendar).toHaveBeenCalledWith(
        account.accessToken,
        calendarTitle,
      )
    })

    it("should return the correct data", async () => {
      const data = [buildCalendar()]
      deps.google.createCalendar.mockResolvedValue({ success: true, data })

      const result = await fetcher.call(calendarTitle)
      expect(result).toEqual({ success: true, data })
    })

    describe("when account has no access token", () => {
      beforeEach(() => {
        vi.spyOn(account, "accessToken", "get").mockReturnValue(null)
      })

      it("should return an empty array", async () => {
        const result = await fetcher.call(calendarTitle)
        expect(result).toEqual({
          success: false,
          code: "auth_failed",
          data: undefined,
        })
      })
    })
  })
})
