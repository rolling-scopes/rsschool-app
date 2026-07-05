import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CrossCheckCriteriaDataDto, CrossCheckCriteriaDataDtoTypeEnum } from '@client/api';
import { PenaltyCriteria } from './PenaltyCriteria';

function makePenalty(overrides: Partial<CrossCheckCriteriaDataDto> = {}): CrossCheckCriteriaDataDto {
  return {
    key: 'penalty-1',
    text: 'Late submission',
    type: CrossCheckCriteriaDataDtoTypeEnum.Penalty,
    max: 10,
    ...overrides,
  } as CrossCheckCriteriaDataDto;
}

describe('<PenaltyCriteria />', () => {
  it('renders the penalty text with the negative score', () => {
    render(<PenaltyCriteria penaltyData={makePenalty()} updateCriteriaData={vi.fn()} />);

    expect(screen.getByText(/Late submission/)).toBeInTheDocument();
    expect(screen.getByText(/\(-10 points\)/)).toBeInTheDocument();
  });

  it('defaults to "No" when there is no penalty point', () => {
    render(<PenaltyCriteria penaltyData={makePenalty({ point: 0 })} updateCriteriaData={vi.fn()} />);

    const noRadio = screen.getByRole('radio', { name: 'No' });
    const yesRadio = screen.getByRole('radio', { name: 'Yes' });
    expect(noRadio).toBeChecked();
    expect(yesRadio).not.toBeChecked();
  });

  it('shows "Yes" selected when a penalty point is already applied', () => {
    render(<PenaltyCriteria penaltyData={makePenalty({ point: -10 })} updateCriteriaData={vi.fn()} />);

    expect(screen.getByRole('radio', { name: 'Yes' })).toBeChecked();
  });

  it('applies the negative penalty score when the user selects "Yes"', async () => {
    const user = userEvent.setup();
    const updateCriteriaData = vi.fn();
    render(<PenaltyCriteria penaltyData={makePenalty({ point: 0 })} updateCriteriaData={updateCriteriaData} />);

    await user.click(screen.getByRole('radio', { name: 'Yes' }));

    expect(updateCriteriaData).toHaveBeenCalledWith(expect.objectContaining({ key: 'penalty-1', point: -10 }));
  });

  it('clears the penalty score when the user selects "No"', async () => {
    const user = userEvent.setup();
    const updateCriteriaData = vi.fn();
    render(<PenaltyCriteria penaltyData={makePenalty({ point: -10 })} updateCriteriaData={updateCriteriaData} />);

    await user.click(screen.getByRole('radio', { name: 'No' }));

    expect(updateCriteriaData).toHaveBeenCalledWith(expect.objectContaining({ key: 'penalty-1', point: 0 }));
  });
});
