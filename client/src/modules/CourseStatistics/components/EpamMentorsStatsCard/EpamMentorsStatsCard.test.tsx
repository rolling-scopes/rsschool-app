import { render, screen } from '@testing-library/react';
import { CourseMentorsStatsDto } from '@client/api';
import { EpamMentorsStatsCard } from './EpamMentorsStatsCard';
import { Colors } from '../../data';

vi.mock('next/dynamic', () => ({
  default: (loader: () => Promise<unknown>) => {
    void loader();
    return ({ count, total, color }: { count: number; total: number; color: string }) => (
      <div data-testid="liquid-chart" data-count={count} data-total={total} data-color={color} />
    );
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
  it('renders the title, ratio, and chart data', () => {
    render(<EpamMentorsStatsCard mentorsStats={mentorsStats} />);

    expect(screen.getByText('Epam Mentors')).toBeInTheDocument();
    expect(screen.getByText('Epam Mentors: 12 / 40')).toBeInTheDocument();

    const chart = screen.getByTestId('liquid-chart');
    expect(chart).toHaveAttribute('data-count', '12');
    expect(chart).toHaveAttribute('data-total', '40');
    expect(chart).toHaveAttribute('data-color', Colors.Purple);
  });
});
