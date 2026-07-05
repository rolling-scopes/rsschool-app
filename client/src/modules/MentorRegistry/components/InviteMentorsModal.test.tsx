import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InviteMentorsModal from './InviteMentorsModal';

// --- Boundary mocks --------------------------------------------------------

// Brittle-widget policy: react-quill mounts a contenteditable Quill editor that
// does not work in jsdom. Replace it with a minimal controlled textarea that
// preserves the antd Form.Item value/onChange contract so we can drive the
// "Invitation Text" field like a user.
vi.mock('react-quill', () => ({
  default: (props: { id?: string; value?: string; onChange?: (v: string) => void; placeholder?: string }) => (
    <textarea
      // Forward the `id` antd Form.Item injects so the label associates with this control.
      id={props.id}
      data-testid="quill"
      placeholder={props.placeholder}
      value={props.value ?? ''}
      onChange={e => props.onChange?.(e.target.value)}
    />
  ),
}));
vi.mock('react-quill/dist/quill.snow.css', () => ({}));

// Generated DisciplinesApi: loaded once on mount via useAsync.
const { getDisciplines, inviteMentors } = vi.hoisted(() => ({
  getDisciplines: vi.fn(),
  inviteMentors: vi.fn(),
}));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  DisciplinesApi: function DisciplinesApi() {
    return { getDisciplines };
  },
}));

// Service class used inside the modal: mock only its inviteMentors boundary.
vi.mock('@client/services/mentorRegistry', () => ({
  MentorRegistryService: function MentorRegistryService() {
    return { inviteMentors };
  },
}));

const disciplines = [
  { id: 'd1', name: 'JavaScript' },
  { id: 'd2', name: 'Java' },
];

describe('<InviteMentorsModal />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getDisciplines.mockResolvedValue({ data: disciplines });
    inviteMentors.mockResolvedValue(undefined);
  });

  it('renders the modal with the title and all form fields', async () => {
    render(<InviteMentorsModal onCancel={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Invite as a Mentor')).toBeInTheDocument();
    expect(screen.getByLabelText('Disciplines')).toBeInTheDocument();
    expect(screen.getByText('Mentor in the Past')).toBeInTheDocument();
    expect(screen.getByLabelText('Invitation Text')).toBeInTheDocument();

    // Disciplines load asynchronously and populate the multi-select options.
    await waitFor(() => expect(getDisciplines).toHaveBeenCalled());
  });

  it('loads discipline options from the API and shows them in the select', async () => {
    render(<InviteMentorsModal onCancel={vi.fn()} />);

    await waitFor(() => expect(getDisciplines).toHaveBeenCalled());

    const select = screen.getByLabelText('Disciplines');
    fireEvent.mouseDown(select);

    await waitFor(() => {
      expect(within(document.body).getByText('JavaScript')).toBeInTheDocument();
      expect(within(document.body).getByText('Java')).toBeInTheDocument();
    });
  });

  it('blocks submit and shows validation errors when required fields are empty', async () => {
    const user = userEvent.setup();
    render(<InviteMentorsModal onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText('Please select disciplines.')).toBeInTheDocument();
    expect(await screen.findByText('Please add invitation text.')).toBeInTheDocument();
    expect(inviteMentors).not.toHaveBeenCalled();
  });

  it('submits the filled form, calls inviteMentors with the payload and closes', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<InviteMentorsModal onCancel={onCancel} />);

    await waitFor(() => expect(getDisciplines).toHaveBeenCalled());

    // Pick a discipline from the multi-select.
    const select = screen.getByLabelText('Disciplines');
    fireEvent.mouseDown(select);
    fireEvent.click(await within(document.body).findByText('JavaScript'));

    // Toggle "Mentor in the Past".
    await user.click(screen.getByRole('checkbox'));

    // Fill the (stubbed) rich-text invitation editor.
    fireEvent.change(screen.getByTestId('quill'), { target: { value: 'Join us!' } });

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(inviteMentors).toHaveBeenCalledTimes(1));
    expect(inviteMentors).toHaveBeenCalledWith({
      disciplines: ['d1'],
      isMentor: true,
      text: 'Join us!',
    });
    await waitFor(() => expect(onCancel).toHaveBeenCalled());
  });

  it('calls onCancel when the modal is dismissed without changes', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<InviteMentorsModal onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalled();
  });
});
