import { act, fireEvent, render, screen } from '@testing-library/react';
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

function createDeferredRequest() {
  let resolve!: (value: { data: object }) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<{ data: object }>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
}

describe('ReviewRandomTask', () => {
  beforeEach(() => {
    getRandomTask.mockReset();
    messageInfo.mockReset();
    PROPS.onClick = vi.fn();
  });

  it('should request a random task for the mentor/course and notify the parent on success', async () => {
    const request = createDeferredRequest();
    getRandomTask.mockReturnValueOnce(request.promise);
    render(<ReviewRandomTask {...PROPS} />);

    const button = screen.getByRole('button', { name: /review random task/i });
    fireEvent.click(button);

    expect(getRandomTask).toHaveBeenCalledWith(1, 400);
    expect(button).toBeDisabled();

    await act(async () => request.resolve({ data: {} }));

    expect(PROPS.onClick).toHaveBeenCalled();
  });

  it('should show an info message and not notify the parent when no task is found (404)', async () => {
    const request = createDeferredRequest();
    getRandomTask.mockReturnValueOnce(request.promise);
    render(<ReviewRandomTask {...PROPS} />);

    fireEvent.click(screen.getByRole('button', { name: /review random task/i }));
    await act(async () => request.reject({ response: { status: 404 } }));

    expect(messageInfo).toHaveBeenCalledWith('Task for review was not found. Please try later.');
    expect(PROPS.onClick).not.toHaveBeenCalled();
  });

  it('should swallow non-404 errors without an info message', async () => {
    const request = createDeferredRequest();
    getRandomTask.mockReturnValueOnce(request.promise);
    render(<ReviewRandomTask {...PROPS} />);

    fireEvent.click(screen.getByRole('button', { name: /review random task/i }));
    await act(async () => request.reject({ response: { status: 500 } }));

    expect(getRandomTask).toHaveBeenCalled();
    expect(messageInfo).not.toHaveBeenCalled();
    expect(PROPS.onClick).not.toHaveBeenCalled();
  });
});
