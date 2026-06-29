import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  it('renders the criteria text and max points', () => {
    render(<SubtaskCriteria subtaskData={makeSubtask()} updateCriteriaData={vi.fn()} />);

    expect(screen.getByText('Implements feature X')).toBeInTheDocument();
    expect(screen.getByText(/Max 10 points for criteria/)).toBeInTheDocument();
  });

  it('reflects the current score in the number input', () => {
    render(<SubtaskCriteria subtaskData={makeSubtask({ point: 7 })} updateCriteriaData={vi.fn()} />);

    expect(screen.getByRole('spinbutton')).toHaveValue('7');
  });

  it('updates the score when the user types into the number input', async () => {
    const user = userEvent.setup();
    const updateCriteriaData = vi.fn();
    render(<SubtaskCriteria subtaskData={makeSubtask({ point: 0 })} updateCriteriaData={updateCriteriaData} />);

    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '5');

    expect(updateCriteriaData).toHaveBeenCalledWith(expect.objectContaining({ key: 'subtask-1', point: 5 }));
  });

  it('updates the comment when the user types into the textarea', async () => {
    const user = userEvent.setup();
    const updateCriteriaData = vi.fn();
    render(<SubtaskCriteria subtaskData={makeSubtask()} updateCriteriaData={updateCriteriaData} />);

    await user.type(screen.getByRole('textbox'), 'A');

    expect(updateCriteriaData).toHaveBeenCalledWith(expect.objectContaining({ textComment: 'A' }));
  });

  it('warns the user to leave a detailed comment when score is below max with a short comment', () => {
    render(
      <SubtaskCriteria
        subtaskData={makeSubtask({ point: 3, textComment: 'too short' })}
        updateCriteriaData={vi.fn()}
      />,
    );

    expect(screen.getByText('Please leave a detailed comment')).toBeInTheDocument();
  });

  it('does not warn when a sufficiently long comment is provided for a partial score', () => {
    render(
      <SubtaskCriteria
        subtaskData={makeSubtask({ point: 3, textComment: 'this is a long enough comment' })}
        updateCriteriaData={vi.fn()}
      />,
    );

    expect(screen.queryByText('Please leave a detailed comment')).not.toBeInTheDocument();
  });

  it('does not warn when the full score is given', () => {
    render(<SubtaskCriteria subtaskData={makeSubtask({ point: 10 })} updateCriteriaData={vi.fn()} />);

    expect(screen.queryByText('Please leave a detailed comment')).not.toBeInTheDocument();
  });

  it('does not warn when the score is undefined (not yet scored)', () => {
    render(<SubtaskCriteria subtaskData={makeSubtask({ point: undefined })} updateCriteriaData={vi.fn()} />);

    expect(screen.queryByText('Please leave a detailed comment')).not.toBeInTheDocument();
  });

  it('updates the score when the reviewer moves the slider', () => {
    const updateCriteriaData = vi.fn();
    render(<SubtaskCriteria subtaskData={makeSubtask({ point: 0 })} updateCriteriaData={updateCriteriaData} />);

    // antd Slider does not respond to keyboard reliably in jsdom (no layout width);
    // fire a keydown on the slider handle to drive its onChange.
    const sliderHandle = screen.getByRole('slider');
    fireEvent.keyDown(sliderHandle, { key: 'ArrowRight', keyCode: 39 });

    expect(updateCriteriaData).toHaveBeenCalledWith(expect.objectContaining({ key: 'subtask-1', point: 1 }));
  });
});
