export const createMockService = <R>(result: R) =>
  vi.fn(() => ({
    call: vi.fn(async () => ({ data: result, error: undefined }))
  }))
