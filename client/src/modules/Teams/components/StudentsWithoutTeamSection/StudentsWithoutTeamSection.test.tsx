import { screen, render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from 'antd';
import { TeamDistributionApi, TeamDistributionDetailedDto, TeamDistributionStudentDto } from '@client/api';
import StudentsWithoutTeamSection from './StudentsWithoutTeamSection';

vi.mock('@client/api');

const getStudentsWithoutTeam = vi.mocked(TeamDistributionApi.prototype.getStudentsWithoutTeam);
const deleteStudent = vi.mocked(TeamDistributionApi.prototype.teamDistributionControllerDeleteStudentFromDistribution);

const students: TeamDistributionStudentDto[] = [
  {
    id: 1,
    fullName: 'Lonely Student',
    cvLink: '',
    discord: null,
    telegram: '',
    email: 'lonely@example.com',
    githubId: 'lonely-gh',
    rank: 5,
    totalScore: 10,
    location: 'Minsk',
    cvUuid: '',
  },
];

const distribution = {
  id: 5,
  courseId: 100,
  name: 'Spring',
} as TeamDistributionDetailedDto;

function renderSection(isManager = false) {
  const reloadDistribution = vi.fn().mockResolvedValue(undefined);
  render(
    <StudentsWithoutTeamSection
      distribution={distribution}
      isManager={isManager}
      reloadDistribution={reloadDistribution}
    />,
  );
  return { reloadDistribution };
}

describe('<StudentsWithoutTeamSection />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getStudentsWithoutTeam.mockResolvedValue({
      data: { content: students, pagination: { current: 1, pageSize: 10, total: 1 } },
    } as never);
    deleteStudent.mockResolvedValue({} as never);
  });

  it('loads and renders students without a team', async () => {
    renderSection();
    expect(await screen.findByText('Lonely Student')).toBeInTheDocument();
    expect(getStudentsWithoutTeam).toHaveBeenCalledWith(100, 5, 10, 1, '');
  });

  it('re-fetches with the search term when searching', async () => {
    const user = userEvent.setup();
    renderSection();
    await screen.findByText('Lonely Student');

    await user.type(screen.getByPlaceholderText('input search text'), 'Lonely{enter}');
    await waitFor(() => expect(getStudentsWithoutTeam).toHaveBeenCalledWith(100, 5, 10, 1, 'Lonely'));
  });

  it('does not render a delete action for non-managers', async () => {
    renderSection(false);
    await screen.findByText('Lonely Student');
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('confirms and deletes a student for managers', async () => {
    const user = userEvent.setup();
    const { reloadDistribution } = renderSection(true);
    await screen.findByText('Lonely Student');

    await user.click(screen.getByRole('button', { name: 'delete' }));

    // antd Modal.confirm renders the confirmation dialog in the body.
    const confirmDialog = await screen.findByRole('dialog');
    expect(confirmDialog).toHaveTextContent(/are you sure you want to remove this student/i);

    await user.click(within(confirmDialog).getByRole('button', { name: /^yes$/i }));

    await waitFor(() =>
      expect(deleteStudent).toHaveBeenCalledWith(students[0].id, distribution.courseId, distribution.id),
    );
    await waitFor(() => expect(reloadDistribution).toHaveBeenCalled());

    Modal.destroyAll();
  });
});
