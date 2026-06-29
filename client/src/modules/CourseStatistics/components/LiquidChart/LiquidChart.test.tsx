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
      data-percent={config.percent}
      data-content-text={config.style?.contentText}
      data-fill={config.style?.fill}
    />
  ),
}));

describe('<LiquidChart />', () => {
  it('computes the percent ratio and formatted content text', () => {
    render(<LiquidChart count={25} total={100} />);

    const chart = screen.getByTestId('liquid-chart');
    expect(chart).toHaveAttribute('data-percent', '0.25');
    expect(chart).toHaveAttribute('data-content-text', '25.00%');
  });

  it('defaults the fill color to Blue', () => {
    render(<LiquidChart count={1} total={2} />);

    expect(screen.getByTestId('liquid-chart')).toHaveAttribute('data-fill', Colors.Blue);
  });

  it('forwards a custom color', () => {
    render(<LiquidChart count={1} total={2} color={Colors.Gold} />);

    expect(screen.getByTestId('liquid-chart')).toHaveAttribute('data-fill', Colors.Gold);
  });

  it('renders a NaN percent when total is zero (division guard not present)', () => {
    render(<LiquidChart count={0} total={0} />);

    const chart = screen.getByTestId('liquid-chart');
    expect(chart).toHaveAttribute('data-percent', 'NaN');
    expect(chart).toHaveAttribute('data-content-text', 'NaN%');
  });
});
