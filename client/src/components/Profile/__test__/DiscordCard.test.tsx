import { render, screen } from '@testing-library/react';
import DiscordCard from '../DiscordCard';

const discord = { id: '12345', username: 'vasya', discriminator: '0' };

describe('DiscordCard', () => {
  describe('when the user is authorized (data.id present)', () => {
    it('shows the authorized message and a Reauthorize link for the profile owner', () => {
      render(<DiscordCard data={discord} isProfileOwner={true} />);

      expect(screen.getByText(/You are authorized as/)).toBeInTheDocument();
      expect(screen.getByText('Switch to another Discord account:')).toBeInTheDocument();

      const link = screen.getByRole('link', { name: 'Reauthorize' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', expect.stringContaining('discord.com'));
      // StudentDiscord renders the username link
      expect(screen.getByText('@vasya')).toBeInTheDocument();
    });

    it('shows the authorized message for a non-owner without the authorize link', () => {
      render(<DiscordCard data={discord} isProfileOwner={false} />);

      expect(screen.getByText(/The user is authorized as/)).toBeInTheDocument();
      expect(screen.queryByText('Switch to another Discord account:')).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /authorize/i })).not.toBeInTheDocument();
    });
  });

  describe('when the user is not authorized (data null or no id)', () => {
    it('shows the not-authorized message and an Authorize link for the profile owner', () => {
      render(<DiscordCard data={null} isProfileOwner={true} />);

      expect(screen.getByText(/You haven't authorized yet/)).toBeInTheDocument();
      // 'Switch to another Discord account:' is hidden because data?.id is falsy
      expect(screen.queryByText('Switch to another Discord account:')).not.toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Authorize' })).toBeInTheDocument();
    });

    it('shows the not-authorized message for a non-owner without the authorize link', () => {
      render(<DiscordCard data={null} isProfileOwner={false} />);

      expect(screen.getByText(/The user hasn't authorized yet/)).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /authorize/i })).not.toBeInTheDocument();
    });
  });
});
