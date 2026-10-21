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
  it('renders and updates unapplied and applied penalty states', async () => {
    const user = userEvent.setup();
    const updateCriteriaData = vi.fn();
    const { rerender } = render(
      <PenaltyCriteria penaltyData={makePenalty({ point: 0 })} updateCriteriaData={updateCriteriaData} />,
    );

    expect(screen.getByText(/Late submission/)).toBeInTheDocument();
    expect(screen.getByText(/\(-10 points\)/)).toBeInTheDocument();

    const noRadio = screen.getByRole('radio', { name: 'No' });
    const yesRadio = screen.getByRole('radio', { name: 'Yes' });
    expect(noRadio).toBeChecked();
    expect(yesRadio).not.toBeChecked();

    await user.click(screen.getByRole('radio', { name: 'Yes' }));
    expect(updateCriteriaData).toHaveBeenCalledWith(expect.objectContaining({ key: 'penalty-1', point: -10 }));

    rerender(<PenaltyCriteria penaltyData={makePenalty({ point: -10 })} updateCriteriaData={updateCriteriaData} />);
    expect(screen.getByRole('radio', { name: 'Yes' })).toBeChecked();

    await user.click(screen.getByRole('radio', { name: 'No' }));

    expect(updateCriteriaData).toHaveBeenCalledWith(expect.objectContaining({ key: 'penalty-1', point: 0 }));
  });
});
