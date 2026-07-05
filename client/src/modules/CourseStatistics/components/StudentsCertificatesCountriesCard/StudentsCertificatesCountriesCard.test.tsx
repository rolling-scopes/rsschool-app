import { render, screen } from '@testing-library/react';
import { ReactNode, useEffect, useState } from 'react';
import { CountriesStatsDto } from '@client/api';
import { StudentsCertificatesCountriesCard } from './StudentsCertificatesCountriesCard';
import { Colors } from '@client/modules/CourseStatistics/data';

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

const studentsCertificatesCountriesStats: CountriesStatsDto = {
  countries: [
    { countryName: 'Poland', count: 12 },
    { countryName: 'Georgia', count: 6 },
  ],
};

describe('<StudentsCertificatesCountriesCard />', () => {
  it('renders the card title', () => {
    render(
      <StudentsCertificatesCountriesCard
        studentsCertificatesCountriesStats={studentsCertificatesCountriesStats}
        certificatesCount={18}
      />,
    );

    expect(screen.getByText('Certificates Countries')).toBeInTheDocument();
  });

  it('forwards countries, certificate count, certificates axis title and Lime color', async () => {
    render(
      <StudentsCertificatesCountriesCard
        studentsCertificatesCountriesStats={studentsCertificatesCountriesStats}
        certificatesCount={18}
      />,
    );

    const chart = await screen.findByTestId('countries-chart');
    expect(chart).toHaveAttribute('data-length', '2');
    expect(chart).toHaveAttribute('data-active', '18');
    expect(chart).toHaveAttribute('data-axis-title', 'Number of Certificates');
    expect(chart).toHaveAttribute('data-color', Colors.Lime);
  });
});
