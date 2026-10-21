import { render, screen } from '@testing-library/react';
import DonutChart from './DonutChart';

// --- Brittle-widget stub ---------------------------------------------------
// Stub @ant-design/plots <Pie/> (canvas chart, doesn't render in jsdom) with a marker
// that exposes the shaped config: data length, the computed `total` annotation text and
// whether a caller-supplied config was merged in.
vi.mock('@ant-design/plots', () => ({
  Pie: (config: {
    data: { type: string; value: number }[];
    angleField: string;
    colorField: string;
    innerRadius: number;
    theme?: string;
    annotations?: { style?: { text?: string } }[];
    tooltip?: unknown;
  }) => (
    <div
      data-testid="pie-chart"
      data-length={config.data.length}
      data-anglefield={config.angleField}
      data-colorfield={config.colorField}
      data-inner-radius={config.innerRadius}
      data-theme={config.theme}
      data-total={config.annotations?.[0]?.style?.text}
      data-has-tooltip={String(Boolean(config.tooltip))}
    />
  ),
}));

const data = [
  { type: 'Low', value: 3 },
  { type: 'High', value: 7 },
];

describe('<DonutChart />', () => {
  it('renders populated, empty, and configured donut charts', () => {
    const { rerender } = render(<DonutChart data={data} />);

    const chart = screen.getByTestId('pie-chart');
    expect(chart).toBeInTheDocument();
    expect(chart).toHaveAttribute('data-length', '2');
    expect(chart).toHaveAttribute('data-anglefield', 'value');
    expect(chart).toHaveAttribute('data-colorfield', 'type');
    expect(chart).toHaveAttribute('data-inner-radius', '0.6');
    expect(chart).toHaveAttribute('data-total', '10');

    rerender(<DonutChart data={[]} />);

    const emptyChart = screen.getByTestId('pie-chart');
    expect(emptyChart).toHaveAttribute('data-length', '0');
    expect(emptyChart).toHaveAttribute('data-total', '0');

    rerender(<DonutChart data={data} config={{ tooltip: { items: [] } }} />);

    expect(screen.getByTestId('pie-chart')).toHaveAttribute('data-has-tooltip', 'true');
  });
});
