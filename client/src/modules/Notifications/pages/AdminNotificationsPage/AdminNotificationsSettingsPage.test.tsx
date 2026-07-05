import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationDto, NotificationType } from '@client/api';
import { AdminNotificationsPage } from './AdminNotificationsSettingsPage';

// --- Mocks -----------------------------------------------------------------

const messageSuccess = vi.fn();
const messageError = vi.fn();
vi.mock('@client/hooks', () => ({
  useMessage: () => ({ message: { success: messageSuccess, error: messageError } }),
}));

const { getNotifications, saveNotification, createNotification, deleteNotification } = vi.hoisted(() => ({
  getNotifications: vi.fn(),
  saveNotification: vi.fn(),
  createNotification: vi.fn(),
  deleteNotification: vi.fn(),
}));

vi.mock('@client/modules/Notifications/services/notifications', async () => ({
  ...(await vi.importActual('@client/modules/Notifications/services/notifications')),
  NotificationsService: function NotificationsService() {
    return { getNotifications, saveNotification, createNotification, deleteNotification };
  },
}));

// --- Fixtures --------------------------------------------------------------

function makeNotification(overrides: Partial<NotificationDto> = {}): NotificationDto {
  return {
    id: 'task-deadline',
    name: 'Task Deadline',
    enabled: true,
    type: NotificationType.Event,
    channels: [],
    parentId: '',
    ...overrides,
  } as NotificationDto;
}

const existing = makeNotification({ id: 'existing', name: 'Existing One' });

describe('AdminNotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getNotifications.mockResolvedValue([existing]);
  });

  it('loads and renders the notifications table', async () => {
    render(<AdminNotificationsPage />);

    expect(await screen.findByText('Existing One')).toBeInTheDocument();
    expect(getNotifications).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /add notification/i })).toBeInTheDocument();
  });

  it('opens the create modal when Add Notification is clicked', async () => {
    const user = userEvent.setup();
    render(<AdminNotificationsPage />);
    await screen.findByText('Existing One');

    await user.click(screen.getByRole('button', { name: /add notification/i }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Notification Settings')).toBeInTheDocument();
  });

  it('opens the edit modal pre-filled with the row record', async () => {
    const user = userEvent.setup();
    render(<AdminNotificationsPage />);
    await screen.findByText('Existing One');

    await user.click(screen.getByText('Edit'));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('Id')).toHaveValue('existing');
    // Editing an existing notification disables the Id field.
    expect(screen.getByLabelText('Id')).toBeDisabled();
  });

  it('creates a new notification and appends it to the table on submit', async () => {
    const user = userEvent.setup();
    const created = makeNotification({ id: 'fresh', name: 'Fresh One' });
    createNotification.mockResolvedValue({ data: created });

    render(<AdminNotificationsPage />);
    await screen.findByText('Existing One');

    await user.click(screen.getByRole('button', { name: /add notification/i }));
    await screen.findByRole('dialog');

    await user.type(screen.getByLabelText('Id'), 'fresh');
    await user.type(screen.getByLabelText('Name'), 'Fresh One');
    const typeSelect = screen.getByLabelText('Type');
    fireEvent.mouseDown(typeSelect);
    fireEvent.click(await screen.findByTitle(NotificationType.Event));

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(createNotification).toHaveBeenCalledTimes(1));
    expect(saveNotification).not.toHaveBeenCalled();
    expect(messageSuccess).toHaveBeenCalledWith('New notification settings saved.');
    expect(await screen.findByText('Fresh One')).toBeInTheDocument();
  });

  it('saves (updates) an existing notification on submit', async () => {
    const user = userEvent.setup();
    const updated = makeNotification({ id: 'existing', name: 'Renamed' });
    saveNotification.mockResolvedValue({ data: updated });

    render(<AdminNotificationsPage />);
    await screen.findByText('Existing One');

    await user.click(screen.getByText('Edit'));
    await screen.findByRole('dialog');

    const nameInput = screen.getByLabelText('Name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Renamed');

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(saveNotification).toHaveBeenCalledTimes(1));
    expect(createNotification).not.toHaveBeenCalled();
    expect(await screen.findByText('Renamed')).toBeInTheDocument();
    expect(messageSuccess).toHaveBeenCalledWith('New notification settings saved.');
  });

  it('shows an error message when saving fails', async () => {
    const user = userEvent.setup();
    createNotification.mockRejectedValue(new Error('boom'));

    render(<AdminNotificationsPage />);
    await screen.findByText('Existing One');

    await user.click(screen.getByRole('button', { name: /add notification/i }));
    await screen.findByRole('dialog');

    await user.type(screen.getByLabelText('Id'), 'fresh');
    await user.type(screen.getByLabelText('Name'), 'Fresh One');
    const typeSelect = screen.getByLabelText('Type');
    fireEvent.mouseDown(typeSelect);
    fireEvent.click(await screen.findByTitle(NotificationType.Event));

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(messageError).toHaveBeenCalledWith('Failed to save settings.'));
  });

  it('deletes a notification after confirmation and removes its row', async () => {
    const user = userEvent.setup();
    deleteNotification.mockResolvedValue(undefined);

    render(<AdminNotificationsPage />);
    await screen.findByText('Existing One');

    await user.click(screen.getByText('Delete'));
    const yes = await screen.findByRole('button', { name: 'Yes' });
    await user.click(yes);

    await waitFor(() => expect(deleteNotification).toHaveBeenCalledWith('existing'));
    expect(messageSuccess).toHaveBeenCalledWith('Notification is deleted.');
    await waitFor(() => expect(screen.queryByText('Existing One')).not.toBeInTheDocument());
  });

  it('shows an error message when deletion fails', async () => {
    const user = userEvent.setup();
    deleteNotification.mockRejectedValue(new Error('nope'));

    render(<AdminNotificationsPage />);
    await screen.findByText('Existing One');

    await user.click(screen.getByText('Delete'));
    await user.click(await screen.findByRole('button', { name: 'Yes' }));

    await waitFor(() => expect(messageError).toHaveBeenCalledWith('Failed to delete notification.'));
    // Row stays because the delete failed.
    expect(screen.getByText('Existing One')).toBeInTheDocument();
  });

  it('closes the create modal on cancel without saving', async () => {
    const user = userEvent.setup();
    render(<AdminNotificationsPage />);
    await screen.findByText('Existing One');

    await user.click(screen.getByRole('button', { name: /add notification/i }));
    const dialog = await screen.findByRole('dialog');

    await user.click(within(dialog).getByRole('button', { name: /cancel/i }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(createNotification).not.toHaveBeenCalled();
    expect(saveNotification).not.toHaveBeenCalled();
  });
});
