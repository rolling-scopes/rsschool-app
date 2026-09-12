import { screen, render } from '@testing-library/react';
import { setupUser } from '@client/__tests__/setupUser';
import { TeamDistributionDetailedDto } from '@client/api';
import TeamsHeader from './TeamsHeader';

function makeDistribution(overrides: Partial<TeamDistributionDetailedDto> = {}): TeamDistributionDetailedDto {
  return {
    id: 5,
    courseId: 100,
    name: 'Spring',
    teamsCount: 3,
    studentsWithoutTeamCount: 12,
    myTeam: undefined,
    ...overrides,
  } as TeamDistributionDetailedDto;
}

function renderHeader(overrides: Partial<Parameters<typeof TeamsHeader>[0]> = {}) {
  const props = {
    courseAlias: 'spring-2024',
    isStudent: false,
    isManager: false,
    distribution: makeDistribution(),
    activeTab: 'teams',
    setActiveTab: vi.fn(),
    handleCreateTeam: vi.fn(),
    handleDistributeStudents: vi.fn(),
    handleJoinTeam: vi.fn(),
    ...overrides,
  };
  render(<TeamsHeader {...props} />);
  return props;
}

describe('<TeamsHeader />', () => {
  it('adds the "My team" tab when the student has a team', () => {
    renderHeader({ distribution: makeDistribution({ myTeam: { id: 1 } as never }) });
    expect(screen.getByRole('tab', { name: /my team/i })).toBeInTheDocument();
  });

  it('renders base tabs and calls setActiveTab when a tab is clicked', async () => {
    const user = setupUser();
    const { setActiveTab } = renderHeader();
    expect(screen.getByRole('tab', { name: /available teams/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /students without team/i })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /my team/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /students without team/i }));
    expect(setActiveTab).toHaveBeenCalledWith('students');
  });

  it('renders student action cards (create / join) and wires their handlers', async () => {
    const user = setupUser();
    const { handleCreateTeam, handleJoinTeam } = renderHeader({
      isStudent: true,
      isManager: false,
      distribution: makeDistribution({ myTeam: undefined }),
    });

    expect(screen.getByText('without team')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /create team/i }));
    expect(await screen.findByText(/are you sure you want to create team\?/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^ok$/i }));
    expect(handleCreateTeam).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /join team/i }));
    expect(await screen.findByText(/are you sure you want to join team\?/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^ok$/i }));
    expect(handleJoinTeam).toHaveBeenCalled();
  });

  it('renders manager action cards (create team / distribute students)', async () => {
    const user = setupUser();
    const { handleCreateTeam, handleDistributeStudents } = renderHeader({ isManager: true });

    expect(screen.getByText('Team management')).toBeInTheDocument();
    expect(screen.getByText('Student distribution')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /distribute students/i }));
    expect(await screen.findByText(/are you sure you want to distribute students\?/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^ok$/i }));
    expect(handleDistributeStudents).toHaveBeenCalled();
    expect(handleCreateTeam).not.toHaveBeenCalled();
  });

  it('shows distributed status and no action cards when the student has a team', () => {
    renderHeader({ isStudent: true, distribution: makeDistribution({ myTeam: { id: 1 } as never }) });
    expect(screen.getByText('distributed')).toBeInTheDocument();
    expect(screen.queryByText('Team management')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /create team/i })).not.toBeInTheDocument();
  });
});
