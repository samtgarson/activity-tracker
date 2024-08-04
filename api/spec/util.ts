import { ServiceInput } from "src/services/base"

export const mockContext: ServiceInput = {
  env: {
    GOOGLE_CLIENT_ID: "123",
    GOOGLE_CLIENT_SECRET: "456",
    JWT_SECRET: "789",
  },
  url: new URL("http://localhost"),
}
