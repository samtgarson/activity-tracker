import { buildAccount } from "spec/factories/account-factory"
import { buildCalendar } from "spec/factories/calendar-factory"
import { mockContext } from "spec/util"
import { Provider } from "src/models/types"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CalendarCreator, CalendarCreatorDeps } from "./creator"

describe("CalendarCreator", () => {
  const deps: CalendarCreatorDeps = {
    google: {
      createCalendar: vi.fn(),
      addCalendarToList: vi.fn(),
    },
  }
  const account = buildAccount()
  const fetcher = new CalendarCreator(mockContext, deps)
  const calendarTitle = "title"

  describe("for google", () => {
    beforeEach(() => {
      vi.spyOn(account, "provider", "get").mockReturnValue(Provider.Google)
    })

    describe("when google creator succeeds", () => {
      const data = { id: "id" }
      beforeEach(() => {
        vi.mocked(deps.google.createCalendar).mockResolvedValue({
          success: true,
          data,
        })
      })

      describe("when google inserter succeeds", () => {
        const calendar = buildCalendar()

        beforeEach(() => {
          vi.mocked(deps.google.addCalendarToList).mockResolvedValue({
            success: true,
            data: calendar,
          })
        })

        it("should call google creator", async () => {
          await fetcher.call(account, calendarTitle)
          expect(deps.google.createCalendar).toHaveBeenCalledWith(
            account.accessToken,
            calendarTitle,
          )
        })

        it("should call google inserter", async () => {
          await fetcher.call(account, calendarTitle)
          expect(deps.google.addCalendarToList).toHaveBeenCalledWith(
            account.accessToken,
            data.id,
            "#000000",
            "#FFB5B4",
          )
        })

        it("should return the correct data", async () => {
          const result = await fetcher.call(account, calendarTitle)
          expect(result).toEqual({ success: true, data: calendar })
        })
      })

      describe("when google inserter fails", () => {
        beforeEach(() => {
          vi.mocked(deps.google.addCalendarToList).mockResolvedValue({
            success: false,
            code: "request_failed",
            data: undefined,
          })
        })

        it("should return the correct data", async () => {
          const result = await fetcher.call(account, calendarTitle)

          expect(result).toEqual({
            success: false,
            code: "request_failed",
            data: undefined,
          })
        })
      })
    })

    describe("when google creator fails", () => {
      beforeEach(() => {
        vi.mocked(deps.google.createCalendar).mockResolvedValue({
          success: false,
          code: "request_failed",
          data: undefined,
        })
      })

      it("should return the correct data", async () => {
        const result = await fetcher.call(account, calendarTitle)

        expect(result).toEqual({
          success: false,
          code: "request_failed",
          data: undefined,
        })
      })

      it("should not call google inserter", async () => {
        await fetcher.call(account, calendarTitle)
        expect(deps.google.addCalendarToList).not.toHaveBeenCalled()
      })
    })

    describe("when account has no access token", () => {
      beforeEach(() => {
        vi.spyOn(account, "accessToken", "get").mockReturnValue(null)
      })

      it("should return an empty array", async () => {
        const result = await fetcher.call(account, calendarTitle)
        expect(result).toEqual({
          success: false,
          code: "auth_failed",
          data: undefined,
        })
      })
    })
  })
})
