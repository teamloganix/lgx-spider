module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.test.{ts,tsx,js,jsx}',
          '**/*.spec.{ts,tsx,js,jsx}',
          '**/test/**/*',
          '**/tests/**/*',
          '**/vitest.config.ts',
          '**/vite.config.ts',
          '**/*.config.js',
          '**/*.config.ts',
        ],
      },
    ],
    'import/prefer-default-export': 'off',
    'no-console': 'off',
    'class-methods-use-this': 'off',
    'no-underscore-dangle': 'off',
    'max-len': ['error', { code: 110, ignoreComments: true }],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'import/no-unresolved': 'off',
    'func-names': 'off',
    'radix': 'off',
    'import/extensions': 'off',
    'no-unused-expressions': 'off',
    'no-nested-ternary': 'off',
    'consistent-return': 'off',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts', '.jsx', '.tsx'],
      },
    },
  },
  overrides: [
    {
      files: ['**/*.test.{ts,tsx,js,jsx}', '**/*.spec.{ts,tsx,js,jsx}'],
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        test: 'readonly',
      },
      rules: {
        'no-promise-executor-return': 'off',
      },
    },
  ],
}


