import type { Matchers } from '../setup'

export const urlMatchers: Matchers = {
  toBeSameUrl(received: string, expected: string) {
    const expectedUrl = new URL(expected)
    const receivedUrl = new URL(received)

    if (expectedUrl.origin !== receivedUrl.origin)
      return {
        message: () =>
          `expected ${received} to have origin ${expectedUrl.origin}`,
        pass: false
      }

    if (expectedUrl.pathname !== receivedUrl.pathname)
      return {
        message: () =>
          `expected ${received} to have pathname ${expectedUrl.pathname}`,
        pass: false
      }

    expectedUrl.searchParams.sort()
    receivedUrl.searchParams.sort()

    if (expectedUrl.search !== receivedUrl.search)
      return {
        message: () =>
          `expected ${received} to have search ${expectedUrl.search}`,
        pass: false
      }

    return {
      message: () => `expected ${received} to be same url as ${expected}`,
      pass: true
    }
  }
}
