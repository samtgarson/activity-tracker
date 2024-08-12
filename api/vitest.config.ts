import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    clearMocks: true,
    fakeTimers: {
      toFake: ["Date"],
    },
    include: ["**/*.spec.ts"],
    globalSetup: "spec/global.ts",
    setupFiles: ["spec/setup.ts"],
    env: {
      DATABASE_URL: "file:./test.db",
    },
    coverage: {
      enabled: true,
      provider: "istanbul", // or 'v8'
      include: ["src/**/*.ts"],
    },
  },
})
