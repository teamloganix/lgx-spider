export default {
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  tabWidth: 2,
  useTabs: false,
  printWidth: 100,
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  overrides: [
    { files: '*.json', options: { printWidth: 80 } },
    { files: '*.md', options: { printWidth: 80, proseWrap: 'always' } },
  ],
};
