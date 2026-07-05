import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DiscordServerDto, UpdateDiscordServerDto } from '@client/api';
import { DiscordServersModal } from './DiscordServersModal';

// --- Boundary ---------------------------------------------------------------
// The modal is a pure presentational wrapper around the shared ModalForm; it owns
// no API of its own. Everything (antd Modal/Form/Input, ModalForm) stays real so
// validation + submit wiring is exercised end to end.

const editServer: DiscordServerDto = {
  id: 5,
  name: 'RS Discord',
  gratitudeUrl: 'https://discord.gg/grat',
  mentorsChatUrl: 'https://discord.gg/mentors',
};

function makeProps(overrides: Partial<Parameters<typeof DiscordServersModal>[0]> = {}) {
  return {
    data: {} as Partial<DiscordServerDto>,
    title: 'Discord/Telegram channel',
    submit: vi.fn().mockResolvedValue(undefined),
    cancel: vi.fn(),
    getInitialValues: (d: Partial<DiscordServerDto>) => d,
    loading: false,
    ...overrides,
  } as Parameters<typeof DiscordServersModal>[0];
}

describe('<DiscordServersModal />', () => {
  it('renders nothing when data is null', () => {
    const { container } = render(<DiscordServersModal {...makeProps({ data: null })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the title and three empty inputs when creating', () => {
    render(<DiscordServersModal {...makeProps()} />);

    expect(screen.getByText('Discord/Telegram channel')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('');
    expect(screen.getByLabelText('Gratitude URL')).toHaveValue('');
    expect(screen.getByLabelText('Mentors chat URL')).toHaveValue('');
  });

  it('prefills the inputs from getInitialValues when editing', () => {
    render(<DiscordServersModal {...makeProps({ data: editServer })} />);

    expect(screen.getByLabelText('Name')).toHaveValue('RS Discord');
    expect(screen.getByLabelText('Gratitude URL')).toHaveValue('https://discord.gg/grat');
    expect(screen.getByLabelText('Mentors chat URL')).toHaveValue('https://discord.gg/mentors');
  });

  it('shows validation errors and does not submit when fields are empty', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<DiscordServersModal {...props} />);

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText('Please enter server name')).toBeInTheDocument();
    expect(screen.getByText('Please enter gratitude URL')).toBeInTheDocument();
    expect(screen.getByText('Please enter mentors chat URL')).toBeInTheDocument();
    expect(props.submit).not.toHaveBeenCalled();
  });

  it('submits the typed values when all fields are valid', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<DiscordServersModal {...props} />);

    await user.type(screen.getByLabelText('Name'), 'New Server');
    await user.type(screen.getByLabelText('Gratitude URL'), 'https://g.url');
    await user.type(screen.getByLabelText('Mentors chat URL'), 'https://m.url');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() =>
      expect(props.submit).toHaveBeenCalledWith({
        name: 'New Server',
        gratitudeUrl: 'https://g.url',
        mentorsChatUrl: 'https://m.url',
      } satisfies UpdateDiscordServerDto),
    );
  });

  it('submits edited values keyed off the existing record', async () => {
    const user = userEvent.setup();
    const props = makeProps({ data: editServer });
    render(<DiscordServersModal {...props} />);

    const name = screen.getByLabelText('Name');
    await user.clear(name);
    await user.type(name, 'Renamed');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(props.submit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Renamed' })));
  });

  it('cancels immediately when the form is untouched', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<DiscordServersModal {...props} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(props.cancel).toHaveBeenCalled();
  });
});
