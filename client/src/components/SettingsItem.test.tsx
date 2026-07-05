/* eslint-disable testing-library/no-container, testing-library/no-node-access -- antd Divider has no role/text to query */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsItem from './SettingsItem';

const Icon = ({ style }: { style?: React.CSSProperties }) => (
  <span data-testid="settings-icon" style={style}>
    icon
  </span>
);

describe('SettingsItem', () => {
  it('renders the header and the expand icon', () => {
    render(
      <SettingsItem header="My Settings" IconComponent={Icon}>
        <div>panel body</div>
      </SettingsItem>,
    );

    expect(screen.getByText('My Settings')).toBeInTheDocument();
    expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
  });

  it('reveals children content after expanding the panel', async () => {
    const user = userEvent.setup();
    render(
      <SettingsItem header="Expandable" IconComponent={Icon}>
        <div>hidden child content</div>
      </SettingsItem>,
    );

    expect(screen.queryByText('hidden child content')).not.toBeInTheDocument();

    await user.click(screen.getByText('Expandable'));

    expect(await screen.findByText('hidden child content')).toBeInTheDocument();
  });

  it('renders the actions and a divider once expanded', async () => {
    const user = userEvent.setup();
    render(
      <SettingsItem
        header="With actions"
        IconComponent={Icon}
        actions={[<button key="a">Save</button>, <button key="b">Reset</button>]}
      >
        <div>body</div>
      </SettingsItem>,
    );

    await user.click(screen.getByText('With actions'));

    expect(await screen.findByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
  });

  it('does not render a divider when no actions are provided', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <SettingsItem header="No actions" IconComponent={Icon}>
        <div>body content</div>
      </SettingsItem>,
    );

    await user.click(screen.getByText('No actions'));
    await screen.findByText('body content');

    expect(container.querySelector('.ant-divider')).not.toBeInTheDocument();
  });
});
