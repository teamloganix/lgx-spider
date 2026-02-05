import { expect, test } from 'vitest';
import { JSDOM } from 'jsdom';
import { getByText } from '@testing-library/dom';

test('renders slot content', async () => {
  const html = `
    <div>
      <span>Hello Component</span>
    </div>
  `;
  const dom = new JSDOM(html);
  const { document } = dom.window;
  expect(getByText(document.body, 'Hello Component')).toBeDefined();
});
