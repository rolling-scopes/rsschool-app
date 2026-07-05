import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  render(
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

  it('should render the empty-state alert when there are no interviews', () => {
    renderList([]);

    expect(screen.getByText("You don't have any assigned interviews yet.")).toBeInTheDocument();
  });

  it('should render the empty-state alert when interviews is undefined', () => {
    renderList(undefined);

    expect(screen.getByText("You don't have any assigned interviews yet.")).toBeInTheDocument();
  });

  it('should render the summary but not the student list until expanded', () => {
    renderList([makeInterview('alice'), makeInterview('bob')]);

    expect(screen.getByText('summary for 2')).toBeInTheDocument();
    expect(screen.queryByText('student-alice')).not.toBeInTheDocument();
  });

  it('should reveal the per-student list after toggling details', async () => {
    const user = userEvent.setup();
    renderList([makeInterview('alice'), makeInterview('bob')]);

    await user.click(screen.getByRole('button', { name: 'toggle-details' }));

    expect(screen.getByText('student-alice')).toBeInTheDocument();
    expect(screen.getByText('student-bob')).toBeInTheDocument();
  });

  it('should collapse the list again on a second toggle', async () => {
    const user = userEvent.setup();
    renderList([makeInterview('alice')]);

    await user.click(screen.getByRole('button', { name: 'toggle-details' }));
    expect(screen.getByText('student-alice')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'toggle-details' }));
    expect(screen.queryByText('student-alice')).not.toBeInTheDocument();
  });

  it('should call fetchStudentInterviews when the summary triggers a reload', async () => {
    const user = userEvent.setup();
    renderList([makeInterview('alice')]);

    await user.click(screen.getByRole('button', { name: 'reload' }));

    await waitFor(() => expect(fetchStudentInterviews).toHaveBeenCalled());
  });
});
