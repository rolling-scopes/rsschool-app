/* eslint-disable testing-library/no-container, testing-library/no-node-access -- the opencollective <object> widget has no role/text to query */
import { render, screen } from '@testing-library/react';
import { Donation } from './Donation';

vi.mock('antd', () => ({
  Button: ({ children, href, target }: React.ComponentProps<'a'>) => (
    <a href={href} target={target}>
      {children}
    </a>
  ),
}));

describe('Footer Donation', () => {
  it('renders configured donor details, widget, and donation link', () => {
    const { container, rerender } = render(<Donation maxDonatorsShown={21} />);

    expect(screen.getByText('Thank you for your support!')).toBeInTheDocument();
    expect(screen.getByText('Top 21 donators:')).toBeInTheDocument();

    const button = screen.getByRole('link', { name: /Make a donation/ });
    expect(button).toHaveAttribute('href', 'https://opencollective.com/rsschool#section-contribute');
    expect(button).toHaveAttribute('target', '_blank');

    rerender(<Donation maxDonatorsShown={15} />);

    const widget = container.querySelector('object');
    expect(widget).toHaveAttribute('data', expect.stringContaining('limit=15'));
    expect(widget).toHaveAttribute('type', 'image/svg+xml');
  });
});
