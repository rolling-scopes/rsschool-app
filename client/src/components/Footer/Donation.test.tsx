/* eslint-disable testing-library/no-container, testing-library/no-node-access -- the opencollective <object> widget has no role/text to query */
import { render, screen } from '@testing-library/react';
import { Donation } from './Donation';

describe('Footer Donation', () => {
  it('renders the heading and the configured donator count', () => {
    render(<Donation maxDonatorsShown={21} />);

    expect(screen.getByText('Thank you for your support!')).toBeInTheDocument();
    expect(screen.getByText('Top 21 donators:')).toBeInTheDocument();
  });

  it('renders the opencollective widget with the count in its url', () => {
    const { container } = render(<Donation maxDonatorsShown={15} />);

    const widget = container.querySelector('object');
    expect(widget).toHaveAttribute('data', expect.stringContaining('limit=15'));
    expect(widget).toHaveAttribute('type', 'image/svg+xml');
  });

  it('renders a donation button linking to opencollective', () => {
    render(<Donation maxDonatorsShown={21} />);

    const button = screen.getByRole('link', { name: /Make a donation/ });
    expect(button).toHaveAttribute('href', 'https://opencollective.com/rsschool#section-contribute');
    expect(button).toHaveAttribute('target', '_blank');
  });
});
