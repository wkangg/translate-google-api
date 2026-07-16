import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';
import nodePlugin from 'eslint-plugin-n';
import unicorn from 'eslint-plugin-unicorn';
import tseslint from 'typescript-eslint';

const typescriptConfigs = tseslint.configs.recommendedTypeChecked.map(config => ({
    ...config,
    files: ['**/*.ts']
}));

const sharedRules = {
    '@stylistic/arrow-parens': ['error', 'as-needed'],
    '@stylistic/brace-style': ['error', '1tbs'],
    '@stylistic/comma-dangle': ['error', 'never'],
    '@stylistic/eol-last': ['warn', 'always'],
    '@stylistic/indent': ['error', 4, { SwitchCase: 1 }],
    '@stylistic/no-extra-parens': ['error', 'all'],
    '@stylistic/no-extra-semi': 'warn',
    '@stylistic/no-multiple-empty-lines': 'warn',
    '@stylistic/no-trailing-spaces': 'warn',
    '@stylistic/quotes': ['warn', 'single', { avoidEscape: true }],
    '@stylistic/semi': ['error', 'always'],
    '@stylistic/space-before-function-paren': [
        'error',
        { anonymous: 'never', named: 'never', asyncArrow: 'always' }
    ],
    '@stylistic/space-infix-ops': 'off',
    'dot-notation': 'warn',
    'n/file-extension-in-import': ['error', 'always'],
    'n/no-deprecated-api': 'error',
    'n/no-unsupported-features/node-builtins': 'off',
    'n/prefer-global/buffer': ['error', 'always'],
    'n/prefer-global/console': ['error', 'always'],
    'n/prefer-global/process': ['error', 'always'],
    'n/prefer-global/url': ['error', 'always'],
    'n/prefer-global/url-search-params': ['error', 'always'],
    'n/prefer-promises/dns': 'error',
    'no-constant-condition': 'off',
    'no-lonely-if': 'error',
    'prefer-object-has-own': 'error',
    'unicorn/filename-case': 'off',
    'unicorn/no-array-for-each': 'off',
    'unicorn/no-nested-ternary': 'off',
    'unicorn/no-null': 'off',
    'unicorn/numeric-separators-style': 'off',
    'unicorn/prefer-code-point': 'off',
    'unicorn/prefer-global-this': 'off',
    'unicorn/prefer-module': 'off',
    'unicorn/prefer-number-properties': 'off',
    'unicorn/prefer-string-replace-all': 'error',
    'unicorn/prefer-top-level-await': 'off',
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/switch-case-braces': ['error', 'avoid'],
    'unicorn/text-encoding-identifier-case': 'off',
    'yoda': ['error', 'never', { exceptRange: true }]
};

export default tseslint.config(
    { ignores: ['dist/**'] },
    eslint.configs.recommended,
    nodePlugin.configs['flat/recommended'],
    unicorn.configs.recommended,
    ...typescriptConfigs,
    {
        files: ['**/*.{js,ts}'],
        plugins: { '@stylistic': stylistic },
        languageOptions: { globals: globals.node },
        rules: sharedRules
    },
    {
        files: ['**/*.ts'],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname
            }
        },
        rules: {
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/no-non-null-assertion': 'off'
        }
    },
    {
        files: ['test/**/*.ts'],
        rules: {
            'unicorn/no-global-object-property-assignment': 'off',
            'unicorn/no-unnecessary-global-this': 'off'
        }
    }
);
