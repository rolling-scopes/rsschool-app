import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { message } from 'antd';
import { DisciplineDto, EventDto } from '@client/api';
import { EventsAdminPage } from './EventsAdminPage';

// --- Boundary mocks --------------------------------------------------------

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

// The useEvents hook instantiates EventsApi + DisciplinesApi at module scope.
const { getEvents, createEvent, updateEvent, deleteEvent, getDisciplines } = vi.hoisted(() => ({
  getEvents: vi.fn(),
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
  deleteEvent: vi.fn(),
  getDisciplines: vi.fn(),
}));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  EventsApi: function EventsApi() {
    return { getEvents, createEvent, updateEvent, deleteEvent };
  },
  DisciplinesApi: function DisciplinesApi() {
    return { getDisciplines };
  },
}));

const disciplines: DisciplineDto[] = [
  { id: 10, name: 'Frontend' },
  { id: 20, name: 'Backend' },
];

const events = [
  {
    id: 1,
    name: 'Alpha',
    type: 'lecture_online',
    descriptionUrl: 'https://a',
    description: 'Alpha description',
    discipline: { id: 10, name: 'Frontend' },
  },
] as unknown as EventDto[];

async function selectOption(
  user: ReturnType<typeof userEvent.setup>,
  dialog: HTMLElement,
  label: string,
  text: string,
) {
  await user.click(within(dialog).getByLabelText(label));
  const option = await screen.findByText(text, { selector: '.ant-select-item-option-content' });
  await user.click(option);
}

describe('<EventsAdminPage />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getEvents.mockResolvedValue({ data: events });
    getDisciplines.mockResolvedValue({ data: disciplines });
    createEvent.mockResolvedValue({});
    updateEvent.mockResolvedValue({});
    deleteEvent.mockResolvedValue({});
  });

  it('loads events and disciplines on mount', async () => {
    render(<EventsAdminPage />);

    await waitFor(() => expect(getEvents).toHaveBeenCalled());
    expect(getDisciplines).toHaveBeenCalled();
    expect(await screen.findByText('Alpha')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /manage events/i })).toBeInTheDocument();
  });

  it('creates an event with the mapped CreateEventDto payload', async () => {
    const user = userEvent.setup();
    render(<EventsAdminPage />);
    await screen.findByText('Alpha');

    await user.click(screen.getByRole('button', { name: /add event/i }));
    await screen.findByText('Event');
    const dialog = screen.getByRole('dialog');

    await user.type(within(dialog).getByLabelText('Name'), 'Kickoff');
    await selectOption(user, dialog, 'Event Type', 'Webinar');
    await selectOption(user, dialog, 'Discipline', 'Backend');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() =>
      expect(createEvent).toHaveBeenCalledWith({
        name: 'Kickoff',
        description: undefined,
        descriptionUrl: undefined,
        type: 'webinar',
        disciplineId: 20,
      }),
    );
    await waitFor(() => expect(getEvents).toHaveBeenCalledTimes(2));
  });

  it('opens the edit modal prefilled and updates by id', async () => {
    const user = userEvent.setup();
    render(<EventsAdminPage />);
    await screen.findByText('Alpha');

    const row = screen.getByRole('row', { name: /Alpha/ });
    await user.click(within(row).getByText('Edit'));
    await screen.findByText('Event');
    const dialog = screen.getByRole('dialog');

    const name = within(dialog).getByLabelText('Name');
    expect(name).toHaveValue('Alpha');
    await user.clear(name);
    await user.type(name, 'Alpha 2');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(updateEvent).toHaveBeenCalledWith(1, expect.objectContaining({ name: 'Alpha 2' })));
  });

  it('deletes an event after confirming and reloads', async () => {
    const user = userEvent.setup();
    render(<EventsAdminPage />);
    await screen.findByText('Alpha');

    const row = screen.getByRole('row', { name: /Alpha/ });
    await user.click(within(row).getByText('Delete'));
    await user.click(await screen.findByRole('button', { name: /^ok$/i }));

    await waitFor(() => expect(deleteEvent).toHaveBeenCalledWith(1));
    await waitFor(() => expect(getEvents).toHaveBeenCalledTimes(2));
  });

  it('shows an error message when delete fails', async () => {
    const user = userEvent.setup();
    const errorSpy = vi.spyOn(message, 'error').mockImplementation(() => ({}) as never);
    deleteEvent.mockRejectedValueOnce(new Error('boom'));
    render(<EventsAdminPage />);
    await screen.findByText('Alpha');

    const row = screen.getByRole('row', { name: /Alpha/ });
    await user.click(within(row).getByText('Delete'));
    await user.click(await screen.findByRole('button', { name: /^ok$/i }));

    await waitFor(() => expect(errorSpy).toHaveBeenCalledWith('Failed to delete item. Please try later.'));
    errorSpy.mockRestore();
  });

  it('shows an error message when save fails', async () => {
    const user = userEvent.setup();
    const errorSpy = vi.spyOn(message, 'error').mockImplementation(() => ({}) as never);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    updateEvent.mockRejectedValueOnce(new Error('boom'));
    render(<EventsAdminPage />);
    await screen.findByText('Alpha');

    const row = screen.getByRole('row', { name: /Alpha/ });
    await user.click(within(row).getByText('Edit'));
    await screen.findByText('Event');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(errorSpy).toHaveBeenCalledWith('An error occurred. Cannot save event.'));
    errorSpy.mockRestore();
    consoleSpy.mockRestore();
  });
});
