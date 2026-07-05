import { render, screen } from '@testing-library/react';
import { CountryStatDto } from '@client/api';
import CountriesChart from './CountriesChart';
import { Colors } from '../../data';

// --- Brittle-widget stub ---------------------------------------------------
// @ant-design/plots renders to canvas/SVG which doesn't paint meaningfully in jsdom
// and is slow. Stub <Bar/> with a marker that exposes the shaped config so we can
// assert the data the component feeds the chart without rendering a real chart. The
// full config is captured so we can exercise the tooltip formatter callback directly.
type BarConfigLike = {
  data: unknown[];
  xField: string;
  yField: string;
  color?: string;
  theme?: string;
  tooltip: { formatter: (d: { count: number }) => { name: string; value: string } };
};
const { lastConfig } = vi.hoisted(() => ({ lastConfig: { current: null as BarConfigLike | null } }));

vi.mock('@ant-design/plots', () => ({
  Bar: (config: BarConfigLike) => {
    lastConfig.current = config;
    return (
      <div
        data-testid="bar-chart"
        data-length={config.data.length}
        data-xfield={config.xField}
        data-yfield={config.yField}
        data-color={config.color}
        data-theme={config.theme}
      />
    );
  },
}));

const countries: CountryStatDto[] = [
  { countryName: 'Poland', count: 30 },
  { countryName: 'Georgia', count: 15 },
  { countryName: 'Ukraine', count: 5 },
];

describe('<CountriesChart />', () => {
  it('renders the bar chart with the provided data shape', () => {
    render(<CountriesChart data={countries} activeCount={50} xAxisTitle="Number of Students" />);

    const chart = screen.getByTestId('bar-chart');
    expect(chart).toBeInTheDocument();
    expect(chart).toHaveAttribute('data-length', '3');
    expect(chart).toHaveAttribute('data-xfield', 'count');
    expect(chart).toHaveAttribute('data-yfield', 'countryName');
  });

  it('uses the default Blue color when no color prop is passed', () => {
    render(<CountriesChart data={countries} activeCount={50} xAxisTitle="Number of Students" />);

    expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-color', Colors.Blue);
  });

  it('forwards a custom color', () => {
    render(<CountriesChart data={countries} activeCount={50} xAxisTitle="Number of Mentors" color={Colors.Purple} />);

    expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-color', Colors.Purple);
  });

  it('formats the tooltip with a count and percentage of the active total', () => {
    render(<CountriesChart data={countries} activeCount={50} xAxisTitle="Number of Students" />);

    // 30 of 50 → ceil(60%) = 60%.
    const tooltip = lastConfig.current?.tooltip.formatter({ count: 30 });
    expect(tooltip).toEqual({ name: 'Number of Students', value: '30 (60%)' });
  });

  it('formats the tooltip percentage as 0% when the active total is zero', () => {
    render(<CountriesChart data={countries} activeCount={0} xAxisTitle="Number of Students" />);

    const tooltip = lastConfig.current?.tooltip.formatter({ count: 30 });
    expect(tooltip).toEqual({ name: 'Number of Students', value: '30 (0%)' });
  });

  it('renders the empty state (and no chart) when data is empty', () => {
    render(<CountriesChart data={[]} activeCount={0} xAxisTitle="Number of Students" />);

    expect(screen.getByText('No student data available to display')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /error 404/i })).toBeInTheDocument();
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
  });
});
