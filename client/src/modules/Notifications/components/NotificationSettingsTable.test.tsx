import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationDto, NotificationType } from '@client/api';
import { NotificationSettingsTable } from './NotificationSettingsTable';

function makeNotification(overrides: Partial<NotificationDto> = {}): NotificationDto {
  return {
    id: 'task-deadline',
    name: 'Task Deadline',
    enabled: true,
    type: NotificationType.Event,
    channels: [],
    parentId: '',
    ...overrides,
  };
}

const notifications: NotificationDto[] = [
  makeNotification({ id: 'enabled-one', name: 'Enabled One', enabled: true }),
  makeNotification({ id: 'disabled-one', name: 'Disabled One', enabled: false }),
];

describe('NotificationSettingsTable', () => {
  it('renders the column headers', () => {
    render(<NotificationSettingsTable notifications={notifications} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('Notification')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders a row per notification with its name', () => {
    render(<NotificationSettingsTable notifications={notifications} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('Enabled One')).toBeInTheDocument();
    expect(screen.getByText('Disabled One')).toBeInTheDocument();
  });

  it('renders the active state with check / minus icons', () => {
    render(<NotificationSettingsTable notifications={notifications} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByLabelText('check-circle')).toBeInTheDocument();
    expect(screen.getByLabelText('minus-circle')).toBeInTheDocument();
  });

  it('renders an empty table when there are no notifications', () => {
    render(<NotificationSettingsTable notifications={[]} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getAllByText(/no data/i).length).toBeGreaterThan(0);
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('calls onEdit with the clicked record', () => {
    const onEdit = vi.fn();
    render(<NotificationSettingsTable notifications={notifications} onEdit={onEdit} onDelete={vi.fn()} />);

    const editLinks = screen.getAllByText('Edit');
    fireEvent.click(editLinks[0]!);

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(notifications[0]);
  });

  it('confirms before deleting and calls onDelete with the record', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<NotificationSettingsTable notifications={notifications} onEdit={vi.fn()} onDelete={onDelete} />);

    const deleteLinks = screen.getAllByText('Delete');
    await user.click(deleteLinks[1]!);

    // Popconfirm bubble opens with the question and Yes/No buttons.
    const popover = await screen.findByText('Are you sure to delete this notification?');
    expect(popover).toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();

    const yes = await screen.findByRole('button', { name: 'Yes' });
    await user.click(yes);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(notifications[1]);
  });

  it('does not call onDelete when the confirmation is cancelled', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<NotificationSettingsTable notifications={notifications} onEdit={vi.fn()} onDelete={onDelete} />);

    await user.click(screen.getAllByText('Delete')[0]!);

    const no = await screen.findByRole('button', { name: 'No' });
    await user.click(no);

    expect(onDelete).not.toHaveBeenCalled();
  });

  it('renders one Edit / Delete action per row', () => {
    render(<NotificationSettingsTable notifications={notifications} onEdit={vi.fn()} onDelete={vi.fn()} />);

    const table = screen.getByRole('table');
    expect(within(table).getAllByText('Edit')).toHaveLength(notifications.length);
    expect(within(table).getAllByText('Delete')).toHaveLength(notifications.length);
  });
});
