import { JSONParsed } from "hono/utils/types"

export function json<T>(obj: T): JSONParsed<T> {
  return JSON.parse(JSON.stringify(obj)) as JSONParsed<T>
}
