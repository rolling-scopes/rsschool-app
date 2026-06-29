import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { message } from 'antd';
import { TeamApi, TeamDistributionApi, TeamDistributionDetailedDto, TeamDto } from '@client/api';
import Teams from './Teams';

// --- Boundary mocks --------------------------------------------------------

vi.mock('@client/api');

// PageLayout is page chrome (ThemeSwitch + theme providers) that fails in jsdom. Stub it to
// render its title + children so the header and section body render directly.
vi.mock('@client/shared/components/PageLayout', () => ({
  PageLayout: (props: { title: string; loading: boolean; children: React.ReactNode }) => (
    <div data-testid="page-layout" data-loading={String(props.loading)}>
      <h1>{props.title}</h1>
      {props.children}
    </div>
  ),
}));

// useDistribution owns the remote distribution fetch; drive its return from the test.
const { distributionState } = vi.hoisted(() => ({
  distributionState: {
    distribution: undefined as TeamDistributionDetailedDto | undefined,
    loadDistribution: vi.fn().mockResolvedValue(undefined),
    loading: false,
  },
}));

vi.mock('../hooks', () => ({
  useDistribution: () => distributionState,
}));

// notification + modalForm controller boundaries.
const mockNotificationSuccess = vi.fn();
const { modalForm } = vi.hoisted(() => ({
  modalForm: {
    open: false,
    toggle: vi.fn(),
    mode: 'create',
    formData: undefined as Partial<TeamDto> | undefined,
  },
}));

vi.mock('@client/hooks', () => ({
  useMessage: () => ({ notification: { success: mockNotificationSuccess } }),
  useModalForm: () => modalForm,
}));

// Session + active course contexts.
const { sessionValue, courseValue } = vi.hoisted(() => ({
  sessionValue: {
    isAdmin: false,
    githubId: 'tester',
    courses: { 42: { roles: [], studentId: 7 } } as Record<number, { roles: string[]; studentId?: number }>,
  },
  courseValue: { course: { id: 42, alias: 'rs2024', name: 'RS Course' } },
}));

vi.mock('@client/modules/Course/contexts', async () => {
  const { createContext } = await vi.importActual<typeof import('react')>('react');
  return {
    SessionContext: createContext(sessionValue),
    useActiveCourseContext: () => courseValue,
  };
});

// next/router supplies the teamDistributionId query param.
vi.mock('next/router', () => ({
  useRouter: () => ({ query: { teamDistributionId: '5' } }),
}));

// Heavy section + modal children are stubbed to markers exposing the callbacks the page wires.
vi.mock('../components', () => ({
  TeamsHeader: (props: {
    isManager: boolean;
    handleCreateTeam: () => void;
    handleDistributeStudents: () => void;
    handleJoinTeam: () => void;
    setActiveTab: (t: string) => void;
  }) => (
    <div data-testid="teams-header" data-manager={String(props.isManager)}>
      <button type="button" onClick={props.handleCreateTeam}>
        header-create-team
      </button>
      <button type="button" onClick={props.handleDistributeStudents}>
        header-distribute
      </button>
      <button type="button" onClick={props.handleJoinTeam}>
        header-join
      </button>
      <button type="button" onClick={() => props.setActiveTab('students')}>
        tab-students
      </button>
      <button type="button" onClick={() => props.setActiveTab('myTeam')}>
        tab-myteam
      </button>
    </div>
  ),
  TeamsSection: () => <div data-testid="teams-section" />,
  StudentsWithoutTeamSection: () => <div data-testid="students-section" />,
  MyTeamSection: (props: {
    copyPassword: (teamId: number) => Promise<void>;
    changePassword: (teamId: number) => Promise<void>;
  }) => (
    <div data-testid="myteam-section">
      <button type="button" onClick={() => props.copyPassword(8)}>
        copy-password
      </button>
      <button type="button" onClick={() => props.changePassword(8)}>
        change-password
      </button>
    </div>
  ),
  TeamModal: (props: { onSubmit: (record: unknown, id?: number) => void; onCancel: () => void }) => (
    <div data-testid="team-modal">
      <button type="button" onClick={() => props.onSubmit({ name: 'New Team' })}>
        modal-create-submit
      </button>
      <button type="button" onClick={() => props.onSubmit({ name: 'Edited Team' }, 99)}>
        modal-update-submit
      </button>
      <button type="button" onClick={props.onCancel}>
        modal-cancel
      </button>
    </div>
  ),
  JoinTeamModal: (props: { onSubmit: (teamId: number, record: unknown) => void; onCancel: () => void }) => (
    <div data-testid="join-modal">
      <button type="button" onClick={() => props.onSubmit(3, { password: 'pw' })}>
        join-submit
      </button>
      <button type="button" onClick={props.onCancel}>
        join-cancel
      </button>
    </div>
  ),
}));

// --- Fixtures --------------------------------------------------------------

