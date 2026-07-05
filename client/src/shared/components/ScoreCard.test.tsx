import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScoreCard } from './ScoreCard';
import styles from './ScoreCard.module.css';

describe('ScoreCard', () => {
  it('renders its value', () => {
    render(<ScoreCard value={7} selected={false} onSelect={vi.fn()} />);

    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('calls onSelect with the value when clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<ScoreCard value={5} selected={false} onSelect={onSelect} />);

    await user.click(screen.getByText('5'));

    expect(onSelect).toHaveBeenCalledWith(5);
  });

  it('does not apply colour classes when not selected', () => {
    render(<ScoreCard value={3} selected={false} onSelect={vi.fn()} />);

    const card = screen.getByText('3');
    expect(card.className).not.toContain(styles.selectedRed);
    expect(card.className).not.toContain(styles.selected);
  });

  it('applies the red class for a selected low score (<=4)', () => {
    render(<ScoreCard value={4} selected={true} onSelect={vi.fn()} />);

    expect(screen.getByText('4').className).toContain(styles.selectedRed);
  });

  it('applies the yellow class for a selected mid score (<=7)', () => {
    render(<ScoreCard value={6} selected={true} onSelect={vi.fn()} />);

    expect(screen.getByText('6').className).toContain(styles.selectedYellow);
  });

  it('applies the green class for a selected high score (>7)', () => {
    render(<ScoreCard value={9} selected={true} onSelect={vi.fn()} />);

    expect(screen.getByText('9').className).toContain(styles.selectedGreen);
  });
});
