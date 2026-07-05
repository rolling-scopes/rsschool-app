import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReviewRandomTask from './ReviewRandomTask';

const { getRandomTask, messageInfo } = vi.hoisted(() => ({
  getRandomTask: vi.fn(),
  messageInfo: vi.fn(),
}));

vi.mock('@client/api', () => ({
  MentorsApi: class {
    getRandomTask = getRandomTask;
  },
}));

vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd');
  return { ...actual, message: { ...actual.message, info: messageInfo } };
});

const PROPS = { mentorId: 1, courseId: 400, onClick: vi.fn() };

describe('ReviewRandomTask', () => {
  beforeEach(() => {
    getRandomTask.mockReset();
    messageInfo.mockReset();
    PROPS.onClick = vi.fn();
  });

  it('should render the "Review random task" button', () => {
    render(<ReviewRandomTask {...PROPS} />);

    expect(screen.getByRole('button', { name: /review random task/i })).toBeInTheDocument();
  });

  it('should request a random task for the mentor/course and notify the parent on success', async () => {
    const user = userEvent.setup();
    getRandomTask.mockResolvedValueOnce({ data: {} });
    render(<ReviewRandomTask {...PROPS} />);

    await user.click(screen.getByRole('button', { name: /review random task/i }));

    await waitFor(() => expect(getRandomTask).toHaveBeenCalledWith(1, 400));
    expect(PROPS.onClick).toHaveBeenCalled();
  });

  it('should show an info message and not notify the parent when no task is found (404)', async () => {
    const user = userEvent.setup();
    getRandomTask.mockRejectedValueOnce({ response: { status: 404 } });
    render(<ReviewRandomTask {...PROPS} />);

    await user.click(screen.getByRole('button', { name: /review random task/i }));

    await waitFor(() => expect(messageInfo).toHaveBeenCalledWith('Task for review was not found. Please try later.'));
    expect(PROPS.onClick).not.toHaveBeenCalled();
  });

  it('should swallow non-404 errors without an info message', async () => {
    const user = userEvent.setup();
    getRandomTask.mockRejectedValueOnce({ response: { status: 500 } });
    render(<ReviewRandomTask {...PROPS} />);

    await user.click(screen.getByRole('button', { name: /review random task/i }));

    await waitFor(() => expect(getRandomTask).toHaveBeenCalled());
    expect(messageInfo).not.toHaveBeenCalled();
    expect(PROPS.onClick).not.toHaveBeenCalled();
  });
});
