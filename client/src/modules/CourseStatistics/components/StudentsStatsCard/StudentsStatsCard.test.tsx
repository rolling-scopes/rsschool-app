import { render, screen, waitFor } from '@testing-library/react';
import { ReactNode, useEffect, useState } from 'react';
import { CourseStatsDto } from '@client/api';
import { StudentsStatsCard } from './StudentsStatsCard';

// next/dynamic: resolve the lazily-imported chart synchronously (render the loading
// fallback first, then swap in the loaded component), mirroring real behaviour.
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

// Brittle-widget stub: the LiquidChart is canvas-based; replace with a marker that
// echoes the count/total it receives so we assert the card wires the chart correctly.
vi.mock('../LiquidChart/LiquidChart', () => ({
  default: ({ count, total }: { count: number; total: number }) => (
    <div data-testid="liquid-chart" data-count={count} data-total={total} />
  ),
}));

const studentsStats: CourseStatsDto = {
  activeStudentsCount: 80,
  totalStudents: 120,
  studentsWithMentorCount: 60,
  certifiedStudentsCount: 20,
  eligibleForCertificationCount: 40,
};

describe('<StudentsStatsCard />', () => {
  it('renders the card title and the active/total ratio text', () => {
    render(<StudentsStatsCard studentsStats={studentsStats} />);

    expect(screen.getByText('Active Students')).toBeInTheDocument();
    expect(screen.getByText('Active Students: 80 / 120')).toBeInTheDocument();
  });

  it('passes the active and total counts to the liquid chart', async () => {
    render(<StudentsStatsCard studentsStats={studentsStats} />);

    const chart = await screen.findByTestId('liquid-chart');
    expect(chart).toHaveAttribute('data-count', '80');
    expect(chart).toHaveAttribute('data-total', '120');
  });

  it('renders zero counts when there are no students', async () => {
    render(<StudentsStatsCard studentsStats={{ ...studentsStats, activeStudentsCount: 0, totalStudents: 0 }} />);

    expect(screen.getByText('Active Students: 0 / 0')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId('liquid-chart')).toHaveAttribute('data-count', '0');
    });
  });
});
