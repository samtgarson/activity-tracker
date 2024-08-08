import dayjs from "dayjs"
import { buildCalendar } from "spec/factories/calendar-factory"
import { mockContext } from "spec/util"
import { Provider } from "src/models/types"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { EventListFetcher, EventListFetcherDeps } from "./list-fetcher"

describe("EventListFetcher", () => {
  const deps = {
    google: {
      getEvents: vi.fn(),
    },
  } satisfies EventListFetcherDeps
  const account = mockContext.activeAccount
  const fetcher = new EventListFetcher(mockContext, deps)

  describe("for google", () => {
    beforeEach(() => {
      vi.spyOn(account, "provider", "get").mockReturnValue(Provider.Google)
    })

    describe("with no dates", () => {
      it("should call google fetcher with default dates", async () => {
        await fetcher.call()
        const expectedDefaultDates = {
          from: dayjs().startOf("day"),
          to: dayjs().endOf("day"),
        }
        expect(deps.google.getEvents).toHaveBeenCalledWith(
          account.accessToken,
          account.calendarId,
          expectedDefaultDates,
        )
      })
    })

    describe("with dates", () => {
      it("should call google fetcher", async () => {
        const dates = {
          from: dayjs().startOf("day"),
          to: dayjs().add(1, "day").endOf("day"),
        }

        await fetcher.call(dates)
        expect(deps.google.getEvents).toHaveBeenCalledWith(
          account.accessToken,
          account.calendarId,
          dates,
        )
      })
    })

    it("should return the correct data", async () => {
      const data = [buildCalendar()]
      deps.google.getEvents.mockResolvedValue({ success: true, data })

      const result = await fetcher.call()
      expect(result).toEqual({ success: true, data })
    })

    describe("when account has no access token", () => {
      beforeEach(() => {
        vi.spyOn(account, "accessToken", "get").mockReturnValue(null)
      })

      it("should return an empty array", async () => {
        const result = await fetcher.call()
        expect(result).toEqual({ success: true, data: [] })
      })
    })
  })
})
