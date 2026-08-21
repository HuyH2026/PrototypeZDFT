import { defineConfig, configDefaults } from 'vitest/config'
import path from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Playwright specs in e2e/ run under `pnpm e2e`, not vitest.
    //
    // Dot-directories are excluded wholesale because several of them hold a
    // second copy of this suite: `.worktrees/` keeps sibling git worktrees, and
    // `.pnpm-store/` is a local content-addressable store holding package
    // sources. Without the exclusion a bare `vitest run` collects hundreds of
    // extra files (237 duplicate specs in `.worktrees/` alone) and reports
    // thousands of spurious failures instead of this repo's 218.
    exclude: [...configDefaults.exclude, 'e2e/**', '**/.*/**'],
  },
})
