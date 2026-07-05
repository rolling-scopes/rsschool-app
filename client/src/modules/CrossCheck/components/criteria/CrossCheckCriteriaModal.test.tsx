import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  it('does not render its content when closed', () => {
    render(<CrossCheckCriteriaModal modalInfo={modalInfo} isModalVisible={false} showModal={vi.fn()} />);

    expect(screen.queryByText('Subtask in modal')).not.toBeInTheDocument();
  });

  it('renders the feedback title and criteria when open', () => {
    render(<CrossCheckCriteriaModal modalInfo={modalInfo} isModalVisible={true} showModal={vi.fn()} />);

    expect(screen.getByText('Feedback')).toBeInTheDocument();
    expect(screen.getByText('Subtask in modal')).toBeInTheDocument();
    expect(screen.getByText('Points for criteria: 5/10')).toBeInTheDocument();
  });

  it('closes via the OK button', async () => {
    const user = userEvent.setup();
    const showModal = vi.fn();
    render(<CrossCheckCriteriaModal modalInfo={modalInfo} isModalVisible={true} showModal={showModal} />);

    await user.click(screen.getByRole('button', { name: 'OK' }));

    expect(showModal).toHaveBeenCalledWith(false);
  });

  it('closes via the Cancel button', async () => {
    const user = userEvent.setup();
    const showModal = vi.fn();
    render(<CrossCheckCriteriaModal modalInfo={modalInfo} isModalVisible={true} showModal={showModal} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(showModal).toHaveBeenCalledWith(false);
  });
});
