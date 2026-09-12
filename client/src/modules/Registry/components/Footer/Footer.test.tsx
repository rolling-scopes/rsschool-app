import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer', () => {
  test('renders the current copyright inside a contentinfo landmark', () => {
    render(<Footer />);

    const year = new Date().getFullYear();
    expect(screen.getByText(`Copyright © The Rolling Scopes ${year}`)).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
