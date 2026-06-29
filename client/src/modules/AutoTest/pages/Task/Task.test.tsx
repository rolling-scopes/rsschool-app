import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode, createContext } from 'react';
import { Form } from 'antd';
import { CheckerEnum, CourseTaskDetailedDtoTypeEnum, TaskVerificationAttemptDto } from '@client/api';
import { CourseTaskState, CourseTaskStatus, CourseTaskVerifications } from '@client/modules/AutoTest/types';
import Task from './Task';

vi.mock('@client/shared/components/PageLayout', () => ({
  PageLayout: ({ children, title }: { children: ReactNode; title: string }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

vi.mock('@client/modules/Course/contexts', () => ({
  SessionContext: createContext({ githubId: 'github-id' }),
  useActiveCourseContext: () => ({ course: { id: 42, alias: 'rs-2025' } }),
}));

vi.mock('next/router', () => ({
  useRouter: () => ({ query: { courseTaskId: '7' } }),
}));

const { useCourseTaskVerifications, useVerificationsAnswers } = vi.hoisted(() => ({
  useCourseTaskVerifications: vi.fn(),
  useVerificationsAnswers: vi.fn(),
}));

vi.mock('@client/modules/AutoTest/hooks', () => ({
  useCourseTaskVerifications,
  useVerificationsAnswers,
  // Exercise renders the real component, which needs a form-bound submit hook.
  useCourseTaskSubmit: () => {
    const [form] = Form.useForm();
    return { form, loading: false, submit: vi.fn(), change: vi.fn() };
  },
  useAttemptsMessage: () => ({
    explanation: 'Explanation text',
    attemptsLeftMessage: undefined,
    allowStartTask: true,
    allowCheckAnswers: false,
  }),
}));

const courseTask: CourseTaskVerifications = {
  id: 7,
  name: 'My Auto Test',
  type: CourseTaskDetailedDtoTypeEnum.Jstask,
  status: CourseTaskStatus.Available,
  state: CourseTaskState.Uncompleted,
  studentStartDate: '2022-09-10T12:00:00.000Z',
  studentEndDate: '2022-10-10T12:00:00.000Z',
  checker: CheckerEnum.AutoTest,
  descriptionUrl: 'https://example.com/desc',
  githubRepoName: 'repo',
  maxScore: 100,
  verifications: [],
  publicAttributes: { maxAttemptsNumber: 2 },
} as unknown as CourseTaskVerifications;

function setupVerifications(overrides: Record<string, unknown> = {}) {
  useCourseTaskVerifications.mockReturnValue({
    loading: false,
    tasks: [courseTask],
    isExerciseVisible: false,
    startTask: vi.fn(),
    finishTask: vi.fn(),
    reload: vi.fn(),
    ...overrides,
  });
}

function setupAnswers(answers: TaskVerificationAttemptDto[] | null = null) {
  useVerificationsAnswers.mockReturnValue({
    answers,
    showAnswers: vi.fn(),
    hideAnswers: vi.fn(),
  });
}

describe('Task page', () => {
  beforeEach(() => {
    setupVerifications();
    setupAnswers();
  });

  it('should return null when no matching task is found', () => {
    useCourseTaskVerifications.mockReturnValue({
      loading: false,
      tasks: [],
      isExerciseVisible: false,
      startTask: vi.fn(),
      finishTask: vi.fn(),
      reload: vi.fn(),
    });
    const { container } = render(<Task />);

    expect(container).toBeEmptyDOMElement();
  });

  it('should render the task description with the task name', () => {
    render(<Task />);

    expect(screen.getByText('My Auto Test')).toBeInTheDocument();
  });

  it('should render the verification information (start/refresh) when the table is visible', () => {
    render(<Task />);

    expect(screen.getByRole('button', { name: /start task/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
  });

  it('should render the exercise when it is visible', () => {
    setupVerifications({ isExerciseVisible: true });
    render(<Task />);

    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('should render the attempts answers view when answers are present', async () => {
    const hideAnswers = vi.fn();
    useVerificationsAnswers.mockReturnValue({
      answers: [
        {
          courseTaskId: 7,
          score: 5,
          maxScore: 10,
          createdDate: '2022-10-10T12:00:00.000Z',
          questions: [],
        },
      ],
      showAnswers: vi.fn(),
      hideAnswers,
    });
    render(<Task />);

    const backButton = screen.getByRole('button', { name: /back to table/i });
    expect(backButton).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /start task/i })).not.toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(backButton);
    expect(hideAnswers).toHaveBeenCalledTimes(1);
  });
});
