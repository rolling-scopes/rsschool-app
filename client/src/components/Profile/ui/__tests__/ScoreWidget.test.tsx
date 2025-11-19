import { render, screen } from '@testing-library/react';
import { ScoreWidget } from '@client/components/Profile/ui';

describe('ScoreWidget', () => {
  it('renders label and score value', () => {
    render(<ScoreWidget score={85} />);

    expect(screen.getByText('Score:')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('renders zero score', () => {
    render(<ScoreWidget score={0} />);

    expect(screen.getByText('Score:')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders large score values', () => {
    render(<ScoreWidget score={123456} />);

    expect(screen.getByText('123456')).toBeInTheDocument();
  });
});
