import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { PromptsPage } from './PromptPage';

// --- Boundary mocks --------------------------------------------------------

vi.mock('@client/shared/components/PageLayout', () => ({
  AdminPageLayout: ({ title, children }: { title: string; children: ReactNode }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

vi.mock('@client/modules/Course/contexts', () => ({
  useActiveCourseContext: () => ({ courses: [] }),
}));

// The aliased @client/hooks test double does not export useModalForm; provide a
// real-enough implementation so the page's open/edit toggling works.
vi.mock('@client/hooks', async () => {
  const { useState } = await vi.importActual<typeof import('react')>('react');
  return {
    useModalForm: () => {
      const [open, setOpen] = useState(false);
      const [formData, setFormData] = useState<unknown>(undefined);
      const toggle = (data?: unknown) => {
        setFormData(data);
        setOpen(prev => !prev);
      };
      return { mode: 'create', open, formData, toggle };
    },
  };
});

const { getPrompts, createPrompt, updatePrompt, deletePrompt } = vi.hoisted(() => ({
  getPrompts: vi.fn(),
  createPrompt: vi.fn(),
  updatePrompt: vi.fn(),
  deletePrompt: vi.fn(),
}));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  PromptsApi: function PromptsApi() {
    return { getPrompts, createPrompt, updatePrompt, deletePrompt };
  },
}));

const prompts = [
  { id: 1, type: 'summary', temperature: 0.5, text: 'A body' },
  { id: 2, type: 'gratitude', temperature: 0.7, text: 'B body' },
];

describe('<PromptsPage />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPrompts.mockResolvedValue({ data: prompts });
    createPrompt.mockResolvedValue({});
    updatePrompt.mockResolvedValue({});
    deletePrompt.mockResolvedValue({});
  });

  it('loads and renders prompts on mount', async () => {
    render(<PromptsPage />);

    await waitFor(() => expect(getPrompts).toHaveBeenCalled());
    expect(await screen.findByText('summary')).toBeInTheDocument();
    expect(screen.getByText('gratitude')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /manage prompts/i })).toBeInTheDocument();
  });

  it('opens the create modal when "Add Prompt" is clicked', async () => {
    const user = userEvent.setup();
    render(<PromptsPage />);
    await screen.findByText('summary');

    await user.click(screen.getByRole('button', { name: /add prompt/i }));

    expect(await screen.findByText('Add prompt')).toBeInTheDocument();
  });

  it('creates a prompt and reloads the list on submit', async () => {
    const user = userEvent.setup();
    render(<PromptsPage />);
    await screen.findByText('summary');

    await user.click(screen.getByRole('button', { name: /add prompt/i }));
    await screen.findByText('Add prompt');
    const dialog = screen.getByRole('dialog');

    await user.type(within(dialog).getByLabelText('Type'), 'newtype');
    await user.type(within(dialog).getByLabelText('Text'), 'new text');
    await user.click(within(dialog).getByRole('button', { name: /ok/i }));

    await waitFor(() => expect(createPrompt).toHaveBeenCalled());
    await waitFor(() => expect(getPrompts).toHaveBeenCalledTimes(2));
  });

  it('opens the edit modal prefilled and updates by id', async () => {
    const user = userEvent.setup();
    render(<PromptsPage />);
    await screen.findByText('summary');

    const row = screen.getByRole('row', { name: /summary/ });
    const [editBtn] = within(row).getAllByRole('button');
    await user.click(editBtn);

    await screen.findByText('Edit prompt');
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByLabelText('Type')).toHaveValue('summary');

    const text = within(dialog).getByLabelText('Text');
    await user.clear(text);
    await user.type(text, 'edited body');
    await user.click(within(dialog).getByRole('button', { name: /ok/i }));

    await waitFor(() => expect(updatePrompt).toHaveBeenCalledWith(1, expect.objectContaining({ text: 'edited body' })));
  });

  it('deletes a prompt and reloads the list', async () => {
    const user = userEvent.setup();
    render(<PromptsPage />);
    await screen.findByText('gratitude');

    const row = screen.getByRole('row', { name: /gratitude/ });
    const buttons = within(row).getAllByRole('button');
    await user.click(buttons[1]);

    await waitFor(() => expect(deletePrompt).toHaveBeenCalledWith(2));
    await waitFor(() => expect(getPrompts).toHaveBeenCalledTimes(2));
  });

  it('shows an error message when loading prompts fails', async () => {
    const { message } = await import('antd');
    const errorSpy = vi.spyOn(message, 'error').mockImplementation(() => ({}) as never);
    getPrompts.mockRejectedValueOnce(new Error('boom'));
    render(<PromptsPage />);

    await waitFor(() => expect(errorSpy).toHaveBeenCalledWith('Something went wrong. Please try again later.'));
    errorSpy.mockRestore();
  });
});
