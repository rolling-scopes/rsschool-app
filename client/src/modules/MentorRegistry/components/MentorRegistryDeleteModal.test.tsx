/* eslint-disable testing-library/no-node-access */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MentorRegistryDeleteModal } from './MentorRegistryDeleteModal';

const modalData = { record: { githubId: 'octocat' } };

describe('<MentorRegistryDeleteModal />', () => {
  it('renders the confirmation dialog with warning copy and a Delete button', () => {
    render(<MentorRegistryDeleteModal modalData={modalData} cancelMentor={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Are you sure to delete this Mentor apply?')).toBeInTheDocument();
    expect(screen.getByText("If you delete mentor's apply you can't restore it.")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('calls cancelMentor with the record githubId when Delete is confirmed', async () => {
    const cancelMentor = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<MentorRegistryDeleteModal modalData={modalData} cancelMentor={cancelMentor} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(cancelMentor).toHaveBeenCalledWith('octocat');
  });

  it('calls onCancel when the Cancel button is clicked', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<MentorRegistryDeleteModal modalData={modalData} cancelMentor={vi.fn()} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalled();
  });

  it('shows a spinner while modalLoading is true', () => {
    // The Modal renders into a portal on document.body, so query the document.
    render(<MentorRegistryDeleteModal modalData={modalData} modalLoading cancelMentor={vi.fn()} onCancel={vi.fn()} />);

    expect(document.querySelector('.ant-spin-spinning')).toBeInTheDocument();
  });
});
