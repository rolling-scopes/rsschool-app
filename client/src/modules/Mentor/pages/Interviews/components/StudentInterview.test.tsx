import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskDtoTypeEnum } from '@client/api';
import { InterviewStatus } from '@client/domain/interview';
import { Decision } from '@client/data/interviews/technical-screening';
import type { MentorInterview } from '@client/services/course';
import { StudentInterview } from './StudentInterview';

const { postStudentInterviewResult, messageSuccess } = vi.hoisted(() => ({
  postStudentInterviewResult: vi.fn(),
  messageSuccess: vi.fn(),
}));

// Mock the service boundary so no real HTTP happens.
vi.mock('@client/services/course', async importOriginal => {
  const actual = await importOriginal<typeof import('@client/services/course')>();
  return {
    ...actual,
    CourseService: class {
      postStudentInterviewResult = postStudentInterviewResult;
    },
  };
});

// stable message spy (the default @client/hooks mock returns fresh fns per call)
vi.mock('@client/hooks', async importOriginal => {
  const actual = await importOriginal<typeof import('@client/hooks')>();
  return {
    ...actual,
    useMessage: () => ({
      message: { success: messageSuccess, error: vi.fn(), info: vi.fn(), warning: vi.fn() },
    }),
  };
});

const BASE_INTERVIEW: MentorInterview = {
  id: 42,
  name: 'CoreJS Interview',
  endDate: '2025-01-01',
  completed: false,
  interviewer: null,
  status: InterviewStatus.NotCompleted,
  student: { id: 7, githubId: 'student-gh', name: 'Student Name' } as MentorInterview['student'],
  decision: undefined,
};

function renderInterview(
  overrides: Partial<MentorInterview> = {},
  props: Partial<Parameters<typeof StudentInterview>[0]> = {},
) {
  return render(
    <StudentInterview
      interview={{ ...BASE_INTERVIEW, ...overrides }}
      interviewTaskType={TaskDtoTypeEnum.Interview}
      courseAlias="rs-2025"
      courseId={400}
      template="core-js"
      {...props}
    />,
  );
}

describe('StudentInterview', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    postStudentInterviewResult.mockReset().mockResolvedValue({});
    messageSuccess.mockReset();
    // window.location.href is assigned by the component; make it writable.
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: { ...originalLocation, href: '' },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', { configurable: true, writable: true, value: originalLocation });
  });

  it('should render the student name as a profile link', () => {
    renderInterview();

    const profileLink = screen.getByRole('link', { name: 'Student Name' });
    expect(profileLink).toHaveAttribute('href', '/profile?githubId=student-gh');
  });

  it('should fall back to githubId when the student has no name', () => {
    renderInterview({ student: { id: 7, githubId: 'student-gh', name: '' } as MentorInterview['student'] });

    expect(screen.getByRole('link', { name: 'student-gh' })).toBeInTheDocument();
  });

  it('should show "Provide feedback" when the interview is not completed', () => {
    renderInterview();

    expect(screen.getByRole('button', { name: 'Provide feedback' })).toBeInTheDocument();
  });

  it('should show "Edit feedback" when the interview is already completed', () => {
    renderInterview({ completed: true });

    expect(screen.getByRole('button', { name: 'Edit feedback' })).toBeInTheDocument();
  });

  it('should open the reject popconfirm for an uncompleted CoreJS interview', async () => {
    const user = userEvent.setup();
    renderInterview();

    await user.click(screen.getByRole('button', { name: 'Provide feedback' }));

    expect(await screen.findByText(/You can reject the interview with a result/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reject/ })).toBeInTheDocument();
    // service not called just by opening
    expect(postStudentInterviewResult).not.toHaveBeenCalled();
  });

  it('should submit a zero result and show success when the interview is rejected', async () => {
    const user = userEvent.setup();
    renderInterview();

    await user.click(screen.getByRole('button', { name: 'Provide feedback' }));
    await user.click(await screen.findByRole('button', { name: /Reject/ }));

    await waitFor(() =>
      expect(postStudentInterviewResult).toHaveBeenCalledWith('student-gh', 42, {
        score: 0,
        comment: 'No Interview, Rejected',
      }),
    );
    expect(messageSuccess).toHaveBeenCalledWith('You feedback with zero result has been submitted.');
    // after rejecting, the button flips to Edit feedback
    expect(await screen.findByRole('button', { name: 'Edit feedback' })).toBeInTheDocument();
  });

  it('should navigate to the feedback url when "Provide feedback" is chosen in the popconfirm', async () => {
    const user = userEvent.setup();
    renderInterview();

    // open the popconfirm via the trigger button
    await user.click(screen.getByRole('button', { name: 'Provide feedback' }));
    await screen.findByText(/You can reject the interview with a result/);

    // there are now two "Provide feedback" buttons: the trigger and the popconfirm
    // cancel button. The popconfirm cancel button is the last one rendered.
    const buttons = screen.getAllByRole('button', { name: 'Provide feedback' });
    await user.click(buttons[buttons.length - 1]);

    // the cancel ("Provide feedback") action redirects to the feedback url
    await waitFor(() => expect(window.location.href).toContain('/course/interview/'));
    expect(postStudentInterviewResult).not.toHaveBeenCalled();
  });

  it('should navigate directly to the feedback url for a completed interview without a popconfirm', async () => {
    const user = userEvent.setup();
    renderInterview({ completed: true });

    await user.click(screen.getByRole('button', { name: 'Edit feedback' }));

    expect(window.location.href).toContain(
      '/course/interview/core-js/feedback?course=rs-2025&githubId=student-gh&studentId=7&interviewId=42',
    );
    expect(postStudentInterviewResult).not.toHaveBeenCalled();
  });

  it('should navigate directly to the feedback url for a non-CoreJS interview', async () => {
    const user = userEvent.setup();
    renderInterview({}, { interviewTaskType: TaskDtoTypeEnum.StageInterview });

    await user.click(screen.getByRole('button', { name: 'Provide feedback' }));

    expect(window.location.href).toContain('/course/interview/');
    expect(postStudentInterviewResult).not.toHaveBeenCalled();
  });

  it('should render a completed decision tag when a decision is present', () => {
    renderInterview({ decision: Decision.Yes });

    expect(screen.getByText('Completed')).toBeInTheDocument();
  });
});
