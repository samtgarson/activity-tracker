export function createUrl(base: string, ...params: Record<string, string>[]) {
  const url = new URL(base)
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
