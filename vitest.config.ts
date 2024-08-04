import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    clearMocks: true,
    include: ["api/src/**/*.spec.ts"],
    coverage: {
      enabled: true,
      provider: "istanbul", // or 'v8'
      include: ["api/src/**/*.ts"],
    },
  },
})
