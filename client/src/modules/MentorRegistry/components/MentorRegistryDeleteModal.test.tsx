/* eslint-disable testing-library/no-node-access */
import { render, screen } from '@testing-library/react';
import { setupUser } from '@client/__tests__/setupUser';
import { MentorRegistryDeleteModal } from './MentorRegistryDeleteModal';

const modalData = { record: { githubId: 'octocat' } };

describe('<MentorRegistryDeleteModal />', () => {
  it('renders the loading confirmation dialog and calls onCancel', async () => {
    const user = setupUser();
    const onCancel = vi.fn();
    render(<MentorRegistryDeleteModal modalData={modalData} modalLoading cancelMentor={vi.fn()} onCancel={onCancel} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Are you sure to delete this Mentor apply?')).toBeInTheDocument();
    expect(screen.getByText("If you delete mentor's apply you can't restore it.")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(document.querySelector('.ant-spin-spinning')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('calls cancelMentor with the record githubId when Delete is confirmed', async () => {
    const cancelMentor = vi.fn().mockResolvedValue(undefined);
    const user = setupUser();
    render(<MentorRegistryDeleteModal modalData={modalData} cancelMentor={cancelMentor} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(cancelMentor).toHaveBeenCalledWith('octocat');
  });
});
