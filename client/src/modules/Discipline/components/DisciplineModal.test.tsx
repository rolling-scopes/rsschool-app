import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { message } from 'antd';
import { DisciplineDto } from '@client/api';
import { DisciplineModal } from './DisciplineModal';

// --- Boundary mock ---------------------------------------------------------
// The component instantiates `new DisciplinesApi()` at module scope and calls
// create/update on submit. Mock only that generated API class; everything else
// (antd Modal/Form/Input) stays real.
const { createDiscipline, updateDiscipline } = vi.hoisted(() => ({
  createDiscipline: vi.fn(),
  updateDiscipline: vi.fn(),
}));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  DisciplinesApi: function DisciplinesApi() {
    return { createDiscipline, updateDiscipline };
  },
}));

const editDiscipline: DisciplineDto = { id: 7, name: 'Frontend' };

function makeProps(overrides: Partial<Parameters<typeof DisciplineModal>[0]> = {}) {
  return {
    isModalVisible: true,
    onCancel: vi.fn(),
    loadDisciplines: vi.fn().mockResolvedValue(undefined),
    discipline: null,
    ...overrides,
  } as Parameters<typeof DisciplineModal>[0];
}

describe('<DisciplineModal />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createDiscipline.mockResolvedValue({});
    updateDiscipline.mockResolvedValue({});
  });

  it('renders the "Add discipline" title and an empty input when creating', () => {
    render(<DisciplineModal {...makeProps()} />);

    expect(screen.getByText('Add discipline')).toBeInTheDocument();
    const input = screen.getByLabelText('Discipline');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('renders the "Edit discipline" title and prefills the input when editing', () => {
    render(<DisciplineModal {...makeProps({ discipline: editDiscipline })} />);

    expect(screen.getByText('Edit discipline')).toBeInTheDocument();
    expect(screen.getByLabelText('Discipline')).toHaveValue('Frontend');
  });

  it('does not render the modal body when not visible', () => {
    render(<DisciplineModal {...makeProps({ isModalVisible: false })} />);

    // antd keeps the dialog unmounted until first opened.
    expect(screen.queryByText('Add discipline')).not.toBeInTheDocument();
  });

  it('shows a validation error and does not submit when the name is empty', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<DisciplineModal {...props} />);

    await user.click(screen.getByRole('button', { name: /ok/i }));

    // antd's required rule renders an inline error for the "Discipline" field.
    expect(await screen.findByText(/discipline is required|please input|required/i)).toBeInTheDocument();
    expect(createDiscipline).not.toHaveBeenCalled();
    expect(props.onCancel).not.toHaveBeenCalled();
  });

  it('creates a discipline with the typed name, reloads and closes', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<DisciplineModal {...props} />);

    await user.type(screen.getByLabelText('Discipline'), 'Backend');
    await user.click(screen.getByRole('button', { name: /ok/i }));

    await waitFor(() => expect(createDiscipline).toHaveBeenCalledWith({ name: 'Backend' }));
    expect(updateDiscipline).not.toHaveBeenCalled();
    await waitFor(() => expect(props.loadDisciplines).toHaveBeenCalled());
    await waitFor(() => expect(props.onCancel).toHaveBeenCalled());
  });

  it('updates the existing discipline by id when editing', async () => {
    const user = userEvent.setup();
    const props = makeProps({ discipline: editDiscipline });
    render(<DisciplineModal {...props} />);

    const input = screen.getByLabelText('Discipline');
    await user.clear(input);
    await user.type(input, 'Fullstack');
    await user.click(screen.getByRole('button', { name: /ok/i }));

    await waitFor(() => expect(updateDiscipline).toHaveBeenCalledWith(7, { name: 'Fullstack' }));
    expect(createDiscipline).not.toHaveBeenCalled();
    await waitFor(() => expect(props.loadDisciplines).toHaveBeenCalled());
    await waitFor(() => expect(props.onCancel).toHaveBeenCalled());
  });

  it('shows an error message and stays open when the API rejects', async () => {
    const user = userEvent.setup();
    const errorSpy = vi.spyOn(message, 'error').mockImplementation(() => ({}) as never);
    createDiscipline.mockRejectedValueOnce(new Error('boom'));
    const props = makeProps();
    render(<DisciplineModal {...props} />);

    await user.type(screen.getByLabelText('Discipline'), 'Backend');
    await user.click(screen.getByRole('button', { name: /ok/i }));

    await waitFor(() => expect(errorSpy).toHaveBeenCalledWith('Something went wrong. Please try again later.'));
    expect(props.onCancel).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('calls onCancel when the Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<DisciplineModal {...props} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(props.onCancel).toHaveBeenCalled();
  });
});
