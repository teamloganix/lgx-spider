import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import HelloReact from './HelloReact';

describe('HelloReact component', () => {
  it('renders provided name', () => {
    render(<HelloReact name="Spider" />);
    const el = screen.getByTestId('hello-react');
    expect(el.textContent).to.include('Hello from Spider');
  });

  it('renders default name when not provided', () => {
    render(<HelloReact />);
    const el = screen.getByTestId('hello-react');
    expect(el.textContent).to.include('Hello from React');
  });
});
