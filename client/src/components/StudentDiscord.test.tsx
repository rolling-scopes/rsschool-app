import { render, screen } from '@testing-library/react';
import { StudentDiscord } from './StudentDiscord';

// Stub CopyToClipboardButton (uses useMessage + react-use clipboard side effects).
vi.mock('@client/shared/components/CopyToClipboardButton', () => ({
  default: ({ value }: { value: string }) => <button data-testid="copy">{value}</button>,
}));

describe('StudentDiscord', () => {
  it('renders a discord link with discriminator and copy button', () => {
    render(<StudentDiscord discord={{ id: '123', username: 'johnny', discriminator: '4567' }} />);

    const link = screen.getByRole('link', { name: '@johnny#4567' });
    expect(link).toHaveAttribute('href', 'https://discordapp.com/users/123');
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.getByTestId('copy')).toHaveTextContent('@johnny#4567');
  });

  it('omits the discriminator when it is "0"', () => {
    render(<StudentDiscord discord={{ id: '1', username: 'plainuser', discriminator: '0' }} />);

    expect(screen.getByRole('link', { name: '@plainuser' })).toBeInTheDocument();
    expect(screen.getByTestId('copy')).toHaveTextContent('@plainuser');
  });

  it('renders "unknown" when discord is null', () => {
    render(<StudentDiscord discord={null} />);

    expect(screen.getByText('unknown')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByTestId('copy')).not.toBeInTheDocument();
  });

  it('renders the optional text prefix', () => {
    render(<StudentDiscord discord={null} textPrefix="Discord:" />);

    expect(screen.getByText(/Discord:/)).toBeInTheDocument();
  });
});
