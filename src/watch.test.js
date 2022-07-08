import React from 'react';
import { render, screen } from '@testing-library/react';
import Watch from './watch';

test('renders learn react link', () => {
  render(<Watch />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
