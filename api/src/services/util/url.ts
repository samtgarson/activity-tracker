export function createUrl(
  base: string | [string, string],
  ...params: Record<string, string>[]
) {
  const url =
    typeof base === "string" ? new URL(base) : new URL(base[0], base[1])
  url.search = mergeParams(
    Object.fromEntries(url.searchParams.entries()),
    ...params,
  ).toString()
  return url
}

export function mergeParams(...params: Record<string, string>[]) {
  const search = new URLSearchParams()
  const allParams = params.map<[string, string][]>(Object.entries).flat()
  allParams.forEach(([key, value]) => search.set(key, value))
  return search
}
