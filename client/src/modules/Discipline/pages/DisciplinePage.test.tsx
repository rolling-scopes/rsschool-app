import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { message, Modal } from 'antd';
import { DisciplineDto } from '@client/api';
import { DisciplinePage } from './DisciplinePage';

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

// The page and the modal both instantiate `new DisciplinesApi()`. Mock the whole
// class so both share these spies.
const { getDisciplines, createDiscipline, updateDiscipline, deleteDiscipline } = vi.hoisted(() => ({
  getDisciplines: vi.fn(),
  createDiscipline: vi.fn(),
  updateDiscipline: vi.fn(),
  deleteDiscipline: vi.fn(),
}));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  DisciplinesApi: function DisciplinesApi() {
    return { getDisciplines, createDiscipline, updateDiscipline, deleteDiscipline };
  },
}));

const disciplines: DisciplineDto[] = [
  { id: 1, name: 'Frontend' },
  { id: 2, name: 'Backend' },
];

describe('<DisciplinePage />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getDisciplines.mockResolvedValue({ data: disciplines });
    createDiscipline.mockResolvedValue({});
    updateDiscipline.mockResolvedValue({});
    deleteDiscipline.mockResolvedValue({});
  });

  afterEach(() => {
    // The delete flow opens an imperative Modal.confirm (appended to body, not torn
    // down by RTL). Destroy it so it cannot leak into a later test. The page's own
    // DisciplineModal is React-controlled and unmounts via RTL cleanup.
    Modal.destroyAll();
  });

  it('loads and renders disciplines on mount', async () => {
    render(<DisciplinePage />);

    await waitFor(() => expect(getDisciplines).toHaveBeenCalled());
    expect(await screen.findByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /manage disciplines/i })).toBeInTheDocument();
  });

  it('opens the create modal when "Add Disciplines" is clicked', async () => {
    const user = userEvent.setup();
    render(<DisciplinePage />);
    await screen.findByText('Frontend');

    await user.click(screen.getByRole('button', { name: /add disciplines/i }));

    expect(await screen.findByText('Add discipline')).toBeInTheDocument();
    // Create mode → empty input.
    expect(screen.getByLabelText('Discipline')).toHaveValue('');
  });

  it('creates a discipline and reloads the list on submit', async () => {
    const user = userEvent.setup();
    render(<DisciplinePage />);
    await screen.findByText('Frontend');

    await user.click(screen.getByRole('button', { name: /add disciplines/i }));
    await screen.findByText('Add discipline');

    await user.type(screen.getByLabelText('Discipline'), 'DevOps');
    await user.click(screen.getByRole('button', { name: /ok/i }));

    await waitFor(() => expect(createDiscipline).toHaveBeenCalledWith({ name: 'DevOps' }));
    // loadDisciplines runs once on mount and again after create.
    await waitFor(() => expect(getDisciplines).toHaveBeenCalledTimes(2));
  });

  it('opens the edit modal prefilled when a row edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<DisciplinePage />);
    await screen.findByText('Frontend');

    // First row's first action button is "edit".
    const [firstEditBtn] = within(screen.getByRole('table')).getAllByRole('button');
    await user.click(firstEditBtn!);

    expect(await screen.findByText('Edit discipline')).toBeInTheDocument();
    expect(screen.getByLabelText('Discipline')).toHaveValue('Frontend');
  });

  it('updates the discipline by id when editing and saving', async () => {
    const user = userEvent.setup();
    render(<DisciplinePage />);
    await screen.findByText('Frontend');

    const [firstEditBtn] = within(screen.getByRole('table')).getAllByRole('button');
    await user.click(firstEditBtn!);
    await screen.findByText('Edit discipline');

    const input = screen.getByLabelText('Discipline');
    await user.clear(input);
    await user.type(input, 'Frontend X');
    await user.click(screen.getByRole('button', { name: /ok/i }));

    await waitFor(() => expect(updateDiscipline).toHaveBeenCalledWith(1, { name: 'Frontend X' }));
  });

  it('deletes a discipline after confirming and reloads the list', async () => {
    const user = userEvent.setup();
    render(<DisciplinePage />);
    await screen.findByText('Frontend');

    // First row buttons: [edit, delete] → index 1 is delete.
    const rowButtons = within(screen.getByRole('table')).getAllByRole('button');
    await user.click(rowButtons[1]!);

    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /ok/i }));

    await waitFor(() => expect(deleteDiscipline).toHaveBeenCalledWith(1));
    await waitFor(() => expect(getDisciplines).toHaveBeenCalledTimes(2));
  });

  it('renders an empty table when the API returns no disciplines', async () => {
    getDisciplines.mockResolvedValueOnce({ data: null });
    render(<DisciplinePage />);

    await waitFor(() => expect(getDisciplines).toHaveBeenCalled());
    // The `disciplines || []` fallback keeps the table rendering without crashing.
    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(screen.queryByText('Frontend')).not.toBeInTheDocument();
  });

  it('shows an error message when loading disciplines fails', async () => {
    const errorSpy = vi.spyOn(message, 'error').mockImplementation(() => ({}) as never);
    getDisciplines.mockRejectedValueOnce(new Error('boom'));
    render(<DisciplinePage />);

    await waitFor(() => expect(errorSpy).toHaveBeenCalledWith('Something went wrong. Please try again later.'));
    errorSpy.mockRestore();
  });
});
