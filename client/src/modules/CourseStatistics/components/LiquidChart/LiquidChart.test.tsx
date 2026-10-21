import { render, screen } from '@testing-library/react';
import LiquidChart from './LiquidChart';
import { Colors } from '../../data';

// --- Brittle-widget stub ---------------------------------------------------
// Stub @ant-design/plots <Liquid/> (canvas chart) with a marker exposing the computed
// percent, the contentText label and the fill color so we can assert the shaping logic.
vi.mock('@ant-design/plots', () => ({
  Liquid: (config: { percent: number; style?: { fill?: string; contentText?: string } }) => (
    <div
      data-testid="liquid-chart"
      data-percent={String(config.percent)}
      data-content-text={config.style?.contentText}
      data-fill={config.style?.fill}
    />
  ),
}));

describe('<LiquidChart />', () => {
  it('renders default, custom-color, and zero-total chart data', () => {
    const { rerender } = render(<LiquidChart count={25} total={100} />);

    const chart = screen.getByTestId('liquid-chart');
    expect(chart).toHaveAttribute('data-percent', '0.25');
    expect(chart).toHaveAttribute('data-content-text', '25.00%');

    rerender(<LiquidChart count={1} total={2} />);

    expect(screen.getByTestId('liquid-chart')).toHaveAttribute('data-fill', Colors.Blue);

    rerender(<LiquidChart count={1} total={2} color={Colors.Gold} />);

    expect(screen.getByTestId('liquid-chart')).toHaveAttribute('data-fill', Colors.Gold);

    rerender(<LiquidChart count={0} total={0} />);

    const emptyChart = screen.getByTestId('liquid-chart');
    expect(emptyChart).toHaveAttribute('data-percent', 'NaN');
    expect(emptyChart).toHaveAttribute('data-content-text', 'NaN%');
  });
});
