import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StudentLeaveCourse from '../StudentLeaveCourse';

const reasonsOptions = [
  { value: 'reason1', labelEn: 'Too difficult', labelRu: 'Слишком сложно' },
  { value: 'reason2', labelEn: 'No time', labelRu: 'Нет времени' },
];

function renderModal(overrides: Partial<React.ComponentProps<typeof StudentLeaveCourse>> = {}) {
  const props = {
    isOpen: true,
    onOk: vi.fn(),
    onCancel: vi.fn(),
    reasonsOptions,
    ...overrides,
  };
  return { props, ...render(<StudentLeaveCourse {...props} />) };
}

describe('StudentLeaveCourse', () => {
  it('renders the confirmation messages and reason options', () => {
    renderModal();
    expect(screen.getByText('Are you sure you want to leave the course?')).toBeInTheDocument();
    expect(screen.getByText('Your learning will be stopped.')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Too difficult/ })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /No time/ })).toBeInTheDocument();
  });

  it('does not call onOk when no reason is selected (validation fails)', async () => {
    const user = userEvent.setup();
    const onOk = vi.fn();
    renderModal({ onOk });

    await user.click(screen.getByRole('button', { name: 'Leave Course' }));

    expect(await screen.findByText('Please select at least one reason.')).toBeInTheDocument();
    expect(onOk).not.toHaveBeenCalled();
  });

  it('calls onOk with the selected reason when validation passes', async () => {
    const user = userEvent.setup();
    const onOk = vi.fn();
    renderModal({ onOk });

    await user.click(screen.getByRole('checkbox', { name: /Too difficult/ }));
    await user.click(screen.getByRole('button', { name: 'Leave Course' }));

    await waitFor(() => expect(onOk).toHaveBeenCalledTimes(1));
    expect(onOk).toHaveBeenCalledWith(expect.objectContaining({ reasonForLeaving: ['reason1'] }));
  });

  it('calls onCancel when "Continue studying" is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    renderModal({ onCancel });

    await user.click(screen.getByRole('button', { name: 'Continue studying' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('sets the OK button to loading when confirmLoading is true', () => {
    renderModal({ confirmLoading: true });
    const okButton = screen.getByRole('button', { name: /Leave Course/ });
    expect(okButton).toHaveClass('ant-btn-loading');
  });

  it('does not set the OK button to loading when confirmLoading is false', () => {
    renderModal({ confirmLoading: false });
    const okButton = screen.getByRole('button', { name: 'Leave Course' });
    expect(okButton).not.toHaveClass('ant-btn-loading');
  });
});
