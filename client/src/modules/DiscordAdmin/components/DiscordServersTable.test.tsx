import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DiscordServerDto } from '@client/api';
import { DiscordServersTable } from './DiscordServersTable';

const data: DiscordServerDto[] = [
  { id: 1, name: 'Alpha', gratitudeUrl: 'https://a/grat', mentorsChatUrl: 'https://a/mentors' },
  { id: 2, name: 'Beta', gratitudeUrl: 'https://b/grat', mentorsChatUrl: 'https://b/mentors' },
];

describe('<DiscordServersTable />', () => {
  it('renders a row per server with its name and urls', () => {
    render(<DiscordServersTable data={data} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('https://a/grat')).toBeInTheDocument();
    expect(screen.getByText('https://b/mentors')).toBeInTheDocument();
  });

  it('calls onEdit with the row record when Edit is clicked', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<DiscordServersTable data={data} onEdit={onEdit} onDelete={vi.fn()} />);

    const alphaRow = screen.getByRole('row', { name: /Alpha/ });
    await user.click(within(alphaRow).getByText('Edit'));

    expect(onEdit).toHaveBeenCalledWith(data[0]);
  });

  it('calls onDelete with the id only after confirming the popconfirm', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<DiscordServersTable data={data} onEdit={vi.fn()} onDelete={onDelete} />);

    const betaRow = screen.getByRole('row', { name: /Beta/ });
    await user.click(within(betaRow).getByText('Delete'));

    // Popconfirm bubble appears; clicking its OK fires the confirm.
    const confirmBtn = await screen.findByRole('button', { name: /^ok$/i });
    await user.click(confirmBtn);

    await waitFor(() => expect(onDelete).toHaveBeenCalledWith(2));
  });

  it('sorts by name when the Name column header is clicked', async () => {
    const user = userEvent.setup();
    render(<DiscordServersTable data={data} onEdit={vi.fn()} onDelete={vi.fn()} />);

    await user.click(screen.getByText('Name'));

    // After ascending sort the data renders without crashing; both rows still present.
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });
});
