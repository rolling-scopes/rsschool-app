import { fireEvent, render, screen } from '@testing-library/react';
import { setupUser } from '@client/__tests__/setupUser';
import { CrossCheckCriteriaDataDto, CrossCheckCriteriaDataDtoTypeEnum } from '@client/api';
import { SubtaskCriteria } from './SubtaskCriteria';

function makeSubtask(overrides: Partial<CrossCheckCriteriaDataDto> = {}): CrossCheckCriteriaDataDto {
  return {
    key: 'subtask-1',
    text: 'Implements feature X',
    type: CrossCheckCriteriaDataDtoTypeEnum.Subtask,
    max: 10,
    point: 0,
    ...overrides,
  } as CrossCheckCriteriaDataDto;
}

describe('<SubtaskCriteria />', () => {
  it('renders criteria values and handles reviewer input', async () => {
    const user = setupUser();
    const updateCriteriaData = vi.fn();
    render(<SubtaskCriteria subtaskData={makeSubtask({ point: 7 })} updateCriteriaData={updateCriteriaData} />);

    expect(screen.getByText('Implements feature X')).toBeInTheDocument();
    expect(screen.getByText(/Max 10 points for criteria/)).toBeInTheDocument();
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue('7');
    await user.clear(input);
    await user.type(input, '5');
    expect(updateCriteriaData).toHaveBeenCalledWith(expect.objectContaining({ key: 'subtask-1', point: 5 }));

    await user.type(screen.getByRole('textbox'), 'A');
    expect(updateCriteriaData).toHaveBeenCalledWith(expect.objectContaining({ textComment: 'A' }));

    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight', keyCode: 39 });
    expect(updateCriteriaData).toHaveBeenCalledWith(expect.objectContaining({ key: 'subtask-1', point: 8 }));
  });

  it('shows the detailed-comment warning only when required', () => {
    const { rerender } = render(
      <SubtaskCriteria
        subtaskData={makeSubtask({ point: 3, textComment: 'too short' })}
        updateCriteriaData={vi.fn()}
      />,
    );
    expect(screen.getByText('Please leave a detailed comment')).toBeInTheDocument();

    rerender(
      <SubtaskCriteria
        subtaskData={makeSubtask({ point: 3, textComment: 'this is a long enough comment' })}
        updateCriteriaData={vi.fn()}
      />,
    );
    expect(screen.queryByText('Please leave a detailed comment')).not.toBeInTheDocument();

    rerender(<SubtaskCriteria subtaskData={makeSubtask({ point: 10 })} updateCriteriaData={vi.fn()} />);
    expect(screen.queryByText('Please leave a detailed comment')).not.toBeInTheDocument();

    rerender(<SubtaskCriteria subtaskData={makeSubtask({ point: undefined })} updateCriteriaData={vi.fn()} />);
    expect(screen.queryByText('Please leave a detailed comment')).not.toBeInTheDocument();
  });
});
