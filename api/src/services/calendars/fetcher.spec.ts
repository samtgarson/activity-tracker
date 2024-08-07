import { buildCalendar } from "spec/factories/calendar-factory"
import { mockContext } from "spec/util"
import { Provider } from "src/models/types"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CalendarListFetcher, CalendarListFetcherDeps } from "./list-fetcher"

const deps = {
  google: {
    getCalendarList: vi.fn(),
  },
} satisfies CalendarListFetcherDeps
const account = mockContext.activeAccount
const fetcher = new CalendarListFetcher(mockContext, deps)

describe("for google", () => {
  beforeEach(() => {
    vi.spyOn(account, "provider", "get").mockReturnValue(Provider.Google)
  })

  it("should call google fetcher", async () => {
    await fetcher.call()
    expect(deps.google.getCalendarList).toHaveBeenCalledWith(
      account.accessToken,
    )
  })

  it("should return the correct data", async () => {
    const data = [buildCalendar()]
    deps.google.getCalendarList.mockResolvedValue({ success: true, data })

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
