import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, Form } from 'antd';
import MarkdownInput from './MarkdownInput';

// react-markdown is an ESM micromark pipeline that is heavy and brittle under jsdom.
// We stub it to a passthrough that renders its children verbatim so the surrounding
// MarkdownInput logic (preview toggle, danger-paragraph branch) is still driven by real
// interaction and we can assert the previewed text is handed to the renderer.
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="markdown">{children}</div>,
}));
vi.mock('remark-gfm', () => ({ default: () => {} }));

function renderMarkdownInput(historicalCommentSelected = '') {
  return render(
    <Form>
      <MarkdownInput historicalCommentSelected={historicalCommentSelected} />
    </Form>,
  );
}

// A reset button lets us exercise the Form.Item `onReset={resetText}` handler.
function ResettableMarkdownInput() {
  const [form] = Form.useForm();
  return (
    <Form form={form}>
      <MarkdownInput historicalCommentSelected="" />
      <Button onClick={() => form.resetFields()}>Reset</Button>
    </Form>
  );
}

const LONG_COMMENT = 'This is a detailed markdown comment well over thirty characters.';

describe('MarkdownInput', () => {
  it('renders the comment textarea and a Preview toggle in write mode', () => {
    renderMarkdownInput();

    expect(screen.getByLabelText(/Comment \(markdown syntax is supported\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /preview/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /about markdown/i })).toBeInTheDocument();
  });

  it('switches to preview mode and renders the typed text through react-markdown', async () => {
    const user = userEvent.setup();
    renderMarkdownInput();

    await user.type(screen.getByRole('textbox'), LONG_COMMENT);
    await user.click(screen.getByRole('button', { name: /preview/i }));

    const markdown = screen.getByTestId('markdown');
    expect(markdown).toHaveTextContent(LONG_COMMENT);
    // A long, valid comment must NOT show the danger reminder.
    expect(screen.queryByText('Please leave a comment')).not.toBeInTheDocument();
    expect(screen.queryByText('Please leave a detailed comment')).not.toBeInTheDocument();
    // The toggle now reads "Write".
    expect(screen.getByRole('button', { name: /write/i })).toBeInTheDocument();
  });

  it('shows "Please leave a comment" in preview when the field is empty', async () => {
    const user = userEvent.setup();
    renderMarkdownInput();

    await user.click(screen.getByRole('button', { name: /preview/i }));

    expect(screen.getByText('Please leave a comment')).toBeInTheDocument();
  });

  it('shows "Please leave a detailed comment" in preview when text is shorter than 30 chars', async () => {
    const user = userEvent.setup();
    const { container } = renderMarkdownInput();

    await user.type(screen.getByRole('textbox'), 'short text');
    await user.click(screen.getByRole('button', { name: /preview/i }));

    // The reminder is rendered as a danger-typed Typography.Paragraph. Scope to it to
    // avoid colliding with the (hidden, same-text) Form.Item required-rule message.
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const reminder = container.querySelector('.ant-typography-danger');
    expect(reminder).toHaveTextContent('Please leave a detailed comment');
  });

  it('toggles back to write mode from preview', async () => {
    const user = userEvent.setup();
    renderMarkdownInput();

    await user.click(screen.getByRole('button', { name: /preview/i }));
    await user.click(screen.getByRole('button', { name: /write/i }));

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /preview/i })).toBeInTheDocument();
  });

  it('clears the text and leaves preview mode when the form is reset', async () => {
    const user = userEvent.setup();
    render(<ResettableMarkdownInput />);

    // Type, switch to preview, then reset the form (fires the Form.Item onReset -> resetText).
    await user.type(screen.getByRole('textbox'), 'Some markdown content over thirty characters long.');
    await user.click(screen.getByRole('button', { name: /preview/i }));
    expect(screen.getByTestId('markdown')).toHaveTextContent('Some markdown content over thirty characters long.');

    await user.click(screen.getByRole('button', { name: /reset/i }));

    // resetText sets previewVisible=false (back to write mode) and clears the text.
    expect(screen.getByRole('textbox')).toHaveValue('');
    await user.click(screen.getByRole('button', { name: /preview/i }));
    expect(screen.getByTestId('markdown')).toHaveTextContent('');
    expect(screen.getByText('Please leave a comment')).toBeInTheDocument();
  });

  it('seeds the preview text from a non-empty historicalCommentSelected prop', async () => {
    const user = userEvent.setup();
    renderMarkdownInput('Historical pre-filled comment longer than thirty chars.');

    await user.click(screen.getByRole('button', { name: /preview/i }));

    expect(screen.getByTestId('markdown')).toHaveTextContent('Historical pre-filled comment longer than thirty chars.');
  });

  it('updates the previewed text when a new historical comment is selected', async () => {
    const user = userEvent.setup();
    const { rerender } = renderMarkdownInput('');

    rerender(
      <Form>
        <MarkdownInput historicalCommentSelected="A freshly selected historical comment over thirty chars." />
      </Form>,
    );

    await user.click(screen.getByRole('button', { name: /preview/i }));

    await waitFor(() =>
      expect(screen.getByTestId('markdown')).toHaveTextContent(
        'A freshly selected historical comment over thirty chars.',
      ),
    );
  });
});
