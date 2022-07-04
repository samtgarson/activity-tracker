export const createMockService = <R>(success: boolean, result: R) =>
  vi.fn(() => ({
    call: vi.fn(async () => ({ success, data: result, error: undefined }))
  }))
