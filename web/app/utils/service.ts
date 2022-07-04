export type ServiceResultSuccess<T = null> = { success: true; data: T }
export type ServiceResultError = { success: false; error: string }
export type ServiceResult<T = null> =
  | ServiceResultSuccess<T>
  | ServiceResultError

export class Svc {
  static success<T>(data: T): ServiceResultSuccess<T> {
    return { success: true, data: data }
  }

  static error(error: string): ServiceResultError {
    return { success: false, error }
  }
}
