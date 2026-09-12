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

  it('handles its closed, open, selected, reopened, and student states', async () => {
    const user = userEvent.setup();
    const props = makeProps({ open: false });
    const { rerender } = render(<IssueCertificateModal {...props} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(<IssueCertificateModal {...props} open />);

    expect(await screen.findByText('Issue certificate')).toBeInTheDocument();
    const issue = await screen.findByRole('button', { name: 'Issue' });
    expect(issue).toBeDisabled();
    await user.click(issue);
    expect(props.onSubmit).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(props.onCancel).toHaveBeenCalled();

    await user.click(await screen.findByRole('button', { name: /pick modern/i }));

    expect(issue).toBeEnabled();
    await user.click(issue);
    expect(props.onSubmit).toHaveBeenCalledWith('modern');
    expect(screen.getByTestId('picker-value')).toHaveTextContent('modern');

    rerender(<IssueCertificateModal {...props} open={false} />);
    rerender(<IssueCertificateModal {...props} open />);

    expect(await screen.findByTestId('picker-value')).toHaveTextContent('');
    expect(screen.getByRole('button', { name: 'Issue' })).toBeDisabled();

    rerender(<IssueCertificateModal {...props} open studentName="Ada Lovelace" />);
    expect(await screen.findByText('Issue certificate — Ada Lovelace')).toBeInTheDocument();
  });
});
