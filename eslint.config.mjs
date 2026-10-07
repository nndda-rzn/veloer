import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Root config is only used as a fallback for stray files at the repo root.
// Client and server each own their ESLint config (see client/eslint.config.mjs
// and server/eslint.config.mjs) so the TypeScript parser can resolve the
// correct tsconfig per workspace. lint-staged runs ESLint from each workspace.
export default [
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/node_modules/**',
      '**/.vercel/**',
      '**/*.config.js',
      '**/*.config.mjs',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
      'no-undef': 'off',
    },
  },
];
