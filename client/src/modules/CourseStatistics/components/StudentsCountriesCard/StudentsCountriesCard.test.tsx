import { render, screen } from '@testing-library/react';
import { ReactNode, useEffect, useState } from 'react';
import { CountriesStatsDto } from '@client/api';
import { StudentsCountriesCard } from './StudentsCountriesCard';

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

// Brittle-widget stub: canvas CountriesChart → marker echoing the data length,
// active count and axis title the card forwards.
vi.mock('../CountriesChart/CountriesChart', () => ({
  default: ({ data, activeCount, xAxisTitle }: { data: unknown[]; activeCount: number; xAxisTitle: string }) => (
    <div
      data-testid="countries-chart"
      data-length={data.length}
      data-active={activeCount}
      data-axis-title={xAxisTitle}
    />
  ),
}));

const studentsCountriesStats: CountriesStatsDto = {
  countries: [
    { countryName: 'Poland', count: 30 },
    { countryName: 'Georgia', count: 20 },
  ],
};

describe('<StudentsCountriesCard />', () => {
  it('renders the card title', () => {
    render(<StudentsCountriesCard studentsCountriesStats={studentsCountriesStats} activeStudentsCount={50} />);

    expect(screen.getByText('Students Countries')).toBeInTheDocument();
  });

  it('forwards countries, active count and the students axis title to the chart', async () => {
    render(<StudentsCountriesCard studentsCountriesStats={studentsCountriesStats} activeStudentsCount={50} />);

    const chart = await screen.findByTestId('countries-chart');
    expect(chart).toHaveAttribute('data-length', '2');
    expect(chart).toHaveAttribute('data-active', '50');
    expect(chart).toHaveAttribute('data-axis-title', 'Number of Students');
  });

  it('forwards an empty countries list', async () => {
    render(<StudentsCountriesCard studentsCountriesStats={{ countries: [] }} activeStudentsCount={0} />);

    const chart = await screen.findByTestId('countries-chart');
    expect(chart).toHaveAttribute('data-length', '0');
  });
});
