import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CoursesListModal } from './index';

// Mock only the API boundary: the generated CoursesApi class. The component
// constructs `new CoursesApi()` at module scope and calls `getCourses()`.
const { getCourses } = vi.hoisted(() => ({
  getCourses: vi.fn(),
}));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  CoursesApi: function CoursesApi() {
    return { getCourses };
  },
}));

function makeProps(overrides: Partial<Parameters<typeof CoursesListModal>[0]> = {}) {
  return {
    data: {} as { id?: number },
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  };
}

describe('<CoursesListModal />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCourses.mockResolvedValue({
      data: [
        { id: 1, name: 'JavaScript' },
        { id: 2, name: 'React' },
      ],
    });
  });

  it('returns null (renders no modal) when data is null', () => {
    render(<CoursesListModal {...makeProps({ data: null })} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the modal with title and the course select field', async () => {
    render(<CoursesListModal {...makeProps()} />);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Courses')).toBeInTheDocument();
    expect(screen.getByLabelText('Course')).toBeInTheDocument();
  });

  it('uses the provided okText for the submit button', async () => {
    render(<CoursesListModal {...makeProps({ okText: 'Copy' })} />);

    expect(await screen.findByRole('button', { name: 'Copy' })).toBeInTheDocument();
  });

  it('renders children passed into the modal body', async () => {
    render(
      <CoursesListModal {...makeProps()}>
        <div>extra child content</div>
      </CoursesListModal>,
    );

    expect(await screen.findByText('extra child content')).toBeInTheDocument();
  });

  it('renders the fetched courses as select options', async () => {
    render(<CoursesListModal {...makeProps()} />);

    const combobox = await screen.findByRole('combobox');
    fireEvent.mouseDown(combobox);

    await waitFor(() => {
      expect(within(document.body).getByText('JavaScript')).toBeInTheDocument();
      expect(within(document.body).getByText('React')).toBeInTheDocument();
    });
  });

  it('does not submit and shows a validation message when no course is selected', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<CoursesListModal {...props} />);

    const save = await screen.findByRole('button', { name: /save/i });
    await user.click(save);

    expect(await screen.findByText('Please select a course')).toBeInTheDocument();
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it('submits the selected course id mapped to { id } on save', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<CoursesListModal {...props} />);

    const combobox = await screen.findByRole('combobox');
    fireEvent.mouseDown(combobox);

    const option = await within(document.body).findByText('React');
    fireEvent.click(option);

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(props.onSubmit).toHaveBeenCalledWith({ id: 2 });
    });
  });

  it('calls onCancel when the modal cancel button is clicked', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<CoursesListModal {...props} />);

    const cancel = await screen.findByRole('button', { name: /cancel/i });
    await user.click(cancel);

    expect(props.onCancel).toHaveBeenCalled();
  });

  it('filters options by typed input via filterOption', async () => {
    const user = userEvent.setup();
    render(<CoursesListModal {...makeProps()} />);

    const combobox = await screen.findByRole('combobox');
    await user.click(combobox);
    await user.type(combobox, 'react');

    // "JavaScript" should be filtered out; only "React" remains visible.
    await waitFor(() => {
      expect(within(document.body).getByText('React')).toBeInTheDocument();
    });
    expect(within(document.body).queryByText('JavaScript')).not.toBeInTheDocument();
  });
});
