/* eslint-disable testing-library/no-node-access */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MentorRegistryResendModal } from './MentorRegistryResendModal';

const record = { githubId: 'octocat' } as never;
const modalData = { record };

describe('<MentorRegistryResendModal />', () => {
  it('renders the dialog with resend copy and a Re-send button', () => {
    render(<MentorRegistryResendModal modalData={modalData} resendConfirmation={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Re-send Invitation for a Courses')).toBeInTheDocument();
    expect(screen.getByText('Do you want resend invitation for a not accepted courses?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Re-send' })).toBeInTheDocument();
  });

  it('calls resendConfirmation with the record when Re-send is clicked', async () => {
    const resendConfirmation = vi.fn();
    const user = userEvent.setup();
    render(
      <MentorRegistryResendModal modalData={modalData} resendConfirmation={resendConfirmation} onCancel={vi.fn()} />,
    );

    await user.click(screen.getByRole('button', { name: 'Re-send' }));

    expect(resendConfirmation).toHaveBeenCalledWith(record);
  });

  it('calls onCancel when the Cancel button is clicked', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<MentorRegistryResendModal modalData={modalData} resendConfirmation={vi.fn()} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalled();
  });

  it('shows a spinner while modalLoading is true', () => {
    // The Modal renders into a portal on document.body, so query the document.
    render(
      <MentorRegistryResendModal modalData={modalData} modalLoading resendConfirmation={vi.fn()} onCancel={vi.fn()} />,
    );

    expect(document.querySelector('.ant-spin-spinning')).toBeInTheDocument();
  });
});
