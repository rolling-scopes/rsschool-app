import { render, screen } from '@testing-library/react';
import { TeamDistributionDto, TeamDistributionDtoRegistrationStatusEnum } from '@client/api';
import { CardTitle } from './CardTitle';

const distribution = {
  name: 'test name',
  startDate: '2023-01-24T00:00:00.000Z',
  endDate: '2023-01-31T23:59:00.000Z',
  strictTeamSize: 3,
  minTotalScore: 100500,
  registrationStatus: TeamDistributionDtoRegistrationStatusEnum.Available,
} as TeamDistributionDto;

describe('CardTitle', () => {
  it('renders distribution details across registration states', () => {
    const { rerender } = render(<CardTitle distribution={distribution} />);

    expect(screen.getByText('test name')).toBeInTheDocument();
    expect(screen.getByText(`Min score ${distribution.minTotalScore}`)).toBeInTheDocument();
    expect(screen.getByText(`${distribution.strictTeamSize} members`)).toBeInTheDocument();
    expect(screen.getByText(/2023-01-24/i)).toBeInTheDocument();
    expect(screen.getByText(/2023-01-31/i)).toBeInTheDocument();

    rerender(
      <CardTitle
        distribution={{
          ...distribution,
          minTotalScore: 0,
        }}
      />,
    );
    expect(screen.queryByText('Min score 0')).not.toBeInTheDocument();

    rerender(
      <CardTitle
        distribution={{
          ...distribution,
          registrationStatus: TeamDistributionDtoRegistrationStatusEnum.Completed,
        }}
      />,
    );
    expect(screen.queryByText(`Min score ${distribution.minTotalScore}`)).not.toBeInTheDocument();
    expect(screen.getByText('without team')).toBeInTheDocument();

    rerender(
      <CardTitle
        distribution={{
          ...distribution,
          registrationStatus: TeamDistributionDtoRegistrationStatusEnum.Distributed,
        }}
      />,
    );
    expect(screen.queryByText(`Min score ${distribution.minTotalScore}`)).not.toBeInTheDocument();
    expect(screen.getByText('distributed')).toBeInTheDocument();
  });
});
