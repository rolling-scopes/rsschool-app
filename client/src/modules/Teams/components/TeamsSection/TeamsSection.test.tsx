import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TeamApi, TeamDistributionDetailedDto, TeamDto } from '@client/api';
import TeamSection from './TeamsSection';

vi.mock('@client/api');

const teams: TeamDto[] = [
  {
    id: 1,
    name: 'Alpha Team',
    description: 'First team',
    teamLeadId: 10,
    students: [
      {
        id: 10,
        fullName: 'Alpha Lead',
        cvLink: '',
        discord: null,
        telegram: '',
        email: 'alpha@example.com',
        githubId: 'alpha-gh',
        rank: 1,
        totalScore: 0,
        location: 'Minsk',
        cvUuid: '',
      },
    ],
  } as TeamDto,
  {
    id: 2,
    name: 'Beta Team',
    description: 'Second team',
    teamLeadId: 20,
    students: [],
  } as unknown as TeamDto,
];

const distribution = {
  id: 5,
  courseId: 100,
  name: 'Spring',
  strictTeamSize: 3,
} as TeamDistributionDetailedDto;

function renderSection(isManager = false) {
  const toggleTeamModal = vi.fn();
  render(<TeamSection distribution={distribution} toggleTeamModal={toggleTeamModal} isManager={isManager} />);
  return { toggleTeamModal };
}

const getTeams = vi.mocked(TeamApi.prototype.getTeams);

describe('<TeamsSection />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getTeams.mockResolvedValue({
      data: { content: teams, pagination: { current: 1, pageSize: 10, total: 2 } },
    } as never);
  });

  it('loads teams on mount and renders their names and member counts', async () => {
    renderSection();

    expect(await screen.findByText('Alpha Team')).toBeInTheDocument();
    expect(screen.getByText('Beta Team')).toBeInTheDocument();
    // member count "1 of 3"
    expect(screen.getByText(/1 of 3/)).toBeInTheDocument();
    expect(getTeams).toHaveBeenCalledWith(100, 5, 10, 1, '');
  });

  it('renders the distribution name in the section title', async () => {
    renderSection();
    expect(await screen.findByText('Spring teams')).toBeInTheDocument();
  });

  it('hides the Action column (Edit team) for non-managers', async () => {
    renderSection(false);
    await screen.findByText('Alpha Team');
    expect(screen.queryByRole('button', { name: /edit team/i })).not.toBeInTheDocument();
  });

  it('shows the Edit team action for managers and calls toggleTeamModal with the team', async () => {
    const user = userEvent.setup();
    const { toggleTeamModal } = renderSection(true);
    await screen.findByText('Alpha Team');

    const editButtons = screen.getAllByRole('button', { name: /edit team/i });
    expect(editButtons.length).toBeGreaterThan(0);
    await user.click(editButtons[0]);
    expect(toggleTeamModal).toHaveBeenCalledWith(teams[0]);
  });

  it('re-fetches teams with the search term when searching', async () => {
    const user = userEvent.setup();
    renderSection();
    await screen.findByText('Alpha Team');

    const searchBox = screen.getByPlaceholderText('input search text');
    await user.type(searchBox, 'Alpha{enter}');

    await waitFor(() => expect(getTeams).toHaveBeenCalledWith(100, 5, 10, 1, 'Alpha'));
  });

  it('expands a team with students to reveal the nested students table', async () => {
    const user = userEvent.setup();
    renderSection();
    await screen.findByText('Alpha Team');

    // Only Alpha (1 student) is expandable; Beta has 0 students -> no expand control.
    const expandBtn = screen.getByRole('button', { name: /expand row/i });
    await user.click(expandBtn);

    expect(await screen.findByText('Alpha Lead')).toBeInTheDocument();
  });

  it('renders the combined mobile "team" column on an xs viewport', async () => {
    // The Team column (name + description + member count stacked) is responsive to the
    // `xs` breakpoint only. Force a narrow viewport so that mobile renderer runs.
    window.innerWidth = 360;
    window.dispatchEvent(new Event('resize'));

    renderSection();
    await screen.findByText('Alpha Team');

    // The stacked mobile cell still surfaces the team name + member count.
    expect(screen.getByText('Alpha Team')).toBeInTheDocument();
    expect(screen.getByText(/1 of 3/)).toBeInTheDocument();

    window.innerWidth = 1024;
    window.dispatchEvent(new Event('resize'));
  });
});
