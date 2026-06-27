import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { UserNotificationsPage } from './UserNotificationsSettingsPage';

// --- Mocks -----------------------------------------------------------------

const messageSuccess = vi.fn();
const messageError = vi.fn();
vi.mock('@client/hooks', () => ({
  useMessage: () => ({ message: { success: messageSuccess, error: messageError } }),
}));

// PageLayout pulls in Header/Sider (session + router heavy); replace with a passthrough.
vi.mock('@client/shared/components/PageLayout', () => ({
  PageLayout: ({ children, title }: { children: ReactNode; title: string }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

const { getUserNotificationSettings, saveUserNotifications } = vi.hoisted(() => ({
  getUserNotificationSettings: vi.fn(),
  saveUserNotifications: vi.fn(),
}));

vi.mock('@client/modules/Notifications/services/notifications', async () => ({
  ...(await vi.importActual('@client/modules/Notifications/services/notifications')),
  NotificationsService: function NotificationsService() {
    return { getUserNotificationSettings, saveUserNotifications };
  },
}));

// --- Fixtures --------------------------------------------------------------

const allEnabledConnections = {
  email: { value: 'me@example.com', enabled: true },
  telegram: { value: 'tg', enabled: true },
  discord: { value: 'dc', enabled: true },
};

const notifications = [
  { id: 'one', name: 'First Notification', enabled: true, settings: { email: true, telegram: false } },
  { id: 'two', name: 'Second Notification', enabled: true, settings: { email: false, telegram: true } },
];

describe('UserNotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUserNotificationSettings.mockResolvedValue({ connections: allEnabledConnections, notifications });
    saveUserNotifications.mockResolvedValue(undefined);
  });

  it('loads and renders the user notification settings table', async () => {
    render(<UserNotificationsPage />);

    expect(await screen.findByText('First Notification')).toBeInTheDocument();
    expect(screen.getByText('Second Notification')).toBeInTheDocument();
    expect(getUserNotificationSettings).toHaveBeenCalledTimes(1);
  });

  it('enables the Save button when at least one channel is connected', async () => {
    render(<UserNotificationsPage />);
    await screen.findByText('First Notification');

    expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();
  });

  it('disables the Save button when no channels are connected', async () => {
    getUserNotificationSettings.mockResolvedValue({
      connections: {
        email: { value: '', enabled: false },
        telegram: { value: '', enabled: false },
        discord: { value: '', enabled: false },
      },
      notifications,
    });
    render(<UserNotificationsPage />);
    await screen.findByText('First Notification');

    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });

  it('toggles a channel checkbox and persists all settings on Save', async () => {
    const user = userEvent.setup();
    render(<UserNotificationsPage />);
    await screen.findByText('First Notification');

    // Turn on telegram for the first notification (was false).
    const firstRow = screen.getAllByRole('row')[1]!;
    const [, firstTelegram] = within(firstRow).getAllByRole('checkbox');
    expect(firstTelegram).not.toBeChecked();
    await user.click(firstTelegram!);
    expect(firstTelegram).toBeChecked();

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(saveUserNotifications).toHaveBeenCalledTimes(1));
    const payload = saveUserNotifications.mock.calls[0]![0];
    // One row per (notification, channel) pair → 2 notifications × 2 channels = 4.
    expect(payload).toHaveLength(4);
    expect(payload).toContainEqual({ channelId: 'telegram', enabled: true, notificationId: 'one' });
    expect(payload).toContainEqual({ channelId: 'email', enabled: true, notificationId: 'one' });
    expect(messageSuccess).toHaveBeenCalledWith('New notification settings saved.');
  });

  it('turns a channel off and saves the disabled state', async () => {
    const user = userEvent.setup();
    render(<UserNotificationsPage />);
    await screen.findByText('First Notification');

    const firstRow = screen.getAllByRole('row')[1]!;
    const [firstEmail] = within(firstRow).getAllByRole('checkbox');
    expect(firstEmail).toBeChecked();
    await user.click(firstEmail!);
    expect(firstEmail).not.toBeChecked();

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(saveUserNotifications).toHaveBeenCalledTimes(1));
    const payload = saveUserNotifications.mock.calls[0]![0];
    expect(payload).toContainEqual({ channelId: 'email', enabled: false, notificationId: 'one' });
  });

  it('shows an error message when saving fails', async () => {
    const user = userEvent.setup();
    saveUserNotifications.mockRejectedValue(new Error('boom'));
    render(<UserNotificationsPage />);
    await screen.findByText('First Notification');

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(messageError).toHaveBeenCalledWith('Failed to save settings.'));
  });

  it('renders a consent prompt when a channel connection is missing', async () => {
    getUserNotificationSettings.mockResolvedValue({
      connections: {
        email: undefined,
        telegram: { value: 'tg', enabled: true },
        discord: { value: 'dc', enabled: true },
      },
      notifications,
    });
    render(<UserNotificationsPage />);
    await screen.findByText('First Notification');

    // Consents renders an info alert prompting to add an email on the Profile page.
    expect(await screen.findByText(/enter your email on/i)).toBeInTheDocument();
  });
});