const distributeStudentsToTeam = vi.mocked(TeamDistributionApi.prototype.distributeStudentsToTeam);
const joinTeam = vi.mocked(TeamApi.prototype.joinTeam);
const createTeam = vi.mocked(TeamApi.prototype.createTeam);
const updateTeam = vi.mocked(TeamApi.prototype.updateTeam);
const getTeamPassword = vi.mocked(TeamApi.prototype.getTeamPassword);
const changeTeamPassword = vi.mocked(TeamApi.prototype.changeTeamPassword);

function makeDistribution(over: Partial<TeamDistributionDetailedDto> = {}): TeamDistributionDetailedDto {
  return {
    id: 5,
    name: 'Distribution 5',
    courseId: 42,
    strictTeamSize: 4,
    teamsCount: 2,
    studentsWithoutTeamCount: 3,
    myTeam: null,
    ...over,
  } as TeamDistributionDetailedDto;
}

beforeEach(() => {
  vi.clearAllMocks();
  modalForm.open = false;
  modalForm.formData = undefined;
  sessionValue.isAdmin = false;
  distributionState.distribution = makeDistribution();
  distributionState.loadDistribution = vi.fn().mockResolvedValue(undefined);
  distributeStudentsToTeam.mockResolvedValue({} as never);
  joinTeam.mockResolvedValue({ data: { name: 'Team A', description: 'desc' } } as never);
  createTeam.mockResolvedValue({ data: { id: 11, name: 'New Team', description: 'd' } } as never);
  updateTeam.mockResolvedValue({} as never);
  getTeamPassword.mockResolvedValue({ data: { password: 'secret' } } as never);
  changeTeamPassword.mockResolvedValue({ data: { password: 'new-secret' } } as never);
});

