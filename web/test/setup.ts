import { installGlobals } from '@remix-run/node'

// This installs globals such as "fetch", "Response", "Request" and "Headers".
installGlobals()

console.error = vi.fn()
console.log = vi.fn()
