import { render, screen } from '@testing-library/react';
import TaskCardColumn from './TaskCardColumn';

describe('TaskCardColumn', () => {
  it('should render the label', () => {
    render(<TaskCardColumn label="Max attempts number" value={5} />);

    expect(screen.getByText('Max attempts number')).toBeInTheDocument();
  });

  it('should render a primitive value', () => {
    render(<TaskCardColumn label="Threshold percentage" value={90} />);

    expect(screen.getByText('90')).toBeInTheDocument();
  });

  it('should render a node value', () => {
    render(<TaskCardColumn label="Strict attempts mode" value={<span>enabled</span>} />);

    expect(screen.getByText('enabled')).toBeInTheDocument();
  });
});
