import { render, screen } from '@testing-library/react';
import { ReactNode, useEffect, useState } from 'react';
import { CourseStatsDto } from '@client/api';
import { StudentsWithMentorsCard } from './StudentsWithMentorsCard';
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
  totalStudents: 150,
  studentsWithMentorCount: 70,
  certifiedStudentsCount: 0,
  eligibleForCertificationCount: 0,
};

describe('<StudentsWithMentorsCard />', () => {
  it('renders the title and the with-mentor/active ratio', () => {
    render(<StudentsWithMentorsCard studentsStats={studentsStats} />);

    expect(screen.getByText('Students With Mentor')).toBeInTheDocument();
    expect(screen.getByText('Students With Mentor: 70 / 100')).toBeInTheDocument();
  });

  it('passes the with-mentor count, active total and Gold color to the chart', async () => {
    render(<StudentsWithMentorsCard studentsStats={studentsStats} />);

    const chart = await screen.findByTestId('liquid-chart');
    expect(chart).toHaveAttribute('data-count', '70');
    expect(chart).toHaveAttribute('data-total', '100');
    expect(chart).toHaveAttribute('data-color', Colors.Gold);
  });
});
