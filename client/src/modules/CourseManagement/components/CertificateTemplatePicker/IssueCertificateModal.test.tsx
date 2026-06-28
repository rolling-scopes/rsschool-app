import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IssueCertificateModal } from './IssueCertificateModal';

// Stub the CertificateTemplatePicker (axios fetch + antd Image preview = brittle in
// a modal). The stub is a minimal controlled child that exposes the current value and
// lets the test drive `onChange`, mirroring how the real picker integrates with the modal.
vi.mock('./CertificateTemplatePicker', () => ({
  CertificateTemplatePicker: (props: { value?: string; onChange?: (v: string) => void }) => (
    <div>
      <span data-testid="picker-value">{props.value ?? ''}</span>
      <button type="button" onClick={() => props.onChange?.('modern')}>
        pick modern
      </button>
    </div>
  ),
}));

function makeProps(overrides: Partial<Parameters<typeof IssueCertificateModal>[0]> = {}) {
  return {
    open: true,
    onCancel: vi.fn(),
    onSubmit: vi.fn(),
    ...overrides,
  };
}

describe('<IssueCertificateModal />', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does not render the dialog when closed', () => {
    render(<IssueCertificateModal {...makeProps({ open: false })} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the generic title when no student name is provided', async () => {
    render(<IssueCertificateModal {...makeProps()} />);

    expect(await screen.findByText('Issue certificate')).toBeInTheDocument();
  });

  it('renders a per-student title when a student name is provided', async () => {
    render(<IssueCertificateModal {...makeProps({ studentName: 'Ada Lovelace' })} />);

    expect(await screen.findByText('Issue certificate — Ada Lovelace')).toBeInTheDocument();
  });

  it('disables the Issue button until a template is chosen', async () => {
    render(<IssueCertificateModal {...makeProps()} />);

    const issue = await screen.findByRole('button', { name: 'Issue' });
    expect(issue).toBeDisabled();
  });

  it('enables Issue and submits the chosen template id', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<IssueCertificateModal {...props} />);

    await user.click(await screen.findByRole('button', { name: /pick modern/i }));

    const issue = await screen.findByRole('button', { name: 'Issue' });
    expect(issue).toBeEnabled();

    await user.click(issue);
    expect(props.onSubmit).toHaveBeenCalledWith('modern');
  });

  it('does not call onSubmit when no template is selected (onOk guard)', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<IssueCertificateModal {...props} />);

    // Force a click on the disabled-looking guard path: even if clicked, templateId is undefined.
    const issue = await screen.findByRole('button', { name: 'Issue' });
    await user.click(issue);

    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it('calls onCancel when the cancel button is clicked', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<IssueCertificateModal {...props} />);

    await user.click(await screen.findByRole('button', { name: /cancel/i }));
    expect(props.onCancel).toHaveBeenCalled();
  });

  it('resets the selected template when the modal is reopened', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<IssueCertificateModal {...makeProps()} />);

    await user.click(await screen.findByRole('button', { name: /pick modern/i }));
    expect(screen.getByTestId('picker-value')).toHaveTextContent('modern');

    // Close then reopen: the useEffect clears templateId so the Issue button is disabled again.
    rerender(<IssueCertificateModal {...makeProps({ open: false })} />);
    rerender(<IssueCertificateModal {...makeProps({ open: true })} />);

    expect(await screen.findByTestId('picker-value')).toHaveTextContent('');
    expect(screen.getByRole('button', { name: 'Issue' })).toBeDisabled();
  });
});
