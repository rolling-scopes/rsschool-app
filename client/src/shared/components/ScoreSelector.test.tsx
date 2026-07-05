import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScoreSelector } from './ScoreSelector';

describe('ScoreSelector', () => {
  it('renders ten score cards (1..10)', () => {
    render(<ScoreSelector />);

    for (let i = 1; i <= 10; i++) {
      expect(screen.getByText(String(i))).toBeInTheDocument();
    }
  });

  it('calls onChange with the clicked score', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ScoreSelector onChange={onChange} />);

    await user.click(screen.getByText('8'));

    expect(onChange).toHaveBeenCalledWith(8);
  });

  it('does not throw when clicking without an onChange handler', async () => {
    const user = userEvent.setup();
    render(<ScoreSelector />);

    await user.click(screen.getByText('3'));
    // No assertion error means the optional-chained onChange call was safe.
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows the selected value in the sloth badge when a value is set', () => {
    render(<ScoreSelector value={6} />);

    // "6" appears twice: the card and the sloth badge.
    expect(screen.getAllByText('6')).toHaveLength(2);
  });

  it('does not render the sloth badge when no value is set', () => {
    render(<ScoreSelector />);

    // Each digit 1..10 appears exactly once (no duplicate from a badge).
    expect(screen.getAllByText('5')).toHaveLength(1);
  });
});
