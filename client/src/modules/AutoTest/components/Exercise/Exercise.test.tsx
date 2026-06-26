import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import { CheckerEnum, CourseTaskDetailedDtoTypeEnum } from '@client/api';
import { CourseTaskVerifications } from '@client/modules/AutoTest/types';
import Exercise from './Exercise';

const { submitMock, changeMock } = vi.hoisted(() => ({
  submitMock: vi.fn(),
  changeMock: vi.fn(),
}));

// Boundary mock: the real useCourseTaskSubmit hits the verifications API, files
// service and session context. We replace it with a controllable form-bound hook.
vi.mock('@client/modules/AutoTest/hooks', () => ({
  useCourseTaskSubmit: () => {
    const [form] = Form.useForm();
    return { form, loading: false, submit: submitMock, change: changeMock };
  },
}));

function renderExercise(type: CourseTaskDetailedDtoTypeEnum) {
  const courseTask = {
    name: 'Course Task',
    studentStartDate: '2022-09-10 12:00',
    studentEndDate: '2022-10-10 12:00',
    checker: CheckerEnum.AutoTest,
    id: 10,
    descriptionUrl: 'description-url',
    githubRepoName: 'github-repo-name',
    type,
    publicAttributes: {
      maxAttemptsNumber: 2,
      questions: [{ question: 'Q1', answers: ['a', 'b'], multiple: false }],
      numberOfQuestions: 1,
    },
  } as CourseTaskVerifications;

  return render(<Exercise courseId={1} githubId="github-id" courseTask={courseTask} finishTask={vi.fn()} />);
}

describe('Exercise', () => {
  beforeEach(() => {
    submitMock.mockClear();
    changeMock.mockClear();
  });

  it('should render the Coding exercise for a jstask', () => {
    renderExercise(CourseTaskDetailedDtoTypeEnum.Jstask);

    expect(screen.getByText(/will run tests in the following repository/i)).toBeInTheDocument();
  });

  it('should render the SelfEducation exercise', () => {
    renderExercise(CourseTaskDetailedDtoTypeEnum.Selfeducation);

    expect(screen.getByRole('heading', { name: /Q1/ })).toBeInTheDocument();
  });

  it('should render the Jupyter upload exercise for an ipynb task', () => {
    renderExercise(CourseTaskDetailedDtoTypeEnum.Ipynb);

    expect(screen.getByRole('button', { name: /select jupyter notebook/i })).toBeInTheDocument();
  });

  it('should render no exercise body for an unsupported type', () => {
    renderExercise(CourseTaskDetailedDtoTypeEnum.Test);

    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('should render the submit button', () => {
    renderExercise(CourseTaskDetailedDtoTypeEnum.Jstask);

    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('should call submit when the form is submitted for a coding task', async () => {
    const user = userEvent.setup();
    renderExercise(CourseTaskDetailedDtoTypeEnum.Jstask);

    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => expect(submitMock).toHaveBeenCalledTimes(1));
  });

  it('should call change when the self-education answer is selected', async () => {
    const user = userEvent.setup();
    renderExercise(CourseTaskDetailedDtoTypeEnum.Selfeducation);

    await user.click(screen.getAllByRole('radio')[0] as HTMLElement);

    await waitFor(() => expect(changeMock).toHaveBeenCalled());
  });

  it('should surface the validation-error tooltip when submitting the self-education form with no answer', async () => {
    const user = userEvent.setup();
    renderExercise(CourseTaskDetailedDtoTypeEnum.Selfeducation);

    await user.click(screen.getByRole('button', { name: /submit/i }));

    // onFinishFailed fires because the required answer field is empty.
    expect(
      await screen.findByText(/Form has validation errors! Check that all required fields are filled!/i),
    ).toBeInTheDocument();
  });
});
