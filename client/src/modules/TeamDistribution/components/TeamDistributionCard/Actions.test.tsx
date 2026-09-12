import { screen, render, fireEvent } from '@testing-library/react';
import { TeamDistributionDto, TeamDistributionDtoRegistrationStatusEnum } from '@client/api';
import { Actions } from './Actions';

const mockOnRegister = vi.fn();
const mockOnDeleteRegister = vi.fn();

const distribution = {
  id: 1,
  startDate: '2021-12-31T00:00:00Z',
  endDate: '2022-01-03T00:00:00Z',
  registrationStatus: TeamDistributionDtoRegistrationStatusEnum.Available,
} as TeamDistributionDto;

function renderActions(distribution: TeamDistributionDto, isManager = false) {
  return render(
    <Actions
      distribution={distribution}
      register={mockOnRegister}
      deleteRegister={mockOnDeleteRegister}
      isManager={isManager}
      courseAlias="test"
      isCourseDementor={false}
      onOpenSubmitScoreModal={vi.fn()}
    />,
  );
}

describe('Actions', () => {
  beforeAll(() => vi.useFakeTimers().setSystemTime(new Date('2022-01-02')));

  afterAll(() => vi.useRealTimers());

  afterEach(() => {
    mockOnRegister.mockClear();
    mockOnDeleteRegister.mockClear();
  });

  it('renders the available registration actions and calls register', () => {
    renderActions(distribution);

    const registerButton = screen.getByRole('button', {
      name: /register/i,
    });
    expect(registerButton).toBeInTheDocument();
    expect(screen.getByText('Register before 2022-01-03 00:00')).toHaveClass('ant-typography-danger');
    fireEvent.click(registerButton);
    expect(mockOnRegister).toHaveBeenCalledWith(1);
  });

  it('renders the completed registration actions before the end date', () => {
    const completedDistribution = {
      ...distribution,
      registrationStatus: TeamDistributionDtoRegistrationStatusEnum.Completed,
    };
    renderActions(completedDistribution);

    const registeredButton = screen.getByRole('button', {
      name: /registered/i,
    });
    expect(registeredButton).toBeInTheDocument();
    expect(registeredButton).toBeDisabled();
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /connect with teams/i })).toBeInTheDocument();
  });

  it('should render the "Registration is closed" text when the distribution is completed and end date has passed', () => {
    const completedDistribution = {
      ...distribution,
      endDate: '2022-01-01T00:00:00Z',
      registrationStatus: TeamDistributionDtoRegistrationStatusEnum.Completed,
    };
    renderActions(completedDistribution);

    const text = screen.getByText(/registration is closed/i);
    expect(text).toBeInTheDocument();
  });

  it('should render a disabled register button when the distribution is in the future', () => {
    const futureDistribution = {
      ...distribution,
      registrationStatus: TeamDistributionDtoRegistrationStatusEnum.Future,
    };
    renderActions(futureDistribution);

    const registerButton = screen.getByRole('button', {
      name: /register/i,
    });
    expect(registerButton).toBeInTheDocument();
    expect(registerButton).toBeDisabled();
  });

  it('should render a disabled register button and displays "Registration is closed" text when the distribution is closed', () => {
    const closedDistribution = {
      ...distribution,
      registrationStatus: TeamDistributionDtoRegistrationStatusEnum.Closed,
    };
    renderActions(closedDistribution);

    const registerButton = screen.getByRole('button', {
      name: /register/i,
    });
    expect(registerButton).toBeInTheDocument();
    expect(registerButton).toBeDisabled();
    expect(screen.getByText('Registration is closed')).toBeInTheDocument();
  });

  it('should render connect with teams button for managers', () => {
    renderActions(distribution, true);

    const registerButton = screen.getByRole('button', {
      name: /connect with teams/i,
    });
    expect(registerButton).toBeInTheDocument();
  });
});
