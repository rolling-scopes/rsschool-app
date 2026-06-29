import { render, screen } from '@testing-library/react';
import { TeamDistributionDtoRegistrationStatusEnum } from '@client/api';
import { RenderMinTotalScore, RenderRegistrationStatus } from './renderers';

describe('RenderRegistrationStatus', () => {
  it('renders a green "distributed" tag for the distributed status', () => {
    render(<RenderRegistrationStatus status={TeamDistributionDtoRegistrationStatusEnum.Distributed} />);
    expect(screen.getByText('distributed')).toBeInTheDocument();
  });

  it('renders a "without team" tag for the completed status', () => {
    render(<RenderRegistrationStatus status={TeamDistributionDtoRegistrationStatusEnum.Completed} />);
    expect(screen.getByText('without team')).toBeInTheDocument();
  });

  it('renders nothing for any other registration status (default branch)', () => {
    const { container } = render(
      <RenderRegistrationStatus status={TeamDistributionDtoRegistrationStatusEnum.Available} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe('RenderMinTotalScore', () => {
  it('renders the min-score label when a score is provided', () => {
    render(<RenderMinTotalScore score={120} />);
    expect(screen.getByText('Min score 120')).toBeInTheDocument();
  });

  it('renders nothing when the score is zero', () => {
    const { container } = render(<RenderMinTotalScore score={0} />);
    expect(container).toBeEmptyDOMElement();
  });
});
