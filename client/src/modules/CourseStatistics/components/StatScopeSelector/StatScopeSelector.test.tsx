import { render, screen, fireEvent } from '@testing-library/react';
import { StatScopeSelector } from './StatScopeSelector';
import { StatScope } from '@client/modules/CourseStatistics/constants';

// Brittle-widget stub: antd DatePicker (year picker) opens a panel that is heavy/flaky
// in jsdom. Replace with a lightweight input that invokes onChange with a dayjs-like
// object so we can assert the year-selection wiring without driving the real panel.
vi.mock('antd', () => {
  const DatePicker = ({ onChange }: { onChange?: (d: { year: () => number }) => void }) => (
    <button type="button" data-testid="year-picker" onClick={() => onChange?.({ year: () => 2025 })}>
      pick year
    </button>
  );
  const Switch = ({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) => (
    <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)} />
  );
  const Container = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  return { DatePicker, Switch, Flex: Container, Space: Container };
});

describe('<StatScopeSelector />', () => {
  it('renders both scopes and forwards switch and year changes', () => {
    const handleYearSelection = vi.fn();
    const handleStatScope = vi.fn();
    const { rerender } = render(
      <StatScopeSelector
        statScope={StatScope.Timeline}
        handleYearSelection={handleYearSelection}
        handleStatScope={handleStatScope}
      />,
    );

    expect(screen.getByTestId('year-picker')).toBeInTheDocument();
    // Switch is unchecked (Timeline) → "Timeline" label visible.
    expect(screen.getByRole('switch')).not.toBeChecked();

    fireEvent.click(screen.getByRole('switch'));

    expect(handleStatScope).toHaveBeenCalledTimes(1);
    // antd Switch onChange's first arg is the new checked value.
    expect(handleStatScope.mock.calls[0]?.[0]).toBe(true);

    fireEvent.click(screen.getByTestId('year-picker'));
    expect(handleYearSelection).toHaveBeenCalledTimes(1);

    rerender(
      <StatScopeSelector
        statScope={StatScope.Current}
        handleYearSelection={handleYearSelection}
        handleStatScope={handleStatScope}
        selectedYear={2024}
      />,
    );

    expect(screen.queryByTestId('year-picker')).not.toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeChecked();
  });
});
