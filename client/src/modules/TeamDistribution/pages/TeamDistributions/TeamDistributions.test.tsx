import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TeamDistributionApi, TeamDistributionDto } from '@client/api';
import TeamDistributions from './TeamDistributions';

// --- Boundary mocks --------------------------------------------------------

vi.mock('@client/api');

// PageLayout is page chrome (header, course name, ThemeSwitch) that pulls in theme/config
// providers unavailable in jsdom. Stub it to render its title + children and surface the
// loading flag so the page body (welcome card + distribution cards) renders directly.
vi.mock('@client/shared/components/PageLayout', () => ({
  PageLayout: (props: { title: string; loading: boolean; children: React.ReactNode }) => (
    <div data-testid="page-layout" data-loading={String(props.loading)}>
      <h1>{props.title}</h1>
      {props.children}
    </div>
  ),
}));

// useMessage surfaces success/error toasts; assert through these spies.
const mockError = vi.fn();
const mockSuccess = vi.fn();

// useModalForm is the create/edit modal controller. Drive its open flag + formData
// from the test so we can exercise both the "no modal" and "modal open" branches.
const { modalForm } = vi.hoisted(() => ({
  modalForm: {
    open: false,
    toggle: vi.fn(),
    formData: undefined as TeamDistributionDto | undefined,
  },
}));

vi.mock('@client/hooks', () => ({
  useMessage: () => ({ message: { error: mockError, success: mockSuccess } }),
  useModalForm: () => modalForm,
}));

// Session + active course come from contexts; supply minimal shapes. The manager flag
// is derived from isCourseManager(session) which is true for an admin session.
const { sessionValue, courseValue } = vi.hoisted(() => ({
  sessionValue: { isAdmin: false, githubId: 'tester', courses: {} },
  courseValue: { course: { id: 42, alias: 'rs2024', name: 'RS Course' } },
}));

vi.mock('@client/modules/Course/contexts', async () => {
  const { createContext } = await vi.importActual<typeof import('react')>('react');
  return {
    SessionContext: createContext(sessionValue),
    useActiveCourseContext: () => courseValue,
  };
});

// The create/edit modal and submit-score modal each fetch their own remote data; stub
// them as light markers that surface their open state and the cancel/close callbacks.
vi.mock('@client/modules/TeamDistribution/components/TeamDistributionModal/', () => ({
  TeamDistributionModal: (props: { onCancel: () => void; onSubmit: () => void; data?: TeamDistributionDto }) => (
    <div data-testid="distribution-modal">
      <span>edit:{props.data?.name ?? 'new'}</span>
      <button type="button" onClick={props.onSubmit}>
        submit-modal
      </button>
      <button type="button" onClick={props.onCancel}>
        cancel-modal
      </button>
    </div>
  ),
}));

vi.mock('@client/modules/TeamDistribution/components/SubmitScoreModal', () => ({
  SubmitScoreModal: (props: { distribution: TeamDistributionDto | null; onClose: () => void }) => (
    <div data-testid="submit-score-modal" data-open={String(props.distribution != null)}>
      <span>{props.distribution?.name}</span>
      <button type="button" onClick={props.onClose}>
        close-score
      </button>
    </div>
  ),
}));

// --- Fixtures --------------------------------------------------------------

const getCourseTeamDistributions = vi.mocked(TeamDistributionApi.prototype.getCourseTeamDistributions);
const teamDistributionRegistry = vi.mocked(TeamDistributionApi.prototype.teamDistributionRegistry);
const teamDistributionDeleteRegistry = vi.mocked(TeamDistributionApi.prototype.teamDistributionDeleteRegistry);
const deleteTeamDistribution = vi.mocked(TeamDistributionApi.prototype.deleteTeamDistribution);

function makeDistribution(over: Partial<TeamDistributionDto> = {}): TeamDistributionDto {
  return {
    id: 1,
    name: 'Spring Distribution',
    description: 'Group project distribution',
    descriptionUrl: '',
    startDate: '2024-05-01',
    endDate: '2099-05-31',
    minTotalScore: 0,
    registrationStatus: 'available',
    ...over,
  } as TeamDistributionDto;
}

