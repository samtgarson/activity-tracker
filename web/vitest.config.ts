import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vitest-tsconfig-paths' // eslint-disable-line import/no-extraneous-dependencies

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    setupFiles: ['./test/setup.ts'],
    clearMocks: true,
    coverage: {
      all: true,
      src: ['./app'],
      exclude: [
        'test/**/*',
        'app/entry.client.tsx',
        'app/entry.server.tsx',
        'app/root.tsx',
        '**/*.d.ts',
        '**/*.spec.{ts,tsx}'
      ]
    }
  }
})
