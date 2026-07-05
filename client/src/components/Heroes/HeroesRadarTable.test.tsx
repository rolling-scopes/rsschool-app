import { render, screen } from '@testing-library/react';
import { HeroRadarDto, HeroesRadarDto } from '@client/api';
import HeroesRadarTable from './HeroesRadarTable';

function buildHeroes(content: HeroRadarDto[], total = content.length): HeroesRadarDto {
  return {
    content,
    pagination: { current: 1, pageSize: 20, itemCount: total, total, totalPages: 1 },
  };
}

const baseHero: HeroRadarDto = {
  githubId: 'alice',
  name: 'Alice Smith',
  rank: 1,
  total: 2,
  badges: [
    { id: 'b1', badgeId: 'Hero', comment: 'nice', date: '2023-01-01T00:00:00.000Z' },
    { id: 'b2', badgeId: 'Good_job', comment: 'great', date: '2023-02-01T00:00:00.000Z' },
  ],
};

describe('HeroesRadarTable', () => {
  const noop = vi.fn();

  it('renders a row per hero with github link and profile link', () => {
    render(<HeroesRadarTable heroes={buildHeroes([baseHero])} onChange={noop} setFormLayout={noop} />);

    const githubLink = screen.getByRole('link', { name: 'alice' });
    expect(githubLink).toHaveAttribute('href', 'https://github.com/alice');

    const profileLink = screen.getByRole('link', { name: 'Alice Smith' });
    expect(profileLink).toHaveAttribute('href', '/profile?githubId=alice');
  });

  it('renders the total badge count in bold', () => {
    const hero: HeroRadarDto = { ...baseHero, total: 7 };
    render(<HeroesRadarTable heroes={buildHeroes([hero])} onChange={noop} setFormLayout={noop} />);
    const totalCell = screen.getByText('7');
    expect(totalCell.tagName).toBe('B');
  });

  it('renders "New" for a rank greater or equal to 999999', () => {
    const newcomer: HeroRadarDto = { ...baseHero, githubId: 'bob', name: 'Bob', rank: 999999 };
    render(<HeroesRadarTable heroes={buildHeroes([newcomer])} onChange={noop} setFormLayout={noop} />);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders a "+N More" tag when total exceeds 20', () => {
    const overflow: HeroRadarDto = { ...baseHero, total: 25 };
    render(<HeroesRadarTable heroes={buildHeroes([overflow])} onChange={noop} setFormLayout={noop} />);
    expect(screen.getByText('+5 More')).toBeInTheDocument();
  });

  it('renders an empty table message when there are no heroes', () => {
    render(<HeroesRadarTable heroes={buildHeroes([], 0)} onChange={noop} setFormLayout={noop} />);
    expect(screen.getAllByText('No data').length).toBeGreaterThan(0);
  });

  it('sets the form layout based on the window width on mount', () => {
    // jsdom default innerWidth is 1024 (>= XS breakpoint), so layout should be inline
    const setFormLayout = vi.fn();
    render(<HeroesRadarTable heroes={buildHeroes([baseHero])} onChange={noop} setFormLayout={setFormLayout} />);
    expect(setFormLayout).toHaveBeenCalledWith('inline');
  });

  it('switches to vertical layout for narrow viewports', () => {
    const original = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 400 });

    const setFormLayout = vi.fn();
    render(<HeroesRadarTable heroes={buildHeroes([baseHero])} onChange={noop} setFormLayout={setFormLayout} />);
    expect(setFormLayout).toHaveBeenCalledWith('vertical');

    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: original });
  });
});
