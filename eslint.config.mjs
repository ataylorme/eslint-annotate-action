import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import pluginVue from 'eslint-plugin-vue'
import eslintConfigPrettier from "eslint-config-prettier";
import diff from 'eslint-plugin-diff';
import globals from "globals";


export default [
    {
        ignores: [
            "!.github",
            "node_modules/**",
            "**/*.js",
        ]
    },
    eslint.configs.recommended,
    importPlugin.flatConfigs.recommended,
    importPlugin.flatConfigs.typescript,
    ...tseslint.configs.recommended,
    {
        plugins: {
            'typescript-eslint': tseslint.plugin,
            diff,
        },
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest
            },
            ecmaVersion: 2022,
            parserOptions: {
                parser: tseslint.parser,
                sourceType: 'module',
            },
        },
        settings: {
            "import/resolver": {
                typescript: {
                    project: "./tsconfig.json",
                },
            },
        },
    },
    // remove any rules that prettier handles for us
    eslintConfigPrettier,
];
