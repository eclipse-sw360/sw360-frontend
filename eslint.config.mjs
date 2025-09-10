import eslint from '@eslint/js'
import prettierPlugin from 'eslint-plugin-prettier'
import { globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'
import nextPlugin from '@next/eslint-plugin-next'

export default tseslint.config(
    globalIgnores([
        '**/cypress',
        '.next',
        '.storybook',
        'cypress.config.ts',
        'commitlint.config.js',
        'global.d.ts',
        'next.config.js',
        'next-env.d.ts',
    ]),

    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },

    //NextJS rules
    {
        files: ['src/**/*.{ts,tsx}'],
        plugins: {
            '@next/next': nextPlugin,
        },
        rules: {
            ...nextPlugin.configs.recommended.rules,
        },
    },

    // Typescript base rules
    {
        files: ['src/**/*.{ts,tsx}'],
        rules: {
            '@typescript-eslint/no-explicit-any': ['warn', { fixToUnknown: false }],
            '@typescript-eslint/no-unused-vars': [
                'error',
                { vars: 'all', args: 'after-used', ignoreRestSiblings: false },
            ],
            '@typescript-eslint/await-thenable': 'warn',
            '@typescript-eslint/no-base-to-string': 'warn',
            '@typescript-eslint/no-floating-promises': 'warn',
            '@typescript-eslint/no-misused-promises': 'warn',
            '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
            '@typescript-eslint/no-unsafe-argument': 'warn',
            '@typescript-eslint/no-unsafe-assignment': 'warn',
            '@typescript-eslint/no-unsafe-member-access': 'warn',
            '@typescript-eslint/no-unsafe-return': 'warn',
            '@typescript-eslint/restrict-template-expressions': 'warn',
            '@typescript-eslint/no-unsafe-enum-comparison': 'warn',
        },
    },

    // Non flat config plugins
    {
        files: ['src/**/*.{js,jsx,ts,tsx,html,yml,json}'],
        plugins: {
            prettier: prettierPlugin,
        },
        rules: {
            'prettier/prettier': 'error', // Or "error" if you want strict formatting
        },
    },
)
