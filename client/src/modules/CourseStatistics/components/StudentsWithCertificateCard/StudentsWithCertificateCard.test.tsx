import { render, screen } from '@testing-library/react';
import { CourseStatsDto } from '@client/api';
import { StudentsWithCertificateCard } from './StudentsWithCertificateCard';
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
  activeStudentsCount: 90,
  totalStudents: 130,
  studentsWithMentorCount: 50,
  certifiedStudentsCount: 30,
  eligibleForCertificationCount: 0,
};

describe('<StudentsWithCertificateCard />', () => {
  it('renders the title, ratio, and chart data', () => {
    render(<StudentsWithCertificateCard studentsStats={studentsStats} />);

    expect(screen.getByText('Students With Certificate')).toBeInTheDocument();
    expect(screen.getByText('Students With Certificate: 30 / 90')).toBeInTheDocument();

    const chart = screen.getByTestId('liquid-chart');
    expect(chart).toHaveAttribute('data-count', '30');
    expect(chart).toHaveAttribute('data-total', '90');
    expect(chart).toHaveAttribute('data-color', Colors.Lime);
  });
});
