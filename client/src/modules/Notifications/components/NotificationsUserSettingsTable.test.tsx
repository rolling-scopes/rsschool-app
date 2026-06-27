import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationsTable } from './NotificationsUserSettingsTable';
import { NotificationChannel, UserNotificationSettings } from '../services/notifications';

function makeSettings(overrides: Partial<UserNotificationSettings> = {}): UserNotificationSettings {
  return {
    id: 'task-deadline',
    name: 'Task Deadline',
    enabled: true,
    settings: { email: true, telegram: false },
    ...overrides,
  } as UserNotificationSettings;
}

const notifications: UserNotificationSettings[] = [
  makeSettings({ id: 'one', name: 'First Notification', settings: { email: true, telegram: false } }),
  makeSettings({ id: 'two', name: 'Second Notification', settings: { email: false, telegram: true } }),
];

describe('NotificationsUserSettingsTable', () => {
  it('renders the Notification column plus email & telegram channels (discord excluded)', () => {
    render(<NotificationsTable notifications={notifications} onCheck={vi.fn()} />);

    expect(screen.getByText('Notification')).toBeInTheDocument();
    expect(screen.getByText('email')).toBeInTheDocument();
    expect(screen.getByText('telegram')).toBeInTheDocument();
    expect(screen.queryByText('discord')).not.toBeInTheDocument();
  });

  it('renders a row per notification with its name', () => {
    render(<NotificationsTable notifications={notifications} onCheck={vi.fn()} />);

    expect(screen.getByText('First Notification')).toBeInTheDocument();
    expect(screen.getByText('Second Notification')).toBeInTheDocument();
  });

  it('reflects the per-channel checked state from settings', () => {
    render(<NotificationsTable notifications={notifications} onCheck={vi.fn()} />);

    const rows = screen.getAllByRole('row');
    // rows[0] is the header.
    const firstRow = rows[1]!;
    const secondRow = rows[2]!;

    const [firstEmail, firstTelegram] = within(firstRow).getAllByRole('checkbox');
    expect(firstEmail).toBeChecked();
    expect(firstTelegram).not.toBeChecked();

    const [secondEmail, secondTelegram] = within(secondRow).getAllByRole('checkbox');
    expect(secondEmail).not.toBeChecked();
    expect(secondTelegram).toBeChecked();
  });

  it('treats an undefined channel value as checked (undefinedAsTrue)', () => {
    const data = [makeSettings({ id: 'x', name: 'No Email Setting', settings: { telegram: true } })];
    render(<NotificationsTable notifications={data} onCheck={vi.fn()} />);

    const dataRow = screen.getAllByRole('row')[1]!;
    const [email] = within(dataRow).getAllByRole('checkbox');
    expect(email).toBeChecked();
  });

  it('calls onCheck with dataIndex, record and the new value when toggling a channel on', async () => {
    const user = userEvent.setup();
    const onCheck = vi.fn();
    render(<NotificationsTable notifications={notifications} onCheck={onCheck} />);

    const firstRow = screen.getAllByRole('row')[1]!;
    const [, telegram] = within(firstRow).getAllByRole('checkbox');

    await user.click(telegram!);

    expect(onCheck).toHaveBeenCalledTimes(1);
    expect(onCheck).toHaveBeenCalledWith(['settings', 'telegram'], notifications[0], true);
  });

  it('calls onCheck with false when toggling a channel off', async () => {
    const user = userEvent.setup();
    const onCheck = vi.fn();
    render(<NotificationsTable notifications={notifications} onCheck={onCheck} />);

    const firstRow = screen.getAllByRole('row')[1]!;
    const [email] = within(firstRow).getAllByRole('checkbox');

    await user.click(email!);

    expect(onCheck).toHaveBeenCalledWith(['settings', 'email'], notifications[0], false);
  });

  it('marks disabled channel columns with the disabled class', () => {
    const { container } = render(
      <NotificationsTable
        notifications={notifications}
        onCheck={vi.fn()}
        disabledChannels={[NotificationChannel.telegram]}
      />,
    );

    // The disabled column adds a CSS-module class; assert at least one cell carries a
    // class containing "disabled".
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const disabledCells = container.querySelectorAll('[class*="disabled"]');
    expect(disabledCells.length).toBeGreaterThan(0);
  });

  it('renders an empty table with no rows when there are no notifications', () => {
    render(<NotificationsTable notifications={[]} onCheck={vi.fn()} />);

    expect(screen.getAllByText(/no data/i).length).toBeGreaterThan(0);
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });
});