beforeEach(() => {
  vi.clearAllMocks();
  modalForm.open = false;
  modalForm.formData = undefined;
  sessionValue.isAdmin = false;
  getCourseTeamDistributions.mockResolvedValue({ data: [makeDistribution()] } as never);
  teamDistributionRegistry.mockResolvedValue({} as never);
  teamDistributionDeleteRegistry.mockResolvedValue({} as never);
  deleteTeamDistribution.mockResolvedValue({} as never);
});

describe('<TeamDistributions />', () => {
  it('loads and renders the course distributions on mount', async () => {
    render(<TeamDistributions />);

    await waitFor(() => expect(getCourseTeamDistributions).toHaveBeenCalledWith(42));
    expect(await screen.findByText('Spring Distribution')).toBeInTheDocument();
    // Welcome card shows the non-manager headline for a plain session.
    expect(screen.getByText('Become a member of the team!')).toBeInTheDocument();
  });

  it('shows an error toast when loading distributions fails', async () => {
    getCourseTeamDistributions.mockRejectedValue(new Error('boom'));
    render(<TeamDistributions />);

    await waitFor(() =>
      expect(mockError).toHaveBeenCalledWith('Something went wrong, please try reloading the page later'),
    );
  });

  it('renders nothing in the list area when there are no distributions', async () => {
    getCourseTeamDistributions.mockResolvedValue({ data: [] } as never);
    render(<TeamDistributions />);

    await waitFor(() => expect(getCourseTeamDistributions).toHaveBeenCalled());
    expect(screen.queryByText('Spring Distribution')).not.toBeInTheDocument();
  });

  it('shows the manager welcome headline and renders the manager submit-score modal', async () => {
    sessionValue.isAdmin = true;
    render(<TeamDistributions />);

    expect(await screen.findByText('Create student teams to solve group tasks!')).toBeInTheDocument();
    // Manager-only SubmitScoreModal is mounted (closed initially).
    expect(screen.getByTestId('submit-score-modal')).toHaveAttribute('data-open', 'false');
  });

  it('does not mount the submit-score modal for a non-manager', async () => {
    render(<TeamDistributions />);

    await screen.findByText('Spring Distribution');
    expect(screen.queryByTestId('submit-score-modal')).not.toBeInTheDocument();
  });

  it('opens the create-distribution modal from the welcome card (manager)', async () => {
    sessionValue.isAdmin = true;
    const user = userEvent.setup();
    render(<TeamDistributions />);

    await user.click(await screen.findByRole('button', { name: /add a new distribution/i }));

    expect(modalForm.toggle).toHaveBeenCalled();
  });

  it('renders the create/edit modal when the modal-form flag is open', async () => {
    modalForm.open = true;
    render(<TeamDistributions />);

    expect(await screen.findByTestId('distribution-modal')).toBeInTheDocument();
    expect(screen.getByText('edit:new')).toBeInTheDocument();
  });

  it('cancels the create/edit modal through its onCancel handler', async () => {
    modalForm.open = true;
    const user = userEvent.setup();
    render(<TeamDistributions />);

    await user.click(await screen.findByRole('button', { name: 'cancel-modal' }));

    expect(modalForm.toggle).toHaveBeenCalled();
  });

  it('closes the modal and reloads data after a successful create/edit submit', async () => {
    modalForm.open = true;
    const user = userEvent.setup();
    render(<TeamDistributions />);

    await user.click(await screen.findByRole('button', { name: 'submit-modal' }));

    expect(modalForm.toggle).toHaveBeenCalled();
    // loadData runs again after submit (initial + reload).
    await waitFor(() => expect(getCourseTeamDistributions).toHaveBeenCalledTimes(2));
  });

  it('opens the edit modal with the distribution data when the card edit button is clicked', async () => {
    sessionValue.isAdmin = true;
    const user = userEvent.setup();
    render(<TeamDistributions />);

    await user.click(await screen.findByRole('button', { name: /edit/i }));

    expect(modalForm.toggle).toHaveBeenCalledWith(expect.objectContaining({ name: 'Spring Distribution' }));
  });

  it('deletes a distribution and reloads when the card delete button is clicked (manager)', async () => {
    sessionValue.isAdmin = true;
    const user = userEvent.setup();
    render(<TeamDistributions />);

    await user.click(await screen.findByRole('button', { name: /delete/i }));

    await waitFor(() => expect(deleteTeamDistribution).toHaveBeenCalledWith(42, 1));
    // loadData is called again after the delete (initial + reload).
    await waitFor(() => expect(getCourseTeamDistributions).toHaveBeenCalledTimes(2));
  });

  it('shows an error toast when deleting a distribution fails (manager)', async () => {
    sessionValue.isAdmin = true;
    deleteTeamDistribution.mockRejectedValue(new Error('fail'));
    const user = userEvent.setup();
    render(<TeamDistributions />);

    await user.click(await screen.findByRole('button', { name: /delete/i }));

    await waitFor(() =>
      expect(mockError).toHaveBeenCalledWith('Failed to delete team distribution. Please try later.'),
    );
  });

  it('opens the submit-score modal for the chosen distribution via the card action (manager)', async () => {
    sessionValue.isAdmin = true;
    const user = userEvent.setup();
    render(<TeamDistributions />);

    await screen.findByText('Spring Distribution');
    // The card exposes a "Submit score" action for managers.
    await user.click(screen.getByRole('button', { name: /submit score/i }));

    await waitFor(() =>
      expect(within(screen.getByTestId('submit-score-modal')).getByText('Spring Distribution')).toBeInTheDocument(),
    );
    expect(screen.getByTestId('submit-score-modal')).toHaveAttribute('data-open', 'true');
  });

  it('registers for a distribution and shows a success toast', async () => {
    getCourseTeamDistributions.mockResolvedValue({
      data: [makeDistribution({ registrationStatus: 'available' })],
    } as never);
    const user = userEvent.setup();
    render(<TeamDistributions />);

    const registerBtn = await screen.findByRole('button', { name: /^register$/i });
    await user.click(registerBtn);

    await waitFor(() => expect(teamDistributionRegistry).toHaveBeenCalledWith(42, 1));
    await waitFor(() => expect(mockSuccess).toHaveBeenCalledWith('Registration completed.'));
  });

  it('shows an error toast when registration fails', async () => {
    getCourseTeamDistributions.mockResolvedValue({
      data: [makeDistribution({ registrationStatus: 'available' })],
    } as never);
    teamDistributionRegistry.mockRejectedValue(new Error('nope'));
    const user = userEvent.setup();
    render(<TeamDistributions />);

    const registerBtn = await screen.findByRole('button', { name: /^register$/i });
    await user.click(registerBtn);

    await waitFor(() => expect(mockError).toHaveBeenCalledWith('Registration failed. Please try again later'));
  });

  it('cancels an existing registration and shows a success toast', async () => {
    // A "completed" registration with a future deadline renders the Cancel link, whose
    // confirm dialog drives handleDeleteRegister on the page.
    getCourseTeamDistributions.mockResolvedValue({
      data: [makeDistribution({ registrationStatus: 'completed' })],
    } as never);
    const user = userEvent.setup();
    render(<TeamDistributions />);

    // The "Cancel" registration link (antd Typography.Link) opens a confirm dialog.
    await user.click(await screen.findByText('Cancel'));

    // Confirm the cancellation in the antd confirm dialog.
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /Cancel Registration/i }));

    await waitFor(() => expect(teamDistributionDeleteRegistry).toHaveBeenCalledWith(42, 1));
    await waitFor(() => expect(mockSuccess).toHaveBeenCalledWith('Registration canceled.'));
  });

  it('shows an error toast when cancelling a registration fails', async () => {
    getCourseTeamDistributions.mockResolvedValue({
      data: [makeDistribution({ registrationStatus: 'completed' })],
    } as never);
    teamDistributionDeleteRegistry.mockRejectedValue(new Error('nope'));
    const user = userEvent.setup();
    render(<TeamDistributions />);

    await user.click(await screen.findByText('Cancel'));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /Cancel Registration/i }));

    await waitFor(() =>
      expect(mockError).toHaveBeenCalledWith('Cancellation of registration failed. Please try again later'),
    );
  });

  it('closes the submit-score modal through its onClose handler (manager)', async () => {
    sessionValue.isAdmin = true;
    const user = userEvent.setup();
    render(<TeamDistributions />);

    // Open the modal for the card's distribution, then close it.
    await screen.findByText('Spring Distribution');
    await user.click(screen.getByRole('button', { name: /submit score/i }));
    await waitFor(() => expect(screen.getByTestId('submit-score-modal')).toHaveAttribute('data-open', 'true'));

    await user.click(screen.getByRole('button', { name: 'close-score' }));

    await waitFor(() => expect(screen.getByTestId('submit-score-modal')).toHaveAttribute('data-open', 'false'));
  });
});
