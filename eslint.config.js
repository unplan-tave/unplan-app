// @ts-check
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const importPlugin = require('eslint-plugin-import');
const reactHooksPlugin = require('eslint-plugin-react-hooks');

// ---------------------------------------------------------------------------
// Shared pattern groups for component-tier boundary rules
// Docs: docs/conventions/component-decomposition.md
// Import direction: screens → features → domain → UI (one-way only)
// ---------------------------------------------------------------------------

const STORE_QUERY_BOUNDARY = [
  {
    group: [
      '@/domains/*/use-*-store',
      '@/domains/*/use-*-store.*',
      '**/domains/*/use-*-store',
      '**/domains/*/use-*-store.*',
    ],
    message: 'Store hooks belong in screens (or screen hooks). Pass resolved data as props.',
  },
  {
    group: ['@tanstack/react-query', '@tanstack/react-query/*'],
    message: 'React Query belongs in screens (or screen hooks). Pass resolved data as props.',
  },
  {
    group: [
      '@/lib/api',
      '@/lib/api/*',
      '@/lib/api/**',
      '**/lib/api',
      '**/lib/api/*',
      '**/lib/api/**',
    ],
    message: 'API calls belong in screens (or screen hooks). Pass resolved data as props.',
  },
];

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  // Global ignores
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'src/lib/api/endpoints/**',
      'src/lib/api/model/**',
      'babel.config.js',
      'eslint.config.js',
      'metro.config.js',
    ],
  },
  // TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        process: 'readonly',
        console: 'readonly',
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

      // Console
      'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],

      // Import ordering: builtin → external → internal → type
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['type'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // ---------------------------------------------------------------------------
  // Component-tier boundary: store/query forbidden in ALL components
  // ---------------------------------------------------------------------------
  {
    files: ['src/components/**/*.ts', 'src/components/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [...STORE_QUERY_BOUNDARY] },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // UI layer — cannot import domain, features, or screens
  // (overrides the general components rule above for ui/ files)
  // ---------------------------------------------------------------------------
  {
    files: ['src/components/ui/**/*.ts', 'src/components/ui/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/components/domain',
                '@/components/domain/*',
                '@/components/domain/**',
                '**/components/domain',
                '**/components/domain/*',
                '**/components/domain/**',
              ],
              message: 'UI layer cannot import from domain layer.',
            },
            {
              group: [
                '@/components/features',
                '@/components/features/*',
                '@/components/features/**',
                '**/components/features',
                '**/components/features/*',
                '**/components/features/**',
              ],
              message: 'UI layer cannot import from features layer.',
            },
            {
              group: [
                '@/screens',
                '@/screens/*',
                '@/screens/**',
                '**/screens',
                '**/screens/*',
                '**/screens/**',
              ],
              message: 'UI layer cannot import from screens.',
            },
            ...STORE_QUERY_BOUNDARY,
          ],
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Domain layer — cannot import features or screens
  // ---------------------------------------------------------------------------
  {
    files: ['src/components/domain/**/*.ts', 'src/components/domain/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/components/features',
                '@/components/features/*',
                '@/components/features/**',
                '**/components/features',
                '**/components/features/*',
                '**/components/features/**',
              ],
              message: 'Domain layer cannot import from features layer.',
            },
            {
              group: [
                '@/screens',
                '@/screens/*',
                '@/screens/**',
                '**/screens',
                '**/screens/*',
                '**/screens/**',
              ],
              message: 'Domain layer cannot import from screens.',
            },
            ...STORE_QUERY_BOUNDARY,
          ],
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Features layer — cannot import screens
  // Cross-feature imports (features/A → features/B) will be enforced
  // per-feature as features are populated.
  // ---------------------------------------------------------------------------
  {
    files: ['src/components/features/**/*.ts', 'src/components/features/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/screens',
                '@/screens/*',
                '@/screens/**',
                '**/screens',
                '**/screens/*',
                '**/screens/**',
              ],
              message: 'Features layer cannot import from screens.',
            },
            ...STORE_QUERY_BOUNDARY,
          ],
        },
      ],
    },
  },
];
