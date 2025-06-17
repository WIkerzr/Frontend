import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import json from '@eslint/json';
import { defineConfig } from 'eslint/config';

export default defineConfig([
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        plugins: { js },
        extends: ['js/recommended'],
        languageOptions: { globals: globals.browser },
        rules: {
            'no-unused-vars': 'warn', // Avisa de variables no usadas
            'no-unused-labels': 'warn', // labels no usadas
            'react/react-in-jsx-scope': 'off', // Desactiva la regla antigua
        },
        settings: {
            react: {
                version: 'detect', // Detecta automáticamente tu versión de React
            },
        },
    },
    tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    {
        files: ['**/*.json'],
        plugins: { json },
        language: 'json/json',
        extends: ['json/recommended'],
    },
]);
