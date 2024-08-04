export type GatewayErrors = {
  server_error: unknown
  request_failed: global.Response
  auth_failed: global.Response
  invalid_response: null
}
