import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import { defineConfig } from 'eslint/config';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig([
    {
        ignores: ['src/components/Icon/**', 'node_modules', 'dist', 'build', '.vscode/**', '**/*.json'],
    },
    {
        files: ['**/*.{js,mjs,cjs,jsx}'],
        languageOptions: { globals: globals.browser },
    },
    js.configs.recommended,
    {
        files: ['**/*.{ts,tsx,mts,cts}'],
        languageOptions: {
            globals: {
                React: 'readonly',
                ...globals.browser,
            },
            parser: {
                path: '@typescript-eslint/parser',
            },
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: __dirname,
                sourceType: 'module',
            },
        },
    },
    ...tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        rules: {
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'no-console': 'off',
            'no-undef': 'error',
            'no-unused-vars': ['warn', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
            'no-unused-labels': 'warn',
            'react/display-name': 'off',
        },
        settings: {
            react: {
                version: 'detect',
                jsxRuntime: 'automatic',
            },
        },
    },
]);
