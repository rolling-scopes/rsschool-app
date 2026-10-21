import { render, screen, waitFor } from '@testing-library/react';
import { setupUser } from '@client/__tests__/setupUser';
import { CommentModal } from './CommentModal';

describe('CommentModal', () => {
  const baseProps = {
    title: 'Leave a comment',
    open: true,
    onCancel: vi.fn(),
    onOk: vi.fn(),
  };

  beforeEach(() => {
    baseProps.onCancel.mockClear();
    baseProps.onOk.mockClear();
  });

  it('pre-fills the textarea and calls onCancel', async () => {
    const user = setupUser();
    render(<CommentModal {...baseProps} initialValue="prefilled" />);

    expect(screen.getByLabelText('Comment')).toHaveValue('prefilled');
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(baseProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('renders the modal and calls onOk with the typed comment when submitted', async () => {
    const user = setupUser();
    render(<CommentModal {...baseProps} />);

    expect(screen.getByText('Leave a comment')).toBeInTheDocument();
    expect(screen.getByLabelText('Comment')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Comment'), 'Nice work');
    await user.click(screen.getByRole('button', { name: /ok/i }));

    await waitFor(() => expect(baseProps.onOk).toHaveBeenCalledWith('Nice work'));
  });

  it('shows a validation error and does not call onOk when the comment is required but empty', async () => {
    const user = setupUser();
    render(<CommentModal {...baseProps} />);

    await user.click(screen.getByRole('button', { name: /ok/i }));

    expect(await screen.findByText('Please enter comment')).toBeInTheDocument();
    expect(baseProps.onOk).not.toHaveBeenCalled();
  });

  it('allows submitting an empty comment when availableEmptyComment is set', async () => {
    const user = setupUser();
    render(<CommentModal {...baseProps} availableEmptyComment />);

    await user.click(screen.getByRole('button', { name: /ok/i }));

    await waitFor(() => expect(baseProps.onOk).toHaveBeenCalledWith(''));
  });
});
