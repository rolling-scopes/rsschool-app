import { render, screen } from '@testing-library/react';
import { CourseStatsDto } from '@client/api';
import { StudentsWithMentorsCard } from './StudentsWithMentorsCard';
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

const studentsStats: CourseStatsDto = {
  activeStudentsCount: 100,
  totalStudents: 150,
  studentsWithMentorCount: 70,
  certifiedStudentsCount: 0,
  eligibleForCertificationCount: 0,
};

describe('<StudentsWithMentorsCard />', () => {
  it('renders the title, ratio, and chart data', () => {
    render(<StudentsWithMentorsCard studentsStats={studentsStats} />);

    expect(screen.getByText('Students With Mentor')).toBeInTheDocument();
    expect(screen.getByText('Students With Mentor: 70 / 100')).toBeInTheDocument();

    const chart = screen.getByTestId('liquid-chart');
    expect(chart).toHaveAttribute('data-count', '70');
    expect(chart).toHaveAttribute('data-total', '100');
    expect(chart).toHaveAttribute('data-color', Colors.Gold);
  });
});
