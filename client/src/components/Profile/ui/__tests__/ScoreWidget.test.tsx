import { render, screen } from '@testing-library/react';
import { ScoreWidget } from '@client/components/Profile/ui';

describe('ScoreWidget', () => {
  it('renders regular, zero, and large scores', () => {
    const { rerender } = render(<ScoreWidget score={85} />);

    expect(screen.getByText('Score:')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();

    rerender(<ScoreWidget score={0} />);
    expect(screen.getByText('Score:')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();

    rerender(<ScoreWidget score={123456} />);
    expect(screen.getByText('123456')).toBeInTheDocument();
  });
});
