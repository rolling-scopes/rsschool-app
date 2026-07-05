import { render, screen } from '@testing-library/react';
import { ReactNode, useEffect, useState } from 'react';
import { CourseMentorsStatsDto } from '@client/api';
import { EpamMentorsStatsCard } from './EpamMentorsStatsCard';
import { Colors } from '../../data';

vi.mock('next/dynamic', () => ({
  default: (loader: () => Promise<{ default: (p: Record<string, unknown>) => ReactNode }>) => {
    const Lazy = (props: Record<string, unknown>) => {
      const [Comp, setComp] = useState<((p: Record<string, unknown>) => ReactNode) | null>(null);
      useEffect(() => {
        loader().then(m => setComp(() => m.default));
      }, []);
      return Comp ? <Comp {...props} /> : null;
    };
    return Lazy;
  },
}));

// Brittle-widget stub: canvas LiquidChart → marker echoing count/total/color.
vi.mock('../LiquidChart/LiquidChart', () => ({
  default: ({ count, total, color }: { count: number; total: number; color: string }) => (
    <div data-testid="liquid-chart" data-count={count} data-total={total} data-color={color} />
  ),
}));

const mentorsStats: CourseMentorsStatsDto = {
  mentorsActiveCount: 40,
  mentorsTotalCount: 55,
  epamMentorsCount: 12,
};

describe('<EpamMentorsStatsCard />', () => {
  it('renders the title and the epam/active mentors ratio', () => {
    render(<EpamMentorsStatsCard mentorsStats={mentorsStats} />);

    expect(screen.getByText('Epam Mentors')).toBeInTheDocument();
    expect(screen.getByText('Epam Mentors: 12 / 40')).toBeInTheDocument();
  });

  it('passes the epam count, active total and Purple color to the chart', async () => {
    render(<EpamMentorsStatsCard mentorsStats={mentorsStats} />);

    const chart = await screen.findByTestId('liquid-chart');
    expect(chart).toHaveAttribute('data-count', '12');
    expect(chart).toHaveAttribute('data-total', '40');
    expect(chart).toHaveAttribute('data-color', Colors.Purple);
  });
});
