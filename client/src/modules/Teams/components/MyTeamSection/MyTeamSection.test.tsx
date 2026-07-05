import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TeamApi, TeamDistributionDetailedDto } from '@client/api';
import MyTeamSection from './MyTeamSection';

vi.mock('@client/api');

const copyToClipboard = vi.fn();
vi.mock('react-use', async () => {
  const actual = await vi.importActual<typeof import('react-use')>('react-use');
  return { ...actual, useCopyToClipboard: () => [{}, copyToClipboard] as never };
});

const myTeam = {
  id: 7,
  name: 'My Awesome Team',
  description: 'A description of my team',
  teamLeadId: 1,
  chatLink: 'https://discord.gg/team',
  students: [
    {
      id: 1,
      fullName: 'Lead Person',
      cvLink: '',
      discord: null,
      telegram: '',
      email: 'lead@example.com',
      githubId: 'lead-gh',
      rank: 1,
      totalScore: 0,
      location: 'Minsk',
      cvUuid: '',
    },
  ],
};

function makeDistribution(overrides: Partial<TeamDistributionDetailedDto> = {}): TeamDistributionDetailedDto {
  return {
    id: 5,
    courseId: 100,
    name: 'Distribution',
    myTeam,
    ...overrides,
  } as TeamDistributionDetailedDto;
}

function renderSection(overrides: Partial<Parameters<typeof MyTeamSection>[0]> = {}) {
  const props = {
    distribution: makeDistribution(),
    toggleTeamModal: vi.fn(),
    studentId: 1,
    copyPassword: vi.fn().mockResolvedValue(undefined),
    changePassword: vi.fn().mockResolvedValue(undefined),
    reloadDistribution: vi.fn().mockResolvedValue(undefined),
    setActiveTab: vi.fn(),
    ...overrides,
  };
  render(<MyTeamSection {...props} />);
  return props;
}

describe('<MyTeamSection />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(TeamApi.prototype.leaveTeam).mockResolvedValue({} as never);
  });

  it('renders nothing when there is no myTeam', () => {
    const { container } = render(
      <MyTeamSection
        distribution={makeDistribution({ myTeam: undefined })}
        toggleTeamModal={vi.fn()}
        copyPassword={vi.fn()}
        changePassword={vi.fn()}
        reloadDistribution={vi.fn().mockResolvedValue(undefined)}
        setActiveTab={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the team name, description and members table', () => {
    renderSection();
    expect(screen.getByText('My Awesome Team')).toBeInTheDocument();
    expect(screen.getByText('A description of my team')).toBeInTheDocument();
    expect(screen.getByText('Lead Person')).toBeInTheDocument();
  });

  it('shows lead-only controls (password / change password / chat link) for the team lead', () => {
    renderSection({ studentId: 1 });
    expect(screen.getByRole('button', { name: /invitation password/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /change password/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /chat link/i })).toBeInTheDocument();
  });

  it('hides lead-only controls for a non-lead member', () => {
    renderSection({ studentId: 999 });
    expect(screen.queryByRole('button', { name: /invitation password/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /change password/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /leave team/i })).toBeInTheDocument();
  });

  it('calls copyPassword with the team id when "Invitation password" is clicked', async () => {
    const user = userEvent.setup();
    const { copyPassword } = renderSection({ studentId: 1 });
    await user.click(screen.getByRole('button', { name: /invitation password/i }));
    expect(copyPassword).toHaveBeenCalledWith(7);
  });

  it('calls changePassword with the team id when "Change password" is clicked', async () => {
    const user = userEvent.setup();
    const { changePassword } = renderSection({ studentId: 1 });
    await user.click(screen.getByRole('button', { name: /change password/i }));
    expect(changePassword).toHaveBeenCalledWith(7);
  });

  it('copies the chat link to clipboard when "Chat link" is clicked', async () => {
    const user = userEvent.setup();
    renderSection({ studentId: 1 });
    await user.click(screen.getByRole('button', { name: /chat link/i }));
    expect(copyToClipboard).toHaveBeenCalledWith('https://discord.gg/team');
  });

  it('opens the team modal with the team data when the lead clicks edit', async () => {
    const user = userEvent.setup();
    const { toggleTeamModal } = renderSection({ studentId: 1 });
    // The edit icon is the only "img" with aria-label edit; click it via its role.
    await user.click(screen.getByLabelText('edit'));
    expect(toggleTeamModal).toHaveBeenCalledWith(myTeam);
  });

  it('leaves the team: calls leaveTeam, switches tab and reloads', async () => {
    const user = userEvent.setup();
    const { setActiveTab, reloadDistribution } = renderSection({ studentId: 999 });

    await user.click(screen.getByRole('button', { name: /leave team/i }));

    await waitFor(() => expect(setActiveTab).toHaveBeenCalledWith('teams'));
    expect(reloadDistribution).toHaveBeenCalled();
    expect(TeamApi.prototype.leaveTeam).toHaveBeenCalledWith(
      makeDistribution().courseId,
      makeDistribution().id,
      myTeam.id,
    );
  });
});
