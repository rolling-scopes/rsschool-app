import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MentorStudentDto } from '@client/api';
import { Session, CourseInfo } from '@client/components/withSession';
import { SessionContext } from '@client/modules/Course/contexts';
import { useRouter } from 'next/router';
import { Students } from '.';

const { useMentorStudents, push, courseState } = vi.hoisted(() => ({
  useMentorStudents: vi.fn(),
  push: vi.fn(),
  courseState: { completed: false },
}));

vi.mock('@client/modules/Mentor/hooks/useMentorStudents', () => ({ useMentorStudents }));

vi.mock('@client/modules/Course/contexts', async importOriginal => {
  const actual = await importOriginal<typeof import('@client/modules/Course/contexts')>();
  return {
    ...actual,
    useActiveCourseContext: () => ({
      course: { id: 400, alias: 'rs-2025', completed: courseState.completed },
    }),
  };
});

function buildStudent(overrides: Partial<MentorStudentDto> = {}): MentorStudentDto {
  return {
    name: 'John Doe',
    githubId: 'john-doe',
    id: 11,
    active: true,
    cityName: 'Minsk',
    countryName: 'Belarus',
    totalScore: 250,
    rank: 5,
    feedbacks: [],
    ...overrides,
  } as MentorStudentDto;
}

const SESSION = {
  id: 1,
  githubId: 'mentor-github',
  courses: { 400: { mentorId: 99, roles: ['mentor'] } as CourseInfo },
} as unknown as Session;

function renderStudents(students: MentorStudentDto[] = [buildStudent()], loading = false) {
  vi.mocked(useMentorStudents).mockReturnValue({ students, loading, reload: vi.fn() });
  render(
    <SessionContext.Provider value={SESSION}>
      <Students />
    </SessionContext.Provider>,
  );
}

describe('Students page', () => {
  beforeEach(() => {
    push.mockReset();
    courseState.completed = false;
    vi.mocked(useRouter).mockReturnValue({
      push,
      replace: vi.fn(),
      back: vi.fn(),
      query: {},
      pathname: '/',
      asPath: '/',
    } as never);
  });

  it('should render the page title and a card per student with score and rank', () => {
    renderStudents([buildStudent()]);

    expect(screen.getByText('Your students')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('250')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Minsk, Belarus')).toBeInTheDocument();
  });

  it('should show the empty state when the mentor has no students', () => {
    renderStudents([]);

    expect(screen.getByText('You do not have students')).toBeInTheDocument();
  });

  it('should label the feedback action "Give Feedback" when there is no feedback yet', () => {
    renderStudents([buildStudent({ feedbacks: [] })]);

    expect(screen.getByRole('button', { name: /give feedback/i })).toBeInTheDocument();
  });

  it('should label the feedback action "Edit Feedback" when feedback exists', () => {
    renderStudents([buildStudent({ feedbacks: [{ id: 1 } as never] })]);

    expect(screen.getByRole('button', { name: /edit feedback/i })).toBeInTheDocument();
  });

  it('should navigate to the feedback route for the student on click', async () => {
    const user = userEvent.setup();
    renderStudents([buildStudent({ id: 11 })]);

    await user.click(screen.getByRole('button', { name: /give feedback/i }));

    expect(push).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/course/mentor/feedback', query: { course: 'rs-2025', studentId: 11 } }),
    );
  });

  it('should render the "Change Status" action for active students and navigate to expel', async () => {
    const user = userEvent.setup();
    renderStudents([buildStudent({ active: true })]);

    const changeStatusBtn = screen.getByRole('button', { name: /change status/i });
    await user.click(changeStatusBtn);

    expect(push).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/course/mentor/expel-student', query: { course: 'rs-2025' } }),
    );
  });

  it('should not render the "Change Status" action for inactive students', () => {
    renderStudents([buildStudent({ active: false })]);

    expect(screen.queryByRole('button', { name: /change status/i })).not.toBeInTheDocument();
  });

  it('should still render the feedback action with the two-tone icon when the course is completed', () => {
    courseState.completed = true;
    renderStudents([buildStudent({ feedbacks: [] })]);

    const feedbackBtn = screen.getByRole('button', { name: /give feedback/i });
    expect(feedbackBtn).toBeInTheDocument();
    // MessageTwoTone (completed) renders an icon labelled "message" inside the action
    expect(within(feedbackBtn).getByLabelText('message')).toBeInTheDocument();
  });
});
