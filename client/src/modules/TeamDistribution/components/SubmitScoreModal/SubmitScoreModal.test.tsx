import { act, screen, render, waitFor, within } from '@testing-library/react';
import { setupUser } from '@client/__tests__/setupUser';
import { message } from 'antd';
import { TeamDistributionDto } from '@client/api';
import SubmitScoreModal from './SubmitScoreModal';

const { getCourseTasks, submitScore } = vi.hoisted(() => ({
  getCourseTasks: vi.fn(),
  submitScore: vi.fn(),
}));

vi.mock('@client/api', () => ({
  CoursesTasksApi: function CoursesTasksApi() {
    return { getCourseTasks };
  },
  TeamDistributionApi: function TeamDistributionApi() {
    return { submitScore };
  },
}));

const mockError = vi.fn();
const mockSuccess = vi.fn();
vi.mock('@client/hooks', () => ({
  useMessage: () => ({ message: { error: mockError, success: mockSuccess } }),
}));

vi.mock('@client/modules/Course/contexts', () => ({
  useActiveCourseContext: () => ({ course: { id: 42, name: 'RS Course' } }),
}));

const distribution = { id: 7, name: 'Spring distribution' } as TeamDistributionDto;

const courseTasks = [
  { id: 100, name: 'Task Alpha' },
  { id: 200, name: 'Task Beta' },
];

describe('<SubmitScoreModal />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCourseTasks.mockResolvedValue({ data: courseTasks } as never);
    submitScore.mockResolvedValue({} as never);
  });

  it('is closed (not rendered) when distribution is null', async () => {
    // eslint-disable-next-line testing-library/no-unnecessary-act -- Await mount effects after the synchronous render
    await act(async () => {
      render(<SubmitScoreModal distribution={null} onClose={vi.fn()} />);
    });
    expect(screen.queryByText('Submit Score')).not.toBeInTheDocument();
  });

  it('shows an empty-state message when there are no tasks', async () => {
    getCourseTasks.mockResolvedValue({ data: [] } as never);
    render(<SubmitScoreModal distribution={distribution} onClose={vi.fn()} />);

    expect(await screen.findByText('No tasks found for this course')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('shows an error message when loading tasks fails', async () => {
    // fetchCourseTasks reports via antd's global `message`, not the useMessage hook.
    const antdErrorSpy = vi.spyOn(message, 'error').mockImplementation(() => ({}) as never);
    getCourseTasks.mockRejectedValue(new Error('boom'));
    render(<SubmitScoreModal distribution={distribution} onClose={vi.fn()} />);

    await waitFor(() => expect(antdErrorSpy).toHaveBeenCalledWith('Failed to load tasks for course: RS Course'));
    antdErrorSpy.mockRestore();
  });

  it('warns and does not submit when no task is selected', async () => {
    const user = setupUser();
    render(<SubmitScoreModal distribution={distribution} onClose={vi.fn()} />);
    await screen.findByRole('combobox');

    await user.click(screen.getByRole('button', { name: /submit score/i }));

    expect(mockError).toHaveBeenCalledWith('Please select a task before submitting.');
    expect(submitScore).not.toHaveBeenCalled();
  });

  it('submits the selected task score for the team distribution', async () => {
    const user = setupUser();
    render(<SubmitScoreModal distribution={distribution} onClose={vi.fn()} />);
    const combobox = await screen.findByRole('combobox');

    await user.click(combobox);
    const option = await screen.findByText('Task Beta');
    await user.click(option);

    await user.click(screen.getByRole('button', { name: /submit score/i }));

    await waitFor(() => expect(submitScore).toHaveBeenCalledWith(42, 7, 200));
    await waitFor(() => expect(mockSuccess).toHaveBeenCalledWith('Score submitted successfully.'));
  });

  it('shows an error message when score submission fails', async () => {
    const user = setupUser();
    submitScore.mockRejectedValue(new Error('fail'));
    render(<SubmitScoreModal distribution={distribution} onClose={vi.fn()} />);
    const combobox = await screen.findByRole('combobox');

    await user.click(combobox);
    await user.click(await screen.findByText('Task Alpha'));
    await user.click(screen.getByRole('button', { name: /submit score/i }));

    await waitFor(() => expect(mockError).toHaveBeenCalledWith('Error occurred while submitting score.'));
  });

  it('calls onClose when the modal is cancelled', async () => {
    const user = setupUser();
    const onClose = vi.fn();
    render(<SubmitScoreModal distribution={distribution} onClose={onClose} />);
    expect(await screen.findByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Submit Score')).toBeInTheDocument();
    expect(getCourseTasks).toHaveBeenCalledWith(42);

    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /cancel/i }));

    expect(onClose).toHaveBeenCalled();
  });
});
