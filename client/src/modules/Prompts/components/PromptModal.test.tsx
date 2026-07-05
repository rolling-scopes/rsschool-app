import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { message } from 'antd';
import { PromptDto } from '@client/api';
import { PromptModal } from './PromptModal';

// --- Boundary mock ---------------------------------------------------------
// PromptsApi is instantiated at module scope; create/update are called on submit.
const { createPrompt, updatePrompt } = vi.hoisted(() => ({
  createPrompt: vi.fn(),
  updatePrompt: vi.fn(),
}));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  PromptsApi: function PromptsApi() {
    return { createPrompt, updatePrompt };
  },
}));

const editPrompt = { id: 4, type: 'summary', temperature: 0.7, text: 'Existing text' } as unknown as PromptDto;

function makeProps(overrides: Partial<Parameters<typeof PromptModal>[0]> = {}) {
  return {
    open: true,
    onCancel: vi.fn(),
    loadData: vi.fn().mockResolvedValue(undefined),
    data: undefined,
    ...overrides,
  } as Parameters<typeof PromptModal>[0];
}

describe('<PromptModal />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createPrompt.mockResolvedValue({});
    updatePrompt.mockResolvedValue({});
  });

  it('renders the "Add prompt" title with a default temperature when creating', () => {
    render(<PromptModal {...makeProps()} />);

    expect(screen.getByText('Add prompt')).toBeInTheDocument();
    expect(screen.getByLabelText('Type')).toHaveValue('');
    expect(screen.getByLabelText('Temperature')).toHaveValue('0.5');
  });

  it('renders the "Edit prompt" title and prefills fields when editing', () => {
    render(<PromptModal {...makeProps({ data: editPrompt })} />);

    expect(screen.getByText('Edit prompt')).toBeInTheDocument();
    expect(screen.getByLabelText('Type')).toHaveValue('summary');
    expect(screen.getByLabelText('Text')).toHaveValue('Existing text');
  });

  it('shows validation errors and does not submit when required fields are empty', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<PromptModal {...props} />);

    await user.click(screen.getByRole('button', { name: /ok/i }));

    expect(await screen.findAllByText(/required|please/i)).not.toHaveLength(0);
    expect(createPrompt).not.toHaveBeenCalled();
  });

  it('creates a prompt from the typed values, reloads and closes', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<PromptModal {...props} />);

    await user.type(screen.getByLabelText('Type'), 'gratitude');
    await user.type(screen.getByLabelText('Text'), 'A prompt body');
    await user.click(screen.getByRole('button', { name: /ok/i }));

    await waitFor(() =>
      expect(createPrompt).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'gratitude', text: 'A prompt body', temperature: 0.5 }),
      ),
    );
    expect(updatePrompt).not.toHaveBeenCalled();
    await waitFor(() => expect(props.loadData).toHaveBeenCalled());
    await waitFor(() => expect(props.onCancel).toHaveBeenCalled());
  });

  it('updates the existing prompt by id when editing', async () => {
    const user = userEvent.setup();
    const props = makeProps({ data: editPrompt });
    render(<PromptModal {...props} />);

    const text = screen.getByLabelText('Text');
    await user.clear(text);
    await user.type(text, 'New body');
    await user.click(screen.getByRole('button', { name: /ok/i }));

    await waitFor(() =>
      expect(updatePrompt).toHaveBeenCalledWith(4, expect.objectContaining({ type: 'summary', text: 'New body' })),
    );
    expect(createPrompt).not.toHaveBeenCalled();
  });

  it('shows an error message when the API rejects', async () => {
    const user = userEvent.setup();
    const errorSpy = vi.spyOn(message, 'error').mockImplementation(() => ({}) as never);
    createPrompt.mockRejectedValueOnce(new Error('boom'));
    const props = makeProps();
    render(<PromptModal {...props} />);

    await user.type(screen.getByLabelText('Type'), 'gratitude');
    await user.type(screen.getByLabelText('Text'), 'A prompt body');
    await user.click(screen.getByRole('button', { name: /ok/i }));

    await waitFor(() => expect(errorSpy).toHaveBeenCalledWith('Something went wrong. Please try again later.'));
    expect(props.onCancel).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<PromptModal {...props} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(props.onCancel).toHaveBeenCalled();
  });
});
