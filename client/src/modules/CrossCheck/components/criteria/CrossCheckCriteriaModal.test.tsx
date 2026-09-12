import { fireEvent, render, screen } from '@testing-library/react';
import { CrossCheckCriteriaDataDto, CrossCheckCriteriaDataDtoTypeEnum } from '@client/api';
import { CrossCheckCriteriaModal } from './CrossCheckCriteriaModal';

const modalInfo: CrossCheckCriteriaDataDto[] = [
  {
    key: 's1',
    text: 'Subtask in modal',
    type: CrossCheckCriteriaDataDtoTypeEnum.Subtask,
    point: 5,
    max: 10,
  } as CrossCheckCriteriaDataDto,
];

describe('<CrossCheckCriteriaModal />', () => {
  it('renders closed and open states and invokes both close actions', () => {
    const showModal = vi.fn();
    const { rerender } = render(
      <CrossCheckCriteriaModal modalInfo={modalInfo} isModalVisible={false} showModal={showModal} />,
    );

    expect(screen.queryByText('Subtask in modal')).not.toBeInTheDocument();
    rerender(<CrossCheckCriteriaModal modalInfo={modalInfo} isModalVisible={true} showModal={showModal} />);

    expect(screen.getByText('Feedback')).toBeInTheDocument();
    expect(screen.getByText('Subtask in modal')).toBeInTheDocument();
    expect(screen.getByText('Points for criteria: 5/10')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(showModal).toHaveBeenCalledWith(false);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(showModal).toHaveBeenCalledWith(false);
    expect(showModal).toHaveBeenCalledTimes(2);
  });
});
