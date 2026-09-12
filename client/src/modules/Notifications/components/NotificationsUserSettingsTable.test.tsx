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
  it('renders settings, toggles channels, and handles table variants', async () => {
    const user = userEvent.setup();
    const onCheck = vi.fn();
    const { container, rerender } = render(<NotificationsTable notifications={notifications} onCheck={onCheck} />);

    expect(screen.getByText('Notification')).toBeInTheDocument();
    expect(screen.getByText('email')).toBeInTheDocument();
    expect(screen.getByText('telegram')).toBeInTheDocument();
    expect(screen.queryByText('discord')).not.toBeInTheDocument();
    expect(screen.getByText('First Notification')).toBeInTheDocument();
    expect(screen.getByText('Second Notification')).toBeInTheDocument();

    const rows = screen.getAllByRole('row');
    const firstRow = rows[1]!;
    const secondRow = rows[2]!;

    const [firstEmail, firstTelegram] = within(firstRow).getAllByRole('checkbox');
    expect(firstEmail).toBeChecked();
    expect(firstTelegram).not.toBeChecked();

    const [secondEmail, secondTelegram] = within(secondRow).getAllByRole('checkbox');
    expect(secondEmail).not.toBeChecked();
    expect(secondTelegram).toBeChecked();

    await user.click(firstTelegram!);
    expect(onCheck).toHaveBeenCalledWith(['settings', 'telegram'], notifications[0], true);
    await user.click(firstEmail!);
    expect(onCheck).toHaveBeenCalledWith(['settings', 'email'], notifications[0], false);

    const data = [makeSettings({ id: 'x', name: 'No Email Setting', settings: { telegram: true } })];
    rerender(<NotificationsTable notifications={data} onCheck={onCheck} />);
    const dataRow = screen.getAllByRole('row')[1]!;
    const [email] = within(dataRow).getAllByRole('checkbox');
    expect(email).toBeChecked();

    rerender(
      <NotificationsTable
        notifications={notifications}
        onCheck={vi.fn()}
        disabledChannels={[NotificationChannel.telegram]}
      />,
    );
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const disabledCells = container.querySelectorAll('[class*="disabled"]');
    expect(disabledCells.length).toBeGreaterThan(0);

    rerender(<NotificationsTable notifications={[]} onCheck={onCheck} />);
    expect(screen.getAllByText(/no data/i).length).toBeGreaterThan(0);
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });
});
