import { fireEvent, render, screen } from '@testing-library/react';
import { ScoreSelector } from './ScoreSelector';

describe('ScoreSelector', () => {
  it('renders all scores, handles selection, and displays the selected value', () => {
    const onChange = vi.fn();
    const { rerender } = render(<ScoreSelector onChange={onChange} />);

    for (let i = 1; i <= 10; i++) {
      expect(screen.getByText(String(i))).toBeInTheDocument();
    }

    fireEvent.click(screen.getByText('8'));
    expect(onChange).toHaveBeenCalledWith(8);

    rerender(<ScoreSelector />);
    fireEvent.click(screen.getByText('3'));
    expect(screen.getByText('3')).toBeInTheDocument();

    rerender(<ScoreSelector value={6} />);

    expect(screen.getAllByText('6')).toHaveLength(2);

    rerender(<ScoreSelector />);
    expect(screen.getAllByText('5')).toHaveLength(1);
  });
});
