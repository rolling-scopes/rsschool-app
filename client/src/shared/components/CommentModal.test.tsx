import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('renders the modal title and a comment textarea when open', () => {
    render(<CommentModal {...baseProps} />);

    expect(screen.getByText('Leave a comment')).toBeInTheDocument();
    expect(screen.getByLabelText('Comment')).toBeInTheDocument();
  });

  it('pre-fills the textarea with the initial value', () => {
    render(<CommentModal {...baseProps} initialValue="prefilled" />);

    expect(screen.getByLabelText('Comment')).toHaveValue('prefilled');
  });

  it('calls onOk with the typed comment when submitted', async () => {
    const user = userEvent.setup();
    render(<CommentModal {...baseProps} />);

    await user.type(screen.getByLabelText('Comment'), 'Nice work');
    await user.click(screen.getByRole('button', { name: /ok/i }));

    await waitFor(() => expect(baseProps.onOk).toHaveBeenCalledWith('Nice work'));
  });

  it('shows a validation error and does not call onOk when the comment is required but empty', async () => {
    const user = userEvent.setup();
    render(<CommentModal {...baseProps} />);

    await user.click(screen.getByRole('button', { name: /ok/i }));

    expect(await screen.findByText('Please enter comment')).toBeInTheDocument();
    expect(baseProps.onOk).not.toHaveBeenCalled();
  });

  it('allows submitting an empty comment when availableEmptyComment is set', async () => {
    const user = userEvent.setup();
    render(<CommentModal {...baseProps} availableEmptyComment />);

    await user.click(screen.getByRole('button', { name: /ok/i }));

    await waitFor(() => expect(baseProps.onOk).toHaveBeenCalledWith(''));
  });

  it('calls onCancel when the cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<CommentModal {...baseProps} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(baseProps.onCancel).toHaveBeenCalledTimes(1);
  });
});
