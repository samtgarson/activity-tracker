import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vitest-tsconfig-paths' // eslint-disable-line import/no-extraneous-dependencies

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    setupFiles: ['./test/setup.ts'],
    coverage: {
      all: true,
      src: ['./app']
    }
  }
})
