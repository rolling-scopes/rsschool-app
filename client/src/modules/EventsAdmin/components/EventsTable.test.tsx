import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventDto } from '@client/api';
import { EventsTable } from './EventsTable';

const data = [
  {
    id: 1,
    name: 'Alpha',
    type: 'lecture_online',
    descriptionUrl: 'https://a',
    description: 'Alpha description',
    discipline: { id: 10, name: 'Frontend' },
  },
  {
    id: 2,
    name: 'Beta',
    type: 'webinar',
    descriptionUrl: 'https://b',
    description: 'Beta description',
    discipline: { id: 20, name: 'Backend' },
  },
] as unknown as EventDto[];

describe('<EventsTable />', () => {
  it('renders a row per event with name, discipline and type', () => {
    render(<EventsTable data={data} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('webinar')).toBeInTheDocument();
  });

  it('calls onEdit with the row record when Edit is clicked', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<EventsTable data={data} onEdit={onEdit} onDelete={vi.fn()} />);

    const alphaRow = screen.getByRole('row', { name: /Alpha/ });
    await user.click(within(alphaRow).getByText('Edit'));

    expect(onEdit).toHaveBeenCalledWith(data[0]);
  });

  it('calls onDelete with the id after confirming', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<EventsTable data={data} onEdit={vi.fn()} onDelete={onDelete} />);

    const betaRow = screen.getByRole('row', { name: /Beta/ });
    await user.click(within(betaRow).getByText('Delete'));
    await user.click(await screen.findByRole('button', { name: /^ok$/i }));

    await waitFor(() => expect(onDelete).toHaveBeenCalledWith(2));
  });

  it('filters rows via the Name column search', async () => {
    const user = userEvent.setup();
    render(<EventsTable data={data} onEdit={vi.fn()} onDelete={vi.fn()} />);

    // The search icon in the Name column header opens the filter dropdown.
    await user.click(screen.getAllByRole('button', { name: /search/i })[0]);

    const searchInput = await screen.findByPlaceholderText(/search name/i);
    await user.type(searchInput, 'Alpha');

    // Confirm the filter via the dropdown's "Search" button (rendered after the
    // input; the last matching button is the confirm action).
    const searchButtons = screen.getAllByRole('button', { name: /search/i });
    await user.click(searchButtons[searchButtons.length - 1]);

    await waitFor(() => expect(screen.queryByText('Beta')).not.toBeInTheDocument());
    expect(screen.getByText('Alpha')).toBeInTheDocument();
  });
});
