import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders App without crashing', () => {
  render(<App />);
  const titleElement = screen.getByText(/AGENDA/i);
  expect(titleElement).toBeInTheDocument();
});
