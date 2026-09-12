import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HeroesCountBadge from './HeroesCountBadge';

describe('HeroesCountBadge', () => {
  it('renders known, unknown, zero-count, and counted badges', () => {
    const { rerender } = render(<HeroesCountBadge badge={{ badgeId: 'Hero' }} />);

    const avatar = screen.getByRole('img', { name: 'Hero badge' });
    expect(avatar).toHaveAttribute('src', '/static/svg/badges/Hero.svg');
    expect(screen.queryByText('3')).not.toBeInTheDocument();

    rerender(<HeroesCountBadge badge={{ badgeId: 'Unknown' }} />);
    expect(screen.getByRole('img', { name: 'Unknown badge' })).toHaveAttribute('src', '/static/svg/badges/');

    rerender(<HeroesCountBadge badge={{ badgeId: 'Hero', count: 3 }} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows the badge name, comment, and formatted date in its tooltip', async () => {
    const user = userEvent.setup();
    render(
      <HeroesCountBadge badge={{ badgeId: 'Good_job', comment: 'Great work!', date: '2023-01-15T10:30:00.000Z' }} />,
    );

    await user.hover(screen.getByRole('img', { name: 'Good_job badge' }));

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Good job');
    expect(tooltip).toHaveTextContent('Great work!');
    expect(tooltip).toHaveTextContent('2023-01-15 10:30');
  });
});
