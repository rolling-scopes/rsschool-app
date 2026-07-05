import { Form } from 'antd';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CrossCheckMessageDtoRoleEnum } from '@client/api';
import { CrossCheckMessageAuthor } from '@client/services/course';
import MessageSendingPanel, { MessageSendingPanelProps } from './MessageSendingPanel';

// react-markdown is a heavy ESM module; stub it to render its children as text.
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>,
}));
vi.mock('remark-gfm', () => ({ default: () => {} }));

const author: CrossCheckMessageAuthor = { id: 5, githubId: 'reviewer-gh' };

function renderPanel(props: Partial<MessageSendingPanelProps> = {}) {
  const onFinish = vi.fn();
  const merged: MessageSendingPanelProps = {
    sessionId: 1,
    sessionGithubId: 'session-gh',
    author,
    currentRole: CrossCheckMessageDtoRoleEnum.Reviewer,
    areContactsVisible: true,
    ...props,
  };

  render(
    <Form onFinish={onFinish} initialValues={{ content: '' }}>
      <MessageSendingPanel {...merged} />
    </Form>,
  );

  return { onFinish };
}

describe('<MessageSendingPanel />', () => {
  it('renders a collapsed "Leave a message" input initially', () => {
    renderPanel();

    expect(screen.getByPlaceholderText('Leave a message')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Send message/ })).not.toBeInTheDocument();
  });

  it('opens the editing panel when the collapsed input is clicked', async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByPlaceholderText('Leave a message'));

    expect(screen.getByRole('button', { name: /Send message/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Preview' })).toBeInTheDocument();
  });

  it('opens the editing panel when Enter is pressed on the collapsed input', async () => {
    const user = userEvent.setup();
    renderPanel();

    const collapsed = screen.getByPlaceholderText('Leave a message');
    collapsed.focus();
    await user.keyboard('{Enter}');

    expect(screen.getByRole('button', { name: /Send message/ })).toBeInTheDocument();
  });

  it('closes the panel again via Cancel', async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByPlaceholderText('Leave a message'));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('button', { name: /Send message/ })).not.toBeInTheDocument();
  });

  it('submits the typed message content through the form', async () => {
    const user = userEvent.setup();
    const { onFinish } = renderPanel();

    await user.click(screen.getByPlaceholderText('Leave a message'));
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Great work!');
    await user.click(screen.getByRole('button', { name: /Send message/ }));

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledWith(expect.objectContaining({ content: 'Great work!' }));
    });
  });

  it('blocks submitting an empty message and shows a validation error', async () => {
    const user = userEvent.setup();
    const { onFinish } = renderPanel();

    await user.click(screen.getByPlaceholderText('Leave a message'));
    await user.click(screen.getByRole('button', { name: /Send message/ }));

    expect(await screen.findByText('Please enter message')).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('toggles the markdown preview and shows the typed content', async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByPlaceholderText('Leave a message'));
    await user.type(screen.getByRole('textbox'), 'preview me');
    await user.click(screen.getByRole('button', { name: 'Preview' }));

    expect(screen.getByTestId('markdown')).toHaveTextContent('preview me');
    // The toggle button now flips to "Write".
    expect(screen.getByRole('button', { name: 'Write' })).toBeInTheDocument();
  });

  it('shows "Nothing to preview" when previewing an empty message', async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByPlaceholderText('Leave a message'));
    await user.click(screen.getByRole('button', { name: 'Preview' }));

    expect(screen.getByTestId('markdown')).toHaveTextContent('Nothing to preview');
  });
});
