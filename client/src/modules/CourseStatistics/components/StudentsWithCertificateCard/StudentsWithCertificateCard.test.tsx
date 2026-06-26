import { render, screen } from '@testing-library/react';
import { ReactNode, useEffect, useState } from 'react';
import { CourseStatsDto } from '@client/api';
import { StudentsWithCertificateCard } from './StudentsWithCertificateCard';
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
  activeStudentsCount: 90,
  totalStudents: 130,
  studentsWithMentorCount: 50,
  certifiedStudentsCount: 30,
  eligibleForCertificationCount: 0,
};

describe('<StudentsWithCertificateCard />', () => {
  it('renders the title and the certified/active ratio', () => {
    render(<StudentsWithCertificateCard studentsStats={studentsStats} />);

    expect(screen.getByText('Students With Certificate')).toBeInTheDocument();
    expect(screen.getByText('Students With Certificate: 30 / 90')).toBeInTheDocument();
  });

  it('passes the certified count, active total and Lime color to the chart', async () => {
    render(<StudentsWithCertificateCard studentsStats={studentsStats} />);

    const chart = await screen.findByTestId('liquid-chart');
    expect(chart).toHaveAttribute('data-count', '30');
    expect(chart).toHaveAttribute('data-total', '90');
    expect(chart).toHaveAttribute('data-color', Colors.Lime);
  });
});
