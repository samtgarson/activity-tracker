/* eslint-disable @typescript-eslint/no-namespace, @typescript-eslint/no-empty-interface */
import { installGlobals } from '@remix-run/node'
import { urlMatchers } from './helpers/url'

// This installs globals such as "fetch", "Response", "Request" and "Headers".
installGlobals()

console.error = vi.fn()
console.log = vi.fn()

interface CustomMatchers<R = unknown> {
  toBeSameUrl(expected: string): R
}

declare global {
  namespace Vi {
    interface Assertion extends CustomMatchers {}
    interface AsymmetricMatchersContaining extends CustomMatchers {}
  }
}

export type Matchers = Parameters<typeof expect.extend>[0]
expect.extend({
  ...urlMatchers
})
