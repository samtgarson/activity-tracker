
export function assertEnv (env: string | undefined): asserts env is string {
  if (!env) {
    throw new Error(`${env} is not defined`);
  }
}
