import { render, screen } from '@testing-library/react';
import { ScoreWidget } from './ScoreWidget';

describe('ScoreWidget', () => {
  it('renders the score label and value', () => {
    render(<ScoreWidget score={42} />);

    expect(screen.getByText('Score:')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders a zero score', () => {
    render(<ScoreWidget score={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
