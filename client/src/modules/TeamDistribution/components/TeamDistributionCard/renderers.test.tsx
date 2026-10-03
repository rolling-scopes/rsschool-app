import { render, screen } from '@testing-library/react';
import { TeamDistributionDtoRegistrationStatusEnum } from '@client/api';
import { RenderMinTotalScore, RenderRegistrationStatus } from './renderers';

vi.mock('@ant-design/icons/ClockCircleOutlined', () => ({ default: () => null }));
vi.mock('antd', () => ({
  Tag: ({ children }: React.PropsWithChildren) => <span>{children}</span>,
  Typography: { Text: ({ children }: React.PropsWithChildren) => <span>{children}</span> },
}));

describe('RenderRegistrationStatus', () => {
  it('renders each registration status', () => {
    const { container, rerender } = render(
      <RenderRegistrationStatus status={TeamDistributionDtoRegistrationStatusEnum.Distributed} />,
    );
    expect(screen.getByText('distributed')).toBeInTheDocument();

    rerender(<RenderRegistrationStatus status={TeamDistributionDtoRegistrationStatusEnum.Completed} />);
    expect(screen.getByText('without team')).toBeInTheDocument();

    rerender(<RenderRegistrationStatus status={TeamDistributionDtoRegistrationStatusEnum.Available} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('RenderMinTotalScore', () => {
  it('renders a provided score and nothing for zero', () => {
    const { container, rerender } = render(<RenderMinTotalScore score={120} />);
    expect(screen.getByText('Min score 120')).toBeInTheDocument();

    rerender(<RenderMinTotalScore score={0} />);
    expect(container).toBeEmptyDOMElement();
  });
});
