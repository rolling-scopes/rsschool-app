import { render, screen, fireEvent } from '@testing-library/react';
import { StatScopeSelector } from './StatScopeSelector';
import { StatScope } from '@client/modules/CourseStatistics/constants';

// Brittle-widget stub: antd DatePicker (year picker) opens a panel that is heavy/flaky
// in jsdom. Replace with a lightweight input that invokes onChange with a dayjs-like
// object so we can assert the year-selection wiring without driving the real panel.
vi.mock('antd', async () => {
  const actual = (await vi.importActual('antd')) as typeof import('antd');
  const DatePicker = ({ onChange }: { onChange?: (d: { year: () => number }) => void }) => (
    <button type="button" data-testid="year-picker" onClick={() => onChange?.({ year: () => 2025 })}>
      pick year
    </button>
  );
  return { ...actual, DatePicker };
});

describe('<StatScopeSelector />', () => {
  it('shows the Timeline year picker when scope is Timeline', () => {
    render(
      <StatScopeSelector statScope={StatScope.Timeline} handleYearSelection={vi.fn()} handleStatScope={vi.fn()} />,
    );

    expect(screen.getByTestId('year-picker')).toBeInTheDocument();
    // Switch is unchecked (Timeline) → "Timeline" label visible.
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('hides the year picker and checks the switch when scope is Current', () => {
    render(<StatScopeSelector statScope={StatScope.Current} handleYearSelection={vi.fn()} handleStatScope={vi.fn()} />);

    expect(screen.queryByTestId('year-picker')).not.toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('calls handleStatScope when the switch is toggled', () => {
    const handleStatScope = vi.fn();
    render(
      <StatScopeSelector
        statScope={StatScope.Timeline}
        handleYearSelection={vi.fn()}
        handleStatScope={handleStatScope}
      />,
    );

    fireEvent.click(screen.getByRole('switch'));

    expect(handleStatScope).toHaveBeenCalledTimes(1);
    // antd Switch onChange's first arg is the new checked value.
    expect(handleStatScope.mock.calls[0]?.[0]).toBe(true);
  });

  it('calls handleYearSelection when a year is picked', () => {
    const handleYearSelection = vi.fn();
    render(
      <StatScopeSelector
        statScope={StatScope.Timeline}
        handleYearSelection={handleYearSelection}
        handleStatScope={vi.fn()}
        selectedYear={2024}
      />,
    );

    fireEvent.click(screen.getByTestId('year-picker'));

    expect(handleYearSelection).toHaveBeenCalledTimes(1);
  });
});
