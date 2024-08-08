import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    clearMocks: true,
    fakeTimers: {
      toFake: ["Date"],
    },
    include: ["api/src/**/*.spec.ts"],
    globalSetup: "api/spec/global.ts",
    setupFiles: ["api/spec/setup.ts"],
    env: {
      DATABASE_URL: "file:./test.db",
    },
    coverage: {
      enabled: true,
      provider: "istanbul", // or 'v8'
      include: ["api/src/**/*.ts"],
    },
  },
})
