import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateStudentFeedbackDto } from '@client/api';
import { Session, CourseInfo } from '@client/components/withSession';
import { SessionContext } from '@client/modules/Course/contexts';
import { useRouter } from 'next/router';
import { StudentFeedback } from '.';

const { useMentorStudents, reload, createStudentFeedback, updateStudentFeedback, messageSuccess, messageError } =
  vi.hoisted(() => ({
    useMentorStudents: vi.fn(),
    reload: vi.fn(),
    createStudentFeedback: vi.fn(),
    updateStudentFeedback: vi.fn(),
    messageSuccess: vi.fn(),
    messageError: vi.fn(),
  }));

// stable message spies (the default @client/hooks mock returns fresh fns per call)
vi.mock('@client/hooks', async importOriginal => {
  const actual = await importOriginal<typeof import('@client/hooks')>();
  return {
    ...actual,
    useMessage: () => ({ message: { success: messageSuccess, error: messageError, info: vi.fn(), warning: vi.fn() } }),
  };
});

vi.mock('@client/api', async importOriginal => {
  const actual = await importOriginal<typeof import('@client/api')>();
  return {
    ...actual,
    StudentsFeedbacksApi: class {
      createStudentFeedback = createStudentFeedback;
      updateStudentFeedback = updateStudentFeedback;
    },
  };
});

vi.mock('@client/modules/Mentor/hooks/useMentorStudents', () => ({ useMentorStudents }));

vi.mock('@client/modules/Course/contexts', async importOriginal => {
  const actual = await importOriginal<typeof import('@client/modules/Course/contexts')>();
  return {
    ...actual,
    useActiveCourseContext: () => ({ course: { id: 400 } }),
  };
});

const PAYLOAD = { englishLevel: 'b2' } as unknown as CreateStudentFeedbackDto;

// FeedbackForm is heavy (Rate/UserSearch/markdown); stub it to two buttons that
// invoke the page's onSubmit handler in create vs. update mode.
vi.mock('@client/modules/Feedback/components/FeedbackForm', () => ({
  FeedbackForm: ({
    studentId,
    onSubmit,
  }: {
    studentId: number;
    onSubmit: (id: number, payload: CreateStudentFeedbackDto, existingId?: number) => Promise<void>;
  }) => (
    <div>
      <span>form for {studentId}</span>
      <button onClick={() => onSubmit(studentId, PAYLOAD)}>create-feedback</button>
      <button onClick={() => onSubmit(studentId, PAYLOAD, 55)}>update-feedback</button>
    </div>
  ),
}));

const SESSION = {
  id: 1,
  githubId: 'mentor-github',
  courses: { 400: { mentorId: 99, roles: ['mentor'] } as CourseInfo },
} as unknown as Session;

function renderPage(students = [{ id: 7, feedbacks: [] }] as never[]) {
  vi.mocked(useMentorStudents).mockReturnValue({ students, loading: false, reload });
  render(
    <SessionContext.Provider value={SESSION}>
      <StudentFeedback />
    </SessionContext.Provider>,
  );
}

describe('StudentFeedback page', () => {
  beforeEach(() => {
    reload.mockReset().mockResolvedValue(undefined);
    createStudentFeedback.mockReset().mockResolvedValue({});
    updateStudentFeedback.mockReset().mockResolvedValue({});
    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      query: { studentId: '7' },
      pathname: '/',
      asPath: '/',
    } as never);
  });

  it('should render the page title', () => {
    renderPage();

    expect(screen.getByText('Recommendation Letter')).toBeInTheDocument();
  });

  it('should render the feedback form for the student id from the query', () => {
    renderPage();

    expect(screen.getByText('form for 7')).toBeInTheDocument();
  });

  it('should not render the form when there is no studentId in the query', () => {
    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      query: {},
      pathname: '/',
      asPath: '/',
    } as never);
    renderPage();

    expect(screen.queryByText(/^form for/)).not.toBeInTheDocument();
  });

  it('should create feedback and reload on submit without an existing feedback id', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'create-feedback' }));

    await waitFor(() => expect(createStudentFeedback).toHaveBeenCalledWith(7, PAYLOAD));
    expect(updateStudentFeedback).not.toHaveBeenCalled();
    expect(messageSuccess).toHaveBeenCalledWith('Feedback has been successfully submitted');
    expect(reload).toHaveBeenCalled();
  });

  it('should update feedback and reload on submit with an existing feedback id', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'update-feedback' }));

    await waitFor(() => expect(updateStudentFeedback).toHaveBeenCalledWith(7, 55, PAYLOAD));
    expect(createStudentFeedback).not.toHaveBeenCalled();
    expect(messageSuccess).toHaveBeenCalledWith('Feedback has been successfully updated');
    expect(reload).toHaveBeenCalled();
  });

  it('should show an error message when creating feedback fails', async () => {
    const user = userEvent.setup();
    createStudentFeedback.mockRejectedValueOnce(new Error('boom'));
    renderPage();

    await user.click(screen.getByRole('button', { name: 'create-feedback' }));

    await waitFor(() => expect(messageError).toHaveBeenCalledWith('Failed to submit feedback'));
    expect(reload).toHaveBeenCalled();
  });

  it('should show an error message when updating feedback fails', async () => {
    const user = userEvent.setup();
    updateStudentFeedback.mockRejectedValueOnce(new Error('boom'));
    renderPage();

    await user.click(screen.getByRole('button', { name: 'update-feedback' }));

    await waitFor(() => expect(messageError).toHaveBeenCalledWith('Failed to update feedback'));
    expect(reload).toHaveBeenCalled();
  });
});
