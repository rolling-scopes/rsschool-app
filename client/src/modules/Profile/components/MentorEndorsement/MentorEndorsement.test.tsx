import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MentorEndorsement } from './MentorEndorsement';

// --- Boundary mock ---------------------------------------------------------
// ProfileApi is instantiated at module scope; getEndorsement is called via useAsync
// only when the modal is open.
const { getEndorsement } = vi.hoisted(() => ({ getEndorsement: vi.fn() }));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  ProfileApi: function ProfileApi() {
    return { getEndorsement };
  },
}));

function makeProps(overrides: Partial<Parameters<typeof MentorEndorsement>[0]> = {}) {
  return {
    open: true,
    githubId: 'octocat',
    onClose: vi.fn(),
    ...overrides,
  } as Parameters<typeof MentorEndorsement>[0];
}

describe('<MentorEndorsement />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getEndorsement.mockResolvedValue({
      data: {
        summary: 'Line one\nLine two',
        data: { name: 'Joe', empty: null, nested: { keep: 'yes', drop: null } },
      },
    });
  });

  it('does not fetch when the modal is closed', () => {
    render(<MentorEndorsement {...makeProps({ open: false })} />);
    expect(getEndorsement).not.toHaveBeenCalled();
  });

  it('fetches the endorsement for the github id when open', async () => {
    render(<MentorEndorsement {...makeProps()} />);
    await waitFor(() => expect(getEndorsement).toHaveBeenCalledWith('octocat'));
  });

  it('renders the generated summary text', async () => {
    render(<MentorEndorsement {...makeProps()} />);

    expect(await screen.findByText('Generated Text')).toBeInTheDocument();
    expect(screen.getByText(/Line one/)).toBeInTheDocument();
    expect(screen.getByText(/Line two/)).toBeInTheDocument();
  });

  it('renders the cleaned data model with nulls stripped', async () => {
    render(<MentorEndorsement {...makeProps()} />);

    await screen.findByText('Data Model');
    // The read-only JSON dump is the only textbox in the modal.
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    const json = JSON.parse(textarea.value);
    expect(json).toEqual({ name: 'Joe', nested: { keep: 'yes' } });
    expect(json).not.toHaveProperty('empty');
  });

  it('shows an error alert when the request fails', async () => {
    getEndorsement.mockRejectedValueOnce(new Error('generation failed'));
    render(<MentorEndorsement {...makeProps()} />);

    expect(await screen.findByText('generation failed')).toBeInTheDocument();
  });

  it('calls onClose when the OK button is clicked', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<MentorEndorsement {...props} />);
    await screen.findByText('Generated Text');

    await user.click(screen.getByRole('button', { name: /ok/i }));

    expect(props.onClose).toHaveBeenCalled();
  });
});
