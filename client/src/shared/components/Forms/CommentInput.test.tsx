import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, Form } from 'antd';
import { CommentInput } from './CommentInput';

// CommentInput renders an antd `<Form.Item name="comment">` wrapping an `<Input.TextArea>`.
// Form.Item injects value/onChange, so we render it inside a real antd Form and type like
// a user. A submit button lets us trigger the (required, min: 30) validation.
function renderCommentInput(props: Parameters<typeof CommentInput>[0] = {}, onFinish = vi.fn()) {
  const utils = render(
    <Form onFinish={onFinish}>
      <CommentInput {...props} />
      <Button htmlType="submit">Submit</Button>
    </Form>,
  );
  return { ...utils, onFinish };
}

const LONG_COMMENT = 'This is a detailed comment that is well over thirty characters long.';

describe('CommentInput', () => {
  it('renders a "Comment" labelled textarea', () => {
    renderCommentInput();

    expect(screen.getByLabelText('Comment')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('lets the user type a comment and submits its value', async () => {
    const user = userEvent.setup();
    const { onFinish } = renderCommentInput();

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, LONG_COMMENT);
    expect(textarea).toHaveValue(LONG_COMMENT);

    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => expect(onFinish).toHaveBeenCalledWith({ comment: LONG_COMMENT }));
  });

  it('shows a required error and blocks submit when empty', async () => {
    const user = userEvent.setup();
    const { onFinish } = renderCommentInput();

    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByText('Please leave a detailed comment')).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('shows the min-length error when the comment is shorter than 30 characters', async () => {
    const user = userEvent.setup();
    const { onFinish } = renderCommentInput();

    await user.type(screen.getByRole('textbox'), 'too short');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByText('Please leave a detailed comment')).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('skips validation entirely when notRequired is set', async () => {
    const user = userEvent.setup();
    const { onFinish } = renderCommentInput({ notRequired: true });

    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => expect(onFinish).toHaveBeenCalled());
    expect(screen.queryByText('Please leave a detailed comment')).not.toBeInTheDocument();
  });
});
