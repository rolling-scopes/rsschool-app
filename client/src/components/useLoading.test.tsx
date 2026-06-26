import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { message } from 'antd';
import { useLoading } from './useLoading';

vi.mock('antd', async importOriginal => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    message: { ...actual.message, error: vi.fn() },
  };
});

// A tiny host component that exercises the hook through a real render.
function Host({
  action,
  catchHandler,
  initial = false,
}: {
  action: (...args: unknown[]) => Promise<unknown>;
  catchHandler?: (e?: unknown) => void;
  initial?: boolean;
}) {
  const [loading, withLoading] = useLoading(initial, catchHandler);
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <button onClick={() => withLoading(action)('arg1', 'arg2')}>run</button>
    </div>
  );
}

describe('useLoading', () => {
  beforeEach(() => vi.clearAllMocks());

  it('starts with the provided initial value', () => {
    render(<Host action={async () => undefined} initial />);
    expect(screen.getByTestId('loading')).toHaveTextContent('true');
  });

  it('defaults the initial loading state to false', () => {
    render(<Host action={async () => undefined} />);
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });

  it('toggles loading on while the action runs and off when it resolves', async () => {
    const user = userEvent.setup();
    let resolve!: (v: string) => void;
    const action = vi.fn(() => new Promise<string>(r => (resolve = r)));

    render(<Host action={action} />);
    await user.click(screen.getByRole('button', { name: 'run' }));

    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    await act(async () => {
      resolve('done');
    });

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(action).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('calls the default catch handler (antd message.error) on rejection', async () => {
    const user = userEvent.setup();
    const action = vi.fn().mockRejectedValue(new Error('boom'));

    render(<Host action={action} />);
    await user.click(screen.getByRole('button', { name: 'run' }));

    await waitFor(() => expect(message.error).toHaveBeenCalledWith('An unexpected error occurred. Please try later.'));
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });

  it('calls a custom catch handler with the thrown error', async () => {
    const user = userEvent.setup();
    const error = new Error('custom');
    const catchHandler = vi.fn();
    const action = vi.fn().mockRejectedValue(error);

    render(<Host action={action} catchHandler={catchHandler} />);
    await user.click(screen.getByRole('button', { name: 'run' }));

    await waitFor(() => expect(catchHandler).toHaveBeenCalledWith(error));
    expect(message.error).not.toHaveBeenCalled();
  });
});
