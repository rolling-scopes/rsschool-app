import { fireEvent, render, screen } from '@testing-library/react';
import { ScoreCard } from './ScoreCard';
import styles from './ScoreCard.module.css';

vi.mock('antd', () => ({ theme: { useToken: () => ({ token: {} }) } }));

describe('ScoreCard', () => {
  it('renders, selects, and applies each score class', () => {
    const onSelect = vi.fn();
    const { rerender } = render(<ScoreCard value={7} selected={false} onSelect={onSelect} />);

    expect(screen.getByText('7')).toBeInTheDocument();
    fireEvent.click(screen.getByText('7'));
    expect(onSelect).toHaveBeenCalledWith(7);
    const card = screen.getByText('7');
    expect(card.className).not.toContain(styles.selectedRed);
    expect(card.className).not.toContain(styles.selected);

    rerender(<ScoreCard value={4} selected onSelect={onSelect} />);

    expect(screen.getByText('4').className).toContain(styles.selectedRed);

    rerender(<ScoreCard value={6} selected onSelect={onSelect} />);

    expect(screen.getByText('6').className).toContain(styles.selectedYellow);

    rerender(<ScoreCard value={9} selected onSelect={onSelect} />);

    expect(screen.getByText('9').className).toContain(styles.selectedGreen);
  });
});
