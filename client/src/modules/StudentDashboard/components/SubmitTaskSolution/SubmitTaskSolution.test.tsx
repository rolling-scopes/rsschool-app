import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CheckerEnum, CourseTaskDto } from '@client/api';
import SubmitTaskSolution from './SubmitTaskSolution';

// Boundary mocks: the two generated API classes used by the hook.
const { getCourseTasksWithStudentSolution, createTaskSolution } = vi.hoisted(() => ({
  getCourseTasksWithStudentSolution: vi.fn(),
  createTaskSolution: vi.fn(),
}));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  CoursesTasksApi: function CoursesTasksApi() {
    return { getCourseTasksWithStudentSolution };
  },
  CoursesTaskSolutionsApi: function CoursesTaskSolutionsApi() {
    return { createTaskSolution };
  },
}));

// SubmitTaskSolution passes groupBy="deadline" to CourseTaskSelect, which buckets tasks by
// date. Give the tasks a window around "now" so they land in the Active section and render.
const past = new Date(Date.now() - 86_400_000).toISOString();
const future = new Date(Date.now() + 86_400_000).toISOString();

const tasks = [
  {
    id: 1,
    name: 'Mentor Task A',
    checker: CheckerEnum.Mentor,
    type: 'jstask',
    // A defined-but-empty-url solution: exercises the prefill branch in
    // useSubmitTaskSolution without crashing (an empty `[]` is truthy but
    // Object.values(...)[0] is undefined -> reading `.url` throws). Empty url
    // also keeps the link field blank so the typed URL is submitted as-is.
    taskSolutions: [{ url: '' }],
    studentStartDate: past,
    studentEndDate: future,
  },
  {
    id: 2,
    name: 'Mentor Task B',
    checker: CheckerEnum.Mentor,
    type: 'jstask',
    // A defined-but-empty-url solution: exercises the prefill branch in
    // useSubmitTaskSolution without crashing (an empty `[]` is truthy but
    // Object.values(...)[0] is undefined -> reading `.url` throws). Empty url
    // also keeps the link field blank so the typed URL is submitted as-is.
    taskSolutions: [{ url: '' }],
    studentStartDate: past,
    studentEndDate: future,
  },
] as unknown as CourseTaskDto[];

describe('<SubmitTaskSolution />', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the "Submit Task" trigger button', () => {
    getCourseTasksWithStudentSolution.mockResolvedValue({ data: [] });
    render(<SubmitTaskSolution courseId={10} />);

    expect(screen.getByRole('button', { name: /submit task/i })).toBeInTheDocument();
  });

  it('opens the modal and loads mentor-checked course tasks when the trigger is clicked', async () => {
    const user = userEvent.setup();
    getCourseTasksWithStudentSolution.mockResolvedValue({ data: tasks });
    render(<SubmitTaskSolution courseId={10} />);

    await user.click(screen.getByRole('button', { name: /submit task/i }));

    const dialog = await screen.findByRole('dialog', { name: /submit task for mentor review/i });
    expect(dialog).toBeInTheDocument();
    expect(getCourseTasksWithStudentSolution).toHaveBeenCalledWith(10);
    // The solution link input is present.
    expect(within(dialog).getByLabelText(/add a solution link/i)).toBeInTheDocument();
  });

  it('submits the selected task and solution url, then shows the success result', async () => {
    const user = userEvent.setup();
    getCourseTasksWithStudentSolution.mockResolvedValue({ data: tasks });
    createTaskSolution.mockResolvedValue({});
    render(<SubmitTaskSolution courseId={10} />);

    await user.click(screen.getByRole('button', { name: /submit task/i }));
    const dialog = await screen.findByRole('dialog', { name: /submit task for mentor review/i });

    // Select a task via the antd Select. antd opens its dropdown on mouseDown (matching the
    // ManualSubmitTab reference test). CourseTaskSelect renders the task name inside a <span>
    // with surrounding whitespace, so match by regex.
    const combobox = within(dialog).getByRole('combobox');
    fireEvent.mouseDown(combobox);
    const option = await screen.findByText(/Mentor Task A/);
    await user.click(option);

    // Type a valid URL.
    await user.type(within(dialog).getByLabelText(/add a solution link/i), 'https://github.com/me/solution');

    // Click the modal "Submit" button.
    await user.click(within(dialog).getByRole('button', { name: /^submit$/i }));

    await waitFor(() => {
      expect(createTaskSolution).toHaveBeenCalledWith(10, 1, { url: 'https://github.com/me/solution' });
    });
    expect(await screen.findByText(/successfully submitted for review/i)).toBeInTheDocument();
  });

  it('shows an error alert when loading the tasks fails', async () => {
    const user = userEvent.setup();
    getCourseTasksWithStudentSolution.mockRejectedValue({ message: 'Network down' });
    render(<SubmitTaskSolution courseId={10} />);

    await user.click(screen.getByRole('button', { name: /submit task/i }));

    expect(await screen.findByText('Network down')).toBeInTheDocument();
  });
});
