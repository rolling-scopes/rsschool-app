import { render, screen } from '@testing-library/react';
import DiscordCard from '../DiscordCard';

const discord = { id: '12345', username: 'vasya', discriminator: '0' };

describe('DiscordCard', () => {
  it('renders authorized and unauthorized states for owners and other users', () => {
    const { rerender } = render(<DiscordCard data={discord} isProfileOwner={true} />);

    expect(screen.getByText(/You are authorized as/)).toBeInTheDocument();
    expect(screen.getByText('Switch to another Discord account:')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: 'Reauthorize' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', expect.stringContaining('discord.com'));
    expect(screen.getByText('@vasya')).toBeInTheDocument();

    rerender(<DiscordCard data={discord} isProfileOwner={false} />);

    expect(screen.getByText(/The user is authorized as/)).toBeInTheDocument();
    expect(screen.queryByText('Switch to another Discord account:')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /authorize/i })).not.toBeInTheDocument();

    rerender(<DiscordCard data={null} isProfileOwner={true} />);

    expect(screen.getByText(/You haven't authorized yet/)).toBeInTheDocument();
    expect(screen.queryByText('Switch to another Discord account:')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Authorize' })).toBeInTheDocument();

    rerender(<DiscordCard data={null} isProfileOwner={false} />);

    expect(screen.getByText(/The user hasn't authorized yet/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /authorize/i })).not.toBeInTheDocument();
  });
});
