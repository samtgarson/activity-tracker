export const isError = (error: unknown): error is Error => {
  return error instanceof Error
}

export const errorMessage = (error: unknown): string => {
  if (isError(error)) {
    return error.message
  }
  return String(error)
}
