import { render, screen } from '@testing-library/react';
import { Feedback } from './Feedback';

describe('Footer Feedback', () => {
  it('renders the Feedback section title', () => {
    render(<Feedback />);
    expect(screen.getByText('Feedback')).toBeInTheDocument();
  });

  it('renders the gratitude, heroes and feedback links', () => {
    render(<Feedback />);

    expect(screen.getByRole('link', { name: /Say Thank you/ })).toHaveAttribute('href', '/gratitude');

    const heroes = screen.getByRole('link', { name: /Heroes page/ });
    expect(heroes).toHaveAttribute('href', '/heroes');
    expect(heroes).toHaveAttribute('target', '_self');

    const feedback = screen.getByRole('link', { name: /Feedback on RS School/ });
    expect(feedback).toHaveAttribute('href', expect.stringContaining('docs.google.com'));
    expect(feedback).toHaveAttribute('target', '_blank');
  });
});
