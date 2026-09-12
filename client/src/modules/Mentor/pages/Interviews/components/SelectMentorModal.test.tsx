import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { setupUser } from '@client/__tests__/setupUser';
import type { MentorInterview } from '@client/services/course';
import { SelectMentorModal } from './SelectMentorModal';

// MentorSearch performs remote search via CourseMentorsApi; stub it to a simple
// text input that writes the typed value into the antd form via onChange.
vi.mock('@client/shared/components/MentorSearch', () => ({
  MentorSearch: ({ value, onChange }: { value?: string; onChange?: (v: string) => void }) => (
    <input aria-label="mentor-search" value={value ?? ''} onChange={e => onChange?.(e.target.value)} />
  ),
}));

// GithubAvatar pulls a remote image; render nothing meaningful.
vi.mock('@client/shared/components/GithubAvatar', () => ({
  GithubAvatar: () => <span data-testid="avatar" />,
}));

const INTERVIEWS = [
  {
    id: 11,
    student: { id: 1, githubId: 'alice', name: 'Alice A' },
  },
  {
    id: 22,
    student: { id: 2, githubId: 'bob', name: '' },
  },
] as unknown as MentorInterview[];

function renderModal(props: Partial<Parameters<typeof SelectMentorModal>[0]> = {}) {
  const onOk = vi.fn();
  const onCancel = vi.fn();
  render(<SelectMentorModal courseId={400} interviews={INTERVIEWS} onOk={onOk} onCancel={onCancel} {...props} />);
  return { onOk, onCancel };
}

describe('SelectMentorModal', () => {
  it('should call onCancel when the modal is cancelled', async () => {
    const user = setupUser();
    const { onCancel } = renderModal();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('Student')).toBeInTheDocument();
    expect(screen.getByLabelText('Mentor')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Cancel/ }));

    expect(onCancel).toHaveBeenCalled();
  });

  it('should not submit and should show validation errors when no student/mentor is chosen', async () => {
    const user = setupUser();
    const { onOk } = renderModal();

    await user.click(screen.getByRole('button', { name: /Save/ }));

    // validation blocks the submit
    await waitFor(() => expect(onOk).not.toHaveBeenCalled());
    expect(await screen.findByText(/Please select\s+student/)).toBeInTheDocument();
    expect(screen.getByText(/Please select\s+mentor/)).toBeInTheDocument();
  });

  it('should submit the selected student and mentor through onOk', async () => {
    const user = setupUser();
    const { onOk } = renderModal();

    // open the Student combobox (antd opens dropdowns on mouseDown) and pick Alice
    fireEvent.mouseDown(screen.getByLabelText('Student'));
    await screen.findByRole('listbox');
    expect(await screen.findByText('bob')).toBeInTheDocument();
    fireEvent.click(await screen.findByText('Alice A'));

    // set the mentor github id on the stubbed MentorSearch input
    fireEvent.change(screen.getByLabelText('mentor-search'), { target: { value: 'mentor-gh' } });

    await user.click(screen.getByRole('button', { name: /Save/ }));

    await waitFor(() => expect(onOk).toHaveBeenCalledWith('mentor-gh', 11));
  });
});
