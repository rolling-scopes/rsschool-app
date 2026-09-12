/* eslint-disable testing-library/no-node-access */
import { render, screen, waitFor } from '@testing-library/react';
import { setupUser } from '@client/__tests__/setupUser';
import { MentorRegistryResendModal } from './MentorRegistryResendModal';

const record = { githubId: 'octocat' } as never;
const modalData = { record };

describe('<MentorRegistryResendModal />', () => {
  it('renders and handles resend, cancel, and loading states', async () => {
    const user = setupUser();
    const resendConfirmation = vi.fn();
    const onCancel = vi.fn();
    const { rerender } = render(
      <MentorRegistryResendModal modalData={modalData} resendConfirmation={resendConfirmation} onCancel={onCancel} />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Re-send Invitation for a Courses')).toBeInTheDocument();
    expect(screen.getByText('Do you want resend invitation for a not accepted courses?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Re-send' })).toBeInTheDocument();

    rerender(
      <MentorRegistryResendModal
        modalData={modalData}
        modalLoading
        resendConfirmation={resendConfirmation}
        onCancel={onCancel}
      />,
    );
    await waitFor(() => expect(document.querySelector('.ant-spin-spinning')).toBeInTheDocument());
    rerender(
      <MentorRegistryResendModal modalData={modalData} resendConfirmation={resendConfirmation} onCancel={onCancel} />,
    );

    await user.click(screen.getByRole('button', { name: 'Re-send' }));
    expect(resendConfirmation).toHaveBeenCalledWith(record);

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
