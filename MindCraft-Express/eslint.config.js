// eslint.config.js
import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

export default defineConfig([
  // 1) Ignore stuff
  {
    ignores: ['node_modules', 'dist', 'build', 'coverage'],
  },

  // 2) JS + TS recommended rules
  js.configs.recommended,
  ...tseslint.configs.recommended, // from `typescript-eslint`
  // For type-aware rules, you’d use recommendedTypeChecked + parserOptions.projectService later.

  // 3) Project-specific
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // 4) Disable rules conflicting with Prettier
  eslintConfigPrettier,
]);