describe('<Teams />', () => {
  it('renders the page title and the header when a distribution is loaded', () => {
    render(<Teams />);

    expect(screen.getByRole('heading', { name: 'RS Teams' })).toBeInTheDocument();
    expect(screen.getByTestId('teams-header')).toBeInTheDocument();
    // Default tab renders the teams section.
    expect(screen.getByTestId('teams-section')).toBeInTheDocument();
  });

  it('does not render the header or any section when there is no distribution', () => {
    distributionState.distribution = undefined;
    render(<Teams />);

    expect(screen.queryByTestId('teams-header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('teams-section')).not.toBeInTheDocument();
  });

  it('switches the active tab to the students-without-team section', async () => {
    const user = userEvent.setup();
    render(<Teams />);

    await user.click(screen.getByRole('button', { name: 'tab-students' }));

    expect(await screen.findByTestId('students-section')).toBeInTheDocument();
    expect(screen.queryByTestId('teams-section')).not.toBeInTheDocument();
  });

  it('switches the active tab to the my-team section', async () => {
    const user = userEvent.setup();
    render(<Teams />);

    await user.click(screen.getByRole('button', { name: 'tab-myteam' }));

    expect(await screen.findByTestId('myteam-section')).toBeInTheDocument();
  });

  it('opens the team modal from the header create-team action', async () => {
    const user = userEvent.setup();
    render(<Teams />);

    await user.click(screen.getByRole('button', { name: 'header-create-team' }));

    expect(modalForm.toggle).toHaveBeenCalled();
  });

  it('distributes students and reloads the distribution', async () => {
    const user = userEvent.setup();
    render(<Teams />);

    await user.click(screen.getByRole('button', { name: 'header-distribute' }));

    await waitFor(() => expect(distributeStudentsToTeam).toHaveBeenCalledWith(42, 5));
    await waitFor(() => expect(distributionState.loadDistribution).toHaveBeenCalled());
  });

  it('shows an error when distributing students fails', async () => {
    const errorSpy = vi.spyOn(message, 'error').mockImplementation(() => ({}) as never);
    distributeStudentsToTeam.mockRejectedValue(new Error('boom'));
    const user = userEvent.setup();
    render(<Teams />);

    await user.click(screen.getByRole('button', { name: 'header-distribute' }));

    await waitFor(() =>
      expect(errorSpy).toHaveBeenCalledWith('Failed to distribute students to team. Please try later.'),
    );
    errorSpy.mockRestore();
  });

  it('opens and submits the join-team modal, joining the chosen team', async () => {
    const user = userEvent.setup();
    render(<Teams />);

    await user.click(screen.getByRole('button', { name: 'header-join' }));
    await user.click(await screen.findByRole('button', { name: 'join-submit' }));

    await waitFor(() => expect(joinTeam).toHaveBeenCalledWith(42, 5, 3, { password: 'pw' }));
    await waitFor(() => expect(distributionState.loadDistribution).toHaveBeenCalled());
  });

  it('shows an error when joining a team fails', async () => {
    const errorSpy = vi.spyOn(message, 'error').mockImplementation(() => ({}) as never);
    joinTeam.mockRejectedValue(new Error('nope'));
    const user = userEvent.setup();
    render(<Teams />);

    await user.click(screen.getByRole('button', { name: 'header-join' }));
    await user.click(await screen.findByRole('button', { name: 'join-submit' }));

    await waitFor(() => expect(errorSpy).toHaveBeenCalledWith('Failed to join to team. Please try later.'));
    errorSpy.mockRestore();
  });

  it('closes the join-team modal on cancel', async () => {
    const user = userEvent.setup();
    render(<Teams />);

    await user.click(screen.getByRole('button', { name: 'header-join' }));
    expect(await screen.findByTestId('join-modal')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'join-cancel' }));
    await waitFor(() => expect(screen.queryByTestId('join-modal')).not.toBeInTheDocument());
  });

  it('creates a new team through the team modal when it is open', async () => {
    modalForm.open = true;
    const user = userEvent.setup();
    render(<Teams />);

    await user.click(await screen.findByRole('button', { name: 'modal-create-submit' }));

    await waitFor(() => expect(createTeam).toHaveBeenCalledWith(42, 5, { name: 'New Team' }));
    await waitFor(() => expect(distributionState.loadDistribution).toHaveBeenCalled());
  });

  it('updates an existing team through the team modal when an id is supplied', async () => {
    modalForm.open = true;
    const user = userEvent.setup();
    render(<Teams />);

    await user.click(await screen.findByRole('button', { name: 'modal-update-submit' }));

    await waitFor(() => expect(updateTeam).toHaveBeenCalledWith(42, 5, 99, { name: 'Edited Team' }));
    expect(createTeam).not.toHaveBeenCalled();
  });

  it('shows an error when team submission fails', async () => {
    const errorSpy = vi.spyOn(message, 'error').mockImplementation(() => ({}) as never);
    updateTeam.mockRejectedValue(new Error('fail'));
    modalForm.open = true;
    const user = userEvent.setup();
    render(<Teams />);

    await user.click(await screen.findByRole('button', { name: 'modal-update-submit' }));

    await waitFor(() => expect(errorSpy).toHaveBeenCalledWith('Failed to create team. Please try later.'));
    errorSpy.mockRestore();
  });

  it('copies a team invitation password from the create-team success dialog', async () => {
    modalForm.open = true;
    const user = userEvent.setup();
    render(<Teams />);

    await user.click(await screen.findByRole('button', { name: 'modal-create-submit' }));
    await waitFor(() => expect(createTeam).toHaveBeenCalled());

    // The success confirm dialog offers "Copy invitation password" -> copyPassword(team.id).
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /Copy invitation password/i }));

    await waitFor(() => expect(getTeamPassword).toHaveBeenCalledWith(42, 5, 11));
    await waitFor(() =>
      expect(mockNotificationSuccess).toHaveBeenCalledWith({
        message: 'Password copied to clipboard',
        duration: 2,
      }),
    );
  });

  it('copies the team password from the my-team section', async () => {
    const user = userEvent.setup();
    render(<Teams />);

    await user.click(screen.getByRole('button', { name: 'tab-myteam' }));
    await user.click(await screen.findByRole('button', { name: 'copy-password' }));

    await waitFor(() => expect(getTeamPassword).toHaveBeenCalledWith(42, 5, 8));
    await waitFor(() =>
      expect(mockNotificationSuccess).toHaveBeenCalledWith({ message: 'Password copied to clipboard', duration: 2 }),
    );
  });

  it('shows an error when copying the team password fails', async () => {
    const errorSpy = vi.spyOn(message, 'error').mockImplementation(() => ({}) as never);
    getTeamPassword.mockRejectedValue(new Error('boom'));
    const user = userEvent.setup();
    render(<Teams />);

    await user.click(screen.getByRole('button', { name: 'tab-myteam' }));
    await user.click(await screen.findByRole('button', { name: 'copy-password' }));

    await waitFor(() => expect(errorSpy).toHaveBeenCalledWith('Something went wrong. Please try again later.'));
    errorSpy.mockRestore();
  });

  it('regenerates and copies a new team password from the my-team section', async () => {
    const user = userEvent.setup();
    render(<Teams />);

    await user.click(screen.getByRole('button', { name: 'tab-myteam' }));
    await user.click(await screen.findByRole('button', { name: 'change-password' }));

    await waitFor(() => expect(changeTeamPassword).toHaveBeenCalledWith(42, 5, 8));
    await waitFor(() =>
      expect(mockNotificationSuccess).toHaveBeenCalledWith({
        message: 'New Password copied to clipboard',
        duration: 2,
      }),
    );
  });

  it('shows an error when regenerating the team password fails', async () => {
    const errorSpy = vi.spyOn(message, 'error').mockImplementation(() => ({}) as never);
    changeTeamPassword.mockRejectedValue(new Error('boom'));
    const user = userEvent.setup();
    render(<Teams />);

    await user.click(screen.getByRole('button', { name: 'tab-myteam' }));
    await user.click(await screen.findByRole('button', { name: 'change-password' }));

    await waitFor(() => expect(errorSpy).toHaveBeenCalledWith('Something went wrong. Please try again later.'));
    errorSpy.mockRestore();
  });
});
