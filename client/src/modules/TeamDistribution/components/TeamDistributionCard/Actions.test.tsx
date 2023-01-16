import { screen, render, fireEvent } from '@testing-library/react';
import { TeamDistributionDto, TeamDistributionDtoRegistrationStatusEnum } from 'api';
import { Actions } from './Actions';

const mockOnRegister = jest.fn();
const mockOnDeleteRegister = jest.fn();

const distribution: TeamDistributionDto = {
  id: 1,
  startDate: '2022-01-01T00:00:00Z',
  endDate: '2022-01-03T00:00:00Z',
  registrationStatus: TeamDistributionDtoRegistrationStatusEnum.Available,
} as TeamDistributionDto;

describe('Actions', () => {
  beforeAll(() => jest.useFakeTimers().setSystemTime(new Date('2022-01-02')));

  afterAll(() => jest.useRealTimers());

  afterEach(() => {
    mockOnRegister.mockClear();
    mockOnDeleteRegister.mockClear();
  });

  it('should render a register button when the distribution is available', () => {
    render(<Actions distribution={distribution} register={mockOnRegister} deleteRegister={mockOnDeleteRegister} />);

    const registerButton = screen.getByRole('button', {
      name: /register/i,
    });
    expect(registerButton).toBeInTheDocument();
  });

  it('should call register when the register button is clicked', () => {
    render(<Actions distribution={distribution} register={mockOnRegister} deleteRegister={mockOnDeleteRegister} />);

    const registerButton = screen.getByRole('button', {
      name: /register/i,
    });
    fireEvent.click(registerButton);
    expect(mockOnRegister).toHaveBeenCalledWith(1);
  });

  it('should render a disabled download button when the distribution is completed', () => {
    const completedDistribution = {
      ...distribution,
      registrationStatus: TeamDistributionDtoRegistrationStatusEnum.Completed,
    };
    render(
      <Actions distribution={completedDistribution} register={mockOnRegister} deleteRegister={mockOnDeleteRegister} />,
    );

    const registeredButton = screen.getByRole('button', {
      name: /registered/i,
    });
    expect(registeredButton).toBeInTheDocument();
    expect(registeredButton).toBeDisabled();
  });

  it('should render a cancel registration link when the distribution is completed and end date has not passed', () => {
    const completedDistribution = {
      ...distribution,
      registrationStatus: TeamDistributionDtoRegistrationStatusEnum.Completed,
    };
    render(
      <Actions distribution={completedDistribution} register={mockOnRegister} deleteRegister={mockOnDeleteRegister} />,
    );

    const cancel = screen.getByText(/cancel/i);
    expect(cancel).toBeInTheDocument();
  });

  it('should render a disabled register button when the distribution is in the future', () => {
    const futureDistribution = {
      ...distribution,
      registrationStatus: TeamDistributionDtoRegistrationStatusEnum.Future,
    };
    render(
      <Actions distribution={futureDistribution} register={mockOnRegister} deleteRegister={mockOnDeleteRegister} />,
    );

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
    render(
      <Actions distribution={closedDistribution} register={mockOnRegister} deleteRegister={mockOnDeleteRegister} />,
    );

    const registerButton = screen.getByRole('button', {
      name: /register/i,
    });
    expect(registerButton).toBeInTheDocument();
    expect(registerButton).toBeDisabled();
    expect(screen.getByText('Registration is closed')).toBeInTheDocument();
  });

  it('should render a warning text when the end date is within 48 hours of the current time', () => {
    const soonEndingDistribution = { ...distribution };
    render(
      <Actions distribution={soonEndingDistribution} register={mockOnRegister} deleteRegister={mockOnDeleteRegister} />,
    );

    expect(screen.getByText('Register before 2022-01-03 00:00')).toHaveClass('ant-typography-danger');
  });
});
