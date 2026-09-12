/* eslint-disable testing-library/no-container, testing-library/no-node-access -- antd Divider has no role/text to query */
import { act, fireEvent, render, screen } from '@testing-library/react';
import SettingsItem from './SettingsItem';

const Icon = ({ style }: { style?: React.CSSProperties }) => (
  <span data-testid="settings-icon" style={style}>
    icon
  </span>
);

describe('SettingsItem', () => {
  it('renders and expands a panel without actions', () => {
    vi.useFakeTimers();
    const { container } = render(
      <SettingsItem header="Expandable" IconComponent={Icon}>
        <div>hidden child content</div>
      </SettingsItem>,
    );

    expect(screen.getByText('Expandable')).toBeInTheDocument();
    expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
    expect(screen.queryByText('hidden child content')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Expandable'));
    act(() => vi.runOnlyPendingTimers());

    expect(screen.getByText('hidden child content')).toBeInTheDocument();
    expect(container.querySelector('.ant-divider')).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('renders the actions and a divider once expanded', () => {
    vi.useFakeTimers();
    render(
      <SettingsItem
        header="With actions"
        IconComponent={Icon}
        actions={[<button key="a">Save</button>, <button key="b">Reset</button>]}
      >
        <div>body</div>
      </SettingsItem>,
    );

    fireEvent.click(screen.getByText('With actions'));
    act(() => vi.runOnlyPendingTimers());

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
    vi.useRealTimers();
  });
});
