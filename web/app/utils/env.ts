export function assertEnv(
  env: string | undefined,
  key?: string
): asserts env is string {
  if (!env) {
    throw new Error(`${key} is not defined`)
  }
}

export const getEnv = (key: string): string => {
  const env = process.env[key]
  assertEnv(env, key)
  return env
}
