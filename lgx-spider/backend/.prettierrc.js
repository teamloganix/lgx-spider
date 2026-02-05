export default {
  // Basic formatting
  semi: true, // Always use semicolons
  singleQuote: true, // Use single quotes instead of double quotes
  quoteProps: 'as-needed', // Only add quotes around object properties where required
  
  // Indentation (matches your project's existing style)
  tabWidth: 2, // 2 spaces for indentation
  useTabs: false, // Use spaces instead of tabs
  
  // Line formatting
  printWidth: 100, // Wrap lines at 100 characters
  trailingComma: 'es5', // Add trailing commas where valid in ES5
  bracketSpacing: true, // Add spaces inside object brackets { foo: bar }
  bracketSameLine: false, // Put > on a new line for JSX
  
  // Arrow functions
  arrowParens: 'avoid', // Omit parens when possible: x => x
  
  // End of line
  endOfLine: 'lf', // Use LF line endings (Unix-style)
  
  // Override for specific file types
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
      },
    },
  ],
};