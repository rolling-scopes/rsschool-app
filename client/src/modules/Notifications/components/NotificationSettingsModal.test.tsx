/* eslint-disable testing-library/no-node-access */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { NotificationDto, NotificationType } from '@client/api';
import { setupUser } from '@client/__tests__/setupUser';
import { NotificationSettingsModal } from './NotificationSettingsModal';

function makeNotification(overrides: Partial<NotificationDto> = {}): NotificationDto {
  return {
    id: 'task-deadline',
    name: 'Task Deadline',
    enabled: true,
    type: NotificationType.Event,
    channels: [{ channelId: 'email', template: { subject: 'Hi', body: 'Email body' } }],
    parentId: '',
    ...overrides,
  } as NotificationDto;
}

// All tab panels are force-rendered into the DOM, so identical field labels (e.g. "body")
// repeat across channel tabs. Locate a channel's panel by the hidden channelId input it
// carries, then scope queries to it.
function getChannelPanel(channelId: string): HTMLElement {
  const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[id$="channelId"]'));
  const input = inputs.find(el => el.value === channelId);
  if (!input) {
    throw new Error(`No panel found for channel "${channelId}"`);
  }
  return input.closest('[role="tabpanel"]') as HTMLElement;
}

describe('NotificationSettingsModal', () => {
  it('hides the Parent select when there is one or fewer notifications', () => {
    render(<NotificationSettingsModal notifications={[{ id: 'a', name: 'A' }]} onCancel={vi.fn()} onOk={vi.fn()} />);

    expect(screen.queryByText('Parent')).not.toBeInTheDocument();
  });

  it('shows the Parent select when there is more than one notification', () => {
    render(
      <NotificationSettingsModal
        notifications={[
          { id: 'a', name: 'A' },
          { id: 'b', name: 'B' },
        ]}
        onCancel={vi.fn()}
        onOk={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Parent')).toBeInTheDocument();
  });

  it('switches between Settings and channel template tabs', async () => {
    const user = setupUser();
    render(
      <NotificationSettingsModal
        notification={makeNotification()}
        notifications={[]}
        onCancel={vi.fn()}
        onOk={vi.fn()}
      />,
    );

    const settingsTab = screen.getByRole('tab', { name: 'Settings' });
    const emailTab = screen.getByRole('tab', { name: 'email' });

    expect(settingsTab).toHaveAttribute('aria-selected', 'true');

    await user.click(emailTab);
    expect(emailTab).toHaveAttribute('aria-selected', 'true');
    expect(settingsTab).toHaveAttribute('aria-selected', 'false');
  });

  it('shows validation errors and does not call onOk when required fields are empty', async () => {
    const user = setupUser();
    const onOk = vi.fn();
    render(<NotificationSettingsModal notifications={[]} onCancel={vi.fn()} onOk={onOk} />);

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText('Please enter id')).toBeInTheDocument();
    expect(await screen.findByText('Please enter name')).toBeInTheDocument();
    // antd renders the Select's validation help in more than one node; assert presence.
    expect((await screen.findAllByText('Please select type')).length).toBeGreaterThan(0);
    expect(onOk).not.toHaveBeenCalled();
  });

  it('submits the filled form and calls onOk with the entered values', async () => {
    const user = setupUser();
    const onOk = vi.fn();
    render(<NotificationSettingsModal notifications={[]} onCancel={vi.fn()} onOk={onOk} />);

    await user.type(screen.getByLabelText('Id'), 'new-notification');
    await user.type(screen.getByLabelText('Name'), 'New Notification');
    const active = screen.getByRole('checkbox', { name: 'Active' });
    expect(active).not.toBeChecked();
    await user.click(active);
    expect(active).toBeChecked();

    // Type select (antd Select → role combobox; open via mouseDown, options in body).
    const typeSelect = screen.getByLabelText('Type');
    fireEvent.mouseDown(typeSelect);
    const option = await screen.findByTitle(NotificationType.Message);
    fireEvent.click(option);

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(onOk).toHaveBeenCalledTimes(1));
    const submitted = onOk.mock.calls[0]![0];
    expect(submitted.id).toBe('new-notification');
    expect(submitted.name).toBe('New Notification');
    expect(submitted.enabled).toBe(true);
    expect(submitted.type).toBe(NotificationType.Message);
  });

  it('prefills existing settings and channel fields, then submits their values', async () => {
    const user = setupUser();
    const onOk = vi.fn();
    render(
      <NotificationSettingsModal notification={makeNotification()} notifications={[]} onCancel={vi.fn()} onOk={onOk} />,
    );

    expect(screen.getByLabelText('Id')).toBeDisabled();
    expect(screen.getByLabelText('Id')).toHaveValue('task-deadline');
    expect(screen.getByLabelText('Name')).toHaveValue('Task Deadline');
    expect(screen.getByRole('checkbox', { name: 'Active' })).toBeChecked();
    const emailPanel = getChannelPanel('email');
    expect(within(emailPanel).getByLabelText('subject')).toHaveValue('Hi');
    expect(within(emailPanel).getByLabelText('body')).toBeInTheDocument();
    const telegramPanel = getChannelPanel('telegram');
    expect(within(telegramPanel).queryByLabelText('subject')).toBeNull();
    expect(within(telegramPanel).getByLabelText('body')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(onOk).toHaveBeenCalledTimes(1));
    const submitted = onOk.mock.calls[0]![0];
    const emailChannel = submitted.channels.find((c: { channelId: string }) => c.channelId === 'email');
    expect(emailChannel).toBeDefined();
    expect(emailChannel.template.body).toBe('Email body');
    expect(emailChannel.template.subject).toBe('Hi');
  });

  it('updates a channel template body and submits the new value', async () => {
    const user = setupUser();
    const onOk = vi.fn();
    render(
      <NotificationSettingsModal notification={makeNotification()} notifications={[]} onCancel={vi.fn()} onOk={onOk} />,
    );

    const telegramPanel = getChannelPanel('telegram');
    const body = within(telegramPanel).getByLabelText('body');
    await user.clear(body);
    await user.type(body, 'Telegram message');

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(onOk).toHaveBeenCalledTimes(1));
    const submitted = onOk.mock.calls[0]![0];
    const telegramChannel = submitted.channels.find((c: { channelId: string }) => c.channelId === 'telegram');
    expect(telegramChannel.template.body).toBe('Telegram message');
  });

  it('renders the new notification fields and tabs, then cancels without changes', async () => {
    const user = setupUser();
    const onCancel = vi.fn();
    render(<NotificationSettingsModal notifications={[]} onCancel={onCancel} onOk={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Notification Settings')).toBeInTheDocument();
    for (const label of ['Id', 'Name', 'Type']) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByLabelText('Id')).not.toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Active' })).not.toBeChecked();
    for (const name of ['Settings', 'email', 'telegram', 'discord']) {
      expect(screen.getByRole('tab', { name })).toBeInTheDocument();
    }

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
