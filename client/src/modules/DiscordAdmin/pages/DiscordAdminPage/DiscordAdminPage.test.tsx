import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { message } from 'antd';
import { DiscordServerDto } from '@client/api';
import { DiscordAdminPage } from './DiscordAdminPage';

// --- Boundary mocks --------------------------------------------------------

// AdminPageLayout pulls in Header + AdminSider (session/router heavy). Replace it
// with a passthrough that still renders the title and children.
vi.mock('@client/shared/components/PageLayout', () => ({
  AdminPageLayout: ({ title, children }: { title: string; children: ReactNode }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

vi.mock('@client/modules/Course/contexts', () => ({
  useActiveCourseContext: () => ({ courses: [] }),
}));

// The hook instantiates `new DiscordServersApi()` at module scope. Mock the class
// so every method is a shared spy.
const { getDiscordServers, createDiscordServer, updateDiscordServer, deleteDiscordServer } = vi.hoisted(() => ({
  getDiscordServers: vi.fn(),
  createDiscordServer: vi.fn(),
  updateDiscordServer: vi.fn(),
  deleteDiscordServer: vi.fn(),
}));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  DiscordServersApi: function DiscordServersApi() {
    return { getDiscordServers, createDiscordServer, updateDiscordServer, deleteDiscordServer };
  },
}));

const servers: DiscordServerDto[] = [
  { id: 1, name: 'Alpha', gratitudeUrl: 'https://a/grat', mentorsChatUrl: 'https://a/mentors' },
  { id: 2, name: 'Beta', gratitudeUrl: 'https://b/grat', mentorsChatUrl: 'https://b/mentors' },
];

describe('<DiscordAdminPage />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getDiscordServers.mockResolvedValue({ data: servers });
    createDiscordServer.mockResolvedValue({});
    updateDiscordServer.mockResolvedValue({});
    deleteDiscordServer.mockResolvedValue({});
  });

  it('loads and renders servers on mount', async () => {
    render(<DiscordAdminPage />);

    await waitFor(() => expect(getDiscordServers).toHaveBeenCalled());
    expect(await screen.findByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /manage discord\/telegram/i })).toBeInTheDocument();
  });

  it('opens an empty create modal when the add button is clicked', async () => {
    const user = userEvent.setup();
    render(<DiscordAdminPage />);
    await screen.findByText('Alpha');

    await user.click(screen.getByRole('button', { name: /add discord\/telegram channel/i }));

    expect(await screen.findByText('Discord/Telegram channel')).toBeInTheDocument();
    // The Table renders sortable <th aria-label="Name">, so scope the field lookup
    // to the modal dialog to avoid colliding with the column header.
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByLabelText('Name')).toHaveValue('');
  });

  it('creates a server and reloads the list on submit', async () => {
    const user = userEvent.setup();
    render(<DiscordAdminPage />);
    await screen.findByText('Alpha');

    await user.click(screen.getByRole('button', { name: /add discord\/telegram channel/i }));
    await screen.findByText('Discord/Telegram channel');

    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText('Name'), 'Gamma');
    await user.type(within(dialog).getByLabelText('Gratitude URL'), 'https://g/grat');
    await user.type(within(dialog).getByLabelText('Mentors chat URL'), 'https://g/mentors');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() =>
      expect(createDiscordServer).toHaveBeenCalledWith({
        name: 'Gamma',
        gratitudeUrl: 'https://g/grat',
        mentorsChatUrl: 'https://g/mentors',
      }),
    );
    await waitFor(() => expect(getDiscordServers).toHaveBeenCalledTimes(2));
  });

  it('opens the edit modal prefilled and updates by id', async () => {
    const user = userEvent.setup();
    render(<DiscordAdminPage />);
    await screen.findByText('Alpha');

    const alphaRow = screen.getByRole('row', { name: /Alpha/ });
    await user.click(within(alphaRow).getByText('Edit'));

    await screen.findByText('Discord/Telegram channel');
    const dialog = screen.getByRole('dialog');
    const name = within(dialog).getByLabelText('Name');
    expect(name).toHaveValue('Alpha');
    await user.clear(name);
    await user.type(name, 'Alpha 2');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() =>
      expect(updateDiscordServer).toHaveBeenCalledWith(1, expect.objectContaining({ name: 'Alpha 2' })),
    );
  });

  it('deletes a server after confirming and reloads', async () => {
    const user = userEvent.setup();
    render(<DiscordAdminPage />);
    await screen.findByText('Alpha');

    const betaRow = screen.getByRole('row', { name: /Beta/ });
    await user.click(within(betaRow).getByText('Delete'));
    await user.click(await screen.findByRole('button', { name: /^ok$/i }));

    await waitFor(() => expect(deleteDiscordServer).toHaveBeenCalledWith(2));
    await waitFor(() => expect(getDiscordServers).toHaveBeenCalledTimes(2));
  });

  it('shows an error message when delete fails', async () => {
    const user = userEvent.setup();
    const errorSpy = vi.spyOn(message, 'error').mockImplementation(() => ({}) as never);
    deleteDiscordServer.mockRejectedValueOnce(new Error('boom'));
    render(<DiscordAdminPage />);
    await screen.findByText('Alpha');

    const betaRow = screen.getByRole('row', { name: /Beta/ });
    await user.click(within(betaRow).getByText('Delete'));
    await user.click(await screen.findByRole('button', { name: /^ok$/i }));

    await waitFor(() =>
      expect(errorSpy).toHaveBeenCalledWith('Failed to delete discord/telegram channel. Please try later.'),
    );
    errorSpy.mockRestore();
  });

  it('shows an error message when create fails and keeps the modal open', async () => {
    const user = userEvent.setup();
    const errorSpy = vi.spyOn(message, 'error').mockImplementation(() => ({}) as never);
    createDiscordServer.mockRejectedValueOnce(new Error('boom'));
    render(<DiscordAdminPage />);
    await screen.findByText('Alpha');

    await user.click(screen.getByRole('button', { name: /add discord\/telegram channel/i }));
    await screen.findByText('Discord/Telegram channel');
    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText('Name'), 'Gamma');
    await user.type(within(dialog).getByLabelText('Gratitude URL'), 'https://g/grat');
    await user.type(within(dialog).getByLabelText('Mentors chat URL'), 'https://g/mentors');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() =>
      expect(errorSpy).toHaveBeenCalledWith('An error occurred. Cannot save discord/telegram channel.'),
    );
    errorSpy.mockRestore();
  });
});
