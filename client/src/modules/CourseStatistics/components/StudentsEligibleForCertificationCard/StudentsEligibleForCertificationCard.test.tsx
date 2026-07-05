import { render, screen } from '@testing-library/react';
import { ReactNode, useEffect, useState } from 'react';
import { CourseStatsDto } from '@client/api';
import { StudentsEligibleForCertificationCard } from './StudentsEligibleForCertificationCard';
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

const studentsStats: CourseStatsDto = {
  activeStudentsCount: 100,
  totalStudents: 140,
  studentsWithMentorCount: 60,
  certifiedStudentsCount: 0,
  eligibleForCertificationCount: 45,
};

describe('<StudentsEligibleForCertificationCard />', () => {
  it('renders the title and the eligible/active ratio', () => {
    render(<StudentsEligibleForCertificationCard studentsStats={studentsStats} />);

    expect(screen.getByText('Eligible for Certification')).toBeInTheDocument();
    expect(screen.getByText('Eligible for Certification: 45 / 100')).toBeInTheDocument();
  });

  it('passes the eligible count, active total and Lime color to the chart', async () => {
    render(<StudentsEligibleForCertificationCard studentsStats={studentsStats} />);

    const chart = await screen.findByTestId('liquid-chart');
    expect(chart).toHaveAttribute('data-count', '45');
    expect(chart).toHaveAttribute('data-total', '100');
    expect(chart).toHaveAttribute('data-color', Colors.Lime);
  });
});
