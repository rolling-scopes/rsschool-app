import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HeroesCountBadge from './HeroesCountBadge';

describe('HeroesCountBadge', () => {
  it('renders the badge avatar with the proper alt and src', () => {
    render(<HeroesCountBadge badge={{ badgeId: 'Hero' }} />);

    const avatar = screen.getByRole('img', { name: 'Hero badge' });
    expect(avatar).toHaveAttribute('src', '/static/svg/badges/Hero.svg');
  });

  it('falls back to an empty url for an unknown badge id', () => {
    render(<HeroesCountBadge badge={{ badgeId: 'Unknown' }} />);

    const avatar = screen.getByRole('img', { name: 'Unknown badge' });
    expect(avatar).toHaveAttribute('src', '/static/svg/badges/');
  });

  it('does not render a count badge superscript when count is 0', () => {
    render(<HeroesCountBadge badge={{ badgeId: 'Hero' }} />);
    expect(screen.queryByText('3')).not.toBeInTheDocument();
  });

  it('renders the numeric count when greater than 0', () => {
    render(<HeroesCountBadge badge={{ badgeId: 'Hero', count: 3 }} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows the badge name in a tooltip on hover', async () => {
    const user = userEvent.setup();
    render(<HeroesCountBadge badge={{ badgeId: 'Good_job' }} />);

    await user.hover(screen.getByRole('img', { name: 'Good_job badge' }));

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Good job');
  });

  it('includes the comment and formatted date in the tooltip when provided', async () => {
    const user = userEvent.setup();
    render(<HeroesCountBadge badge={{ badgeId: 'Hero', comment: 'Great work!', date: '2023-01-15T10:30:00.000Z' }} />);

    await user.hover(screen.getByRole('img', { name: 'Hero badge' }));

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Great work!');
    expect(tooltip).toHaveTextContent('2023-01-15 10:30');
  });
});
