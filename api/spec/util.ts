import { InputRequest } from "src/services/base"

export const mockContext: InputRequest = {
  env: {
    GOOGLE_CLIENT_ID: "123",
    GOOGLE_CLIENT_SECRET: "456",
    JWT_SECRET: "789",
  },
  url: new URL("http://localhost"),
}
