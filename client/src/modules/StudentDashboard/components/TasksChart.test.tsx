import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TasksChart } from './TasksChart';

// Brittle chart widget: stub @ant-design/plots Pie. Capture the config so we can drive
// the onEvent handler (element:click) and assert on derived legend/tooltip/label config.
const lastConfig: { current: Record<string, unknown> | null } = { current: null };

vi.mock('@ant-design/plots', () => ({
  Pie: (config: Record<string, unknown>) => {
    lastConfig.current = config;
    const onEvent = config.onEvent as (chart: unknown, event: unknown) => void;
    return (
      <div data-testid="pie">
        <button onClick={() => onEvent({}, { type: 'element:click', data: { data: { status: 'done', value: 3 } } })}>
          fire-click
        </button>
        <button onClick={() => onEvent({}, { type: 'element:mouseover', data: undefined })}>fire-noop</button>
        <button onClick={() => onEvent({}, { type: 'element:click', data: undefined })}>fire-empty</button>
      </div>
    );
  },
  PieConfig: {},
}));

const data = [
  { status: 'done', value: 3 },
  { status: 'available', value: 5 },
];

describe('<TasksChart />', () => {
  beforeEach(() => {
    lastConfig.current = null;
    vi.clearAllMocks();
  });

  it('configures the chart, formats labels, and handles chart events', () => {
    const onItemSelected = vi.fn();
    render(<TasksChart data={data} onItemSelected={onItemSelected} />);

    expect(screen.getByTestId('pie')).toBeInTheDocument();
    expect(lastConfig.current?.data).toEqual(data);
    expect(lastConfig.current?.angleField).toBe('value');
    expect(lastConfig.current?.colorField).toBe('status');
    // theme comes from the (mocked) useTheme hook → 'light'
    expect(lastConfig.current?.theme).toBe('light');

    fireEvent.click(screen.getByText('fire-click'));
    expect(onItemSelected).toHaveBeenCalledWith({ status: 'done', value: 3 });

    fireEvent.click(screen.getByText('fire-noop'));
    fireEvent.click(screen.getByText('fire-empty'));
    expect(onItemSelected).toHaveBeenCalledTimes(1);

    const legend = lastConfig.current?.legend as { color: { itemLabelText: (d: unknown) => string } };
    // string datum
    expect(legend.color.itemLabelText('done')).toBe('Done');
    // object datum
    expect(legend.color.itemLabelText({ label: 'available' })).toBe('Available');
    // empty datum
    expect(legend.color.itemLabelText('')).toBe('');

    const tooltip = lastConfig.current?.tooltip as {
      items: ((d: { status: string; value: number }) => { name: string; value: number })[];
    };
    expect(tooltip.items[0]({ status: 'done', value: 3 })).toEqual({ name: 'Done', value: 3 });
  });
});
