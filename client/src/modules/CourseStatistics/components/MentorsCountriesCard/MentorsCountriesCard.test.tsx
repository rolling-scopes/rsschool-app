import { render, screen } from '@testing-library/react';
import { ReactNode, useEffect, useState } from 'react';
import { CountriesStatsDto } from '@client/api';
import { MentorsCountriesCard } from './MentorsCountriesCard';
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

// Brittle-widget stub: canvas CountriesChart → marker echoing forwarded props.
vi.mock('../CountriesChart/CountriesChart', () => ({
  default: ({
    data,
    activeCount,
    xAxisTitle,
    color,
  }: {
    data: unknown[];
    activeCount: number;
    xAxisTitle: string;
    color: string;
  }) => (
    <div
      data-testid="countries-chart"
      data-length={data.length}
      data-active={activeCount}
      data-axis-title={xAxisTitle}
      data-color={color}
    />
  ),
}));

const countriesStats: CountriesStatsDto = {
  countries: [
    { countryName: 'Poland', count: 8 },
    { countryName: 'Ukraine', count: 4 },
    { countryName: 'Georgia', count: 2 },
  ],
};

describe('<MentorsCountriesCard />', () => {
  it('renders the card title', () => {
    render(<MentorsCountriesCard countriesStats={countriesStats} activeCount={14} />);

    expect(screen.getByText('Mentors Countries')).toBeInTheDocument();
  });

  it('forwards countries, active count, mentors axis title and Purple color', async () => {
    render(<MentorsCountriesCard countriesStats={countriesStats} activeCount={14} />);

    const chart = await screen.findByTestId('countries-chart');
    expect(chart).toHaveAttribute('data-length', '3');
    expect(chart).toHaveAttribute('data-active', '14');
    expect(chart).toHaveAttribute('data-axis-title', 'Number of Mentors');
    expect(chart).toHaveAttribute('data-color', Colors.Purple);
  });
});
