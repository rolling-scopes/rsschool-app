import { act, render, screen } from '@testing-library/react';
import { Timer } from './Timer';

describe('Timer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders the initial number of seconds', () => {
    render(<Timer seconds={5} onElapsed={vi.fn()} />);

    expect(screen.getByText('5 seconds')).toBeInTheDocument();
  });

  it('counts down once per second', () => {
    render(<Timer seconds={3} onElapsed={vi.fn()} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('2 seconds')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('1 seconds')).toBeInTheDocument();
  });

  it('calls onElapsed when the countdown reaches zero', () => {
    const onElapsed = vi.fn();
    render(<Timer seconds={1} onElapsed={onElapsed} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('0 seconds')).toBeInTheDocument();
    expect(onElapsed).toHaveBeenCalledTimes(1);
  });

  it('calls onElapsed immediately when started with zero seconds', () => {
    const onElapsed = vi.fn();
    render(<Timer seconds={0} onElapsed={onElapsed} />);

    expect(onElapsed).toHaveBeenCalledTimes(1);
  });

  it('resets the countdown when the seconds prop changes', () => {
    const { rerender } = render(<Timer seconds={2} onElapsed={vi.fn()} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('1 seconds')).toBeInTheDocument();

    rerender(<Timer seconds={9} onElapsed={vi.fn()} />);
    expect(screen.getByText('9 seconds')).toBeInTheDocument();
  });
});
