import { render, screen } from '@testing-library/react';
import { TeamDistributionDto } from 'api';
import { CardTitle } from './CardTitle';

const distribution = {
  name: 'test name',
  startDate: '2023-01-24T00:00:00.000Z',
  endDate: '2023-01-31T23:59:00.000Z',
  strictTeamSize: 3,
  minTotalScore: 100500,
} as TeamDistributionDto;

describe('CardTitle', () => {
  it('should display distribution name', () => {
    render(<CardTitle distribution={distribution} />);
    expect(screen.getByText('test name')).toBeInTheDocument();
  });

  it('should display min score when it is not 0', () => {
    render(<CardTitle distribution={distribution} />);
    expect(screen.getByText('Min score 100500')).toBeInTheDocument();
  });

  it('should not display min score when it is 0', () => {
    render(<CardTitle distribution={{ ...distribution, minTotalScore: 0 }} />);
    expect(screen.queryByText('Min score 0')).not.toBeInTheDocument();
  });

  it('should display strict team size', () => {
    render(<CardTitle distribution={distribution} />);
    expect(screen.getByText('3 members')).toBeInTheDocument();
  });

  it('should display distribution period', () => {
    render(<CardTitle distribution={distribution} />);
    expect(screen.getByText(/2023-01-24/i)).toBeInTheDocument();
    expect(screen.getByText(/2023-01-31/i)).toBeInTheDocument();
  });
});
