import { act, fireEvent, render, screen } from '@testing-library/react';
import type { InterviewDto } from '@client/api';
import { TaskDtoTypeEnum } from '@client/api';
import { InterviewStatus } from '@client/domain/interview';
import type { MentorInterview } from '@client/services/course';
import type { Course } from '@client/services/models';
import { InterviewsList } from './InterviewsList';

// Stub InterviewsSummary to expose the toggle + reload wiring InterviewsList owns.
vi.mock('./InterviewsSummary', () => ({
  InterviewsSummary: ({
    toggleDetails,
    reloadList,
    interviews,
  }: {
    toggleDetails: () => void;
    reloadList: () => Promise<void>;
    interviews: MentorInterview[];
  }) => (
    <div>
      <span>summary for {interviews.length}</span>
      <button onClick={toggleDetails}>toggle-details</button>
      <button onClick={() => reloadList()}>reload</button>
    </div>
  ),
}));

// Stub StudentInterview so we only assert that the list renders one per interview.
vi.mock('./StudentInterview', () => ({
  StudentInterview: ({ interview }: { interview: MentorInterview }) => <div>student-{interview.student.githubId}</div>,
}));

const { fetchStudentInterviews } = vi.hoisted(() => ({ fetchStudentInterviews: vi.fn() }));

const COURSE = { id: 400, alias: 'rs-2025' } as Course;

const INTERVIEW_TASK = {
  id: 99,
  name: 'CoreJS Interview',
  type: TaskDtoTypeEnum.Interview,
  attributes: { template: 'core-js' },
} as unknown as InterviewDto;

function makeInterview(githubId: string): MentorInterview {
  return {
    id: Math.floor(Math.random() * 1e6),
    name: 'CoreJS Interview',
    endDate: '2025-01-01',
    completed: false,
    interviewer: null,
    status: InterviewStatus.NotCompleted,
    student: { id: 1, githubId, name: githubId } as MentorInterview['student'],
  };
}

function renderList(interviews?: MentorInterview[]) {
  return render(
    <InterviewsList
      interviews={interviews}
      course={COURSE}
      interviewTask={INTERVIEW_TASK}
      fetchStudentInterviews={fetchStudentInterviews}
    />,
  );
}

describe('InterviewsList', () => {
  beforeEach(() => fetchStudentInterviews.mockReset().mockResolvedValue(undefined));

  it('should render the empty state for empty and undefined interviews', () => {
    const { rerender } = renderList([]);

    expect(screen.getByText("You don't have any assigned interviews yet.")).toBeInTheDocument();

    rerender(
      <InterviewsList
        interviews={undefined}
        course={COURSE}
        interviewTask={INTERVIEW_TASK}
        fetchStudentInterviews={fetchStudentInterviews}
      />,
    );

    expect(screen.getByText("You don't have any assigned interviews yet.")).toBeInTheDocument();
  });

  it('should render the summary, toggle student details, and reload interviews', async () => {
    let resolveReload!: () => void;
    fetchStudentInterviews.mockReturnValueOnce(
      new Promise<void>(resolve => {
        resolveReload = resolve;
      }),
    );
    renderList([makeInterview('alice'), makeInterview('bob')]);

    expect(screen.getByText('summary for 2')).toBeInTheDocument();
    expect(screen.queryByText('student-alice')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'toggle-details' }));

    expect(screen.getByText('student-alice')).toBeInTheDocument();
    expect(screen.getByText('student-bob')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'toggle-details' }));
    expect(screen.queryByText('student-alice')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'reload' }));
    expect(fetchStudentInterviews).toHaveBeenCalled();

    await act(async () => resolveReload());
  });
});
