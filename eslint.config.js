import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  // shadcn/ui components ship helper hooks (useSidebar, toggleVariants…) alongside
  // the component export by design; react-refresh strictness would force a rewrite.
  {
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
      'react-hooks/purity': 'off',
    },
  },
  // Store colocates the Provider with its consumer hook + a couple of small utils —
  // splitting would spray imports across the codebase for a hot-reload nicety.
  {
    files: ['src/lib/store.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
