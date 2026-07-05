import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer', () => {
  test('renders the copyright line with the current year', () => {
    render(<Footer />);

    const year = new Date().getFullYear();
    expect(screen.getByText(`Copyright © The Rolling Scopes ${year}`)).toBeInTheDocument();
  });

  test('renders inside a contentinfo landmark', () => {
    render(<Footer />);

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
