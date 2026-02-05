module.exports = {
  env: {
    browser: false,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
    'prettier', // Disables ESLint formatting rules that conflict with Prettier
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['prettier'],
  rules: {
    // Prettier integration
    'prettier/prettier': 'error',
    
    // Airbnb overrides for Node.js/Backend development
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        ts: 'never',
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.test.ts',
          '**/*.spec.ts',
          '**/test/**/*',
          '**/tests/**/*',
          '**/vitest.config.ts',
          '**/vite.config.ts',
          '**/*.config.js',
          '**/*.config.ts',
        ],
      },
    ],
    'import/prefer-default-export': 'off', // Allow named exports
    'no-console': 'off', // Allow console.log in backend
    'class-methods-use-this': 'off', // Allow methods without 'this'
    'no-underscore-dangle': 'off', // Allow underscore dangle for private methods
    'max-len': ['error', { code: 100, ignoreComments: true }], // Reasonable line length
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Allow unused vars with underscore prefix
    'import/no-unresolved': 'off', // TypeScript handles this
    'func-names': 'off', // Allow unnamed functions
    'radix': 'off', // Allow parseInt without radix
    'import/extensions': 'off', // Allow file extensions in imports
    'no-unused-expressions': 'off', // Allow unused expressions
    'no-nested-ternary': 'off', // Allow nested ternary operators
    'consistent-return': 'off', // Allow inconsistent returns
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  },
};
