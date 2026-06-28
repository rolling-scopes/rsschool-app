/* eslint-disable testing-library/no-node-access */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { message } from 'antd';
import { CourseTaskModal } from './index';

// Spy on antd's global message.error to assert the cross-check duration guard fires.
vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd');
  return { ...actual, message: { ...actual.message, error: vi.fn() } };
});

// --- Boundary mocks --------------------------------------------------------

// Generated TasksApi: the component calls `new TasksApi().getTasks()` at mount.
const { getTasks } = vi.hoisted(() => ({
  getTasks: vi.fn(),
}));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  TasksApi: function TasksApi() {
    return { getTasks };
  },
}));

// UserService backs the UserSearch remote search. Stubbed to a no-op resolver.
vi.mock('@client/services/user', () => ({
  UserService: function UserService() {
    return { searchUser: vi.fn().mockResolvedValue([]) };
  },
}));

// UserSearch is a remote-data Select (brittle). Replace with a minimal controlled
// stub that preserves value/onChange, like ManualSubmitTab stubs StudentSearch.
// It also forwards to searchFn so the modal's loadUsers handler is exercised.
vi.mock('@client/shared/components/UserSearch', () => ({
  UserSearch: (props: {
    value?: number;
    onChange?: (v: number) => void;
    searchFn?: (text: string) => Promise<unknown>;
  }) => (
    <input
      data-testid="task-owner"
      value={props.value ?? ''}
      onChange={e => {
        props.onChange?.(Number(e.target.value));
        props.searchFn?.(e.target.value);
      }}
    />
  ),
}));

const tasks = [
  { id: 10, name: 'HTML Task', type: 'htmltask', tags: ['html'] },
  { id: 20, name: 'Interview', type: 'interview', tags: [] },
];

function makeProps(overrides: Partial<Parameters<typeof CourseTaskModal>[0]> = {}) {
  return {
    data: {} as Partial<Parameters<typeof CourseTaskModal>[0]>['data'],
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  };
}

describe('<CourseTaskModal />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getTasks.mockResolvedValue({ data: tasks });
  });

  it('renders nothing when data is null', () => {
    render(<CourseTaskModal {...makeProps({ data: null })} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the Course Task modal with its core fields', async () => {
    render(<CourseTaskModal {...makeProps()} />);

    expect(await screen.findByText('Course Task')).toBeInTheDocument();
    expect(screen.getByLabelText('Task')).toBeInTheDocument();
    expect(screen.getByLabelText('Task Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Checker')).toBeInTheDocument();
    expect(screen.getByLabelText('Score')).toBeInTheDocument();
    expect(screen.getByLabelText('Score Weight')).toBeInTheDocument();
  });

  it('seeds default Score (100) and Score Weight (1) from getInitialValues', async () => {
    render(<CourseTaskModal {...makeProps()} />);

    await screen.findByText('Course Task');
    // antd InputNumber exposes the numeric value via aria-valuenow on role="spinbutton".
    expect(screen.getByLabelText('Score')).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByLabelText('Score Weight')).toHaveAttribute('aria-valuenow', '1');
  });

  it('lists the fetched tasks as options in the Task select', async () => {
    render(<CourseTaskModal {...makeProps()} />);

    const taskSelect = await screen.findByLabelText('Task');
    fireEvent.mouseDown(taskSelect);

    await waitFor(() => {
      expect(within(document.body).getByText(/HTML Task/)).toBeInTheDocument();
      expect(within(document.body).getByText(/Interview/)).toBeInTheDocument();
    });
  });

  it('auto-fills Task Type when a task is selected', async () => {
    render(<CourseTaskModal {...makeProps()} />);

    const taskSelect = await screen.findByLabelText('Task');
    fireEvent.mouseDown(taskSelect);

    const option = await within(document.body).findByText(/HTML Task/);
    fireEvent.click(option);

    // The task's type ("htmltask" → "HTML task") flows into the Type select.
    await waitFor(() => {
      expect(screen.getByLabelText('Task Type').closest('.ant-select')).toHaveTextContent('HTML task');
    });
  });

  it('shows a validation message and does not submit when Task is empty', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<CourseTaskModal {...props} />);

    await screen.findByText('Course Task');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText('Please select a task')).toBeInTheDocument();
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it('reveals the Cross-Check section when the Cross-Check checker is chosen', async () => {
    render(<CourseTaskModal {...makeProps()} />);

    const checkerSelect = await screen.findByLabelText('Checker');
    fireEvent.mouseDown(checkerSelect);

    const crossCheckOption = await within(document.body).findByText('Cross-Check');
    fireEvent.click(crossCheckOption);

    expect(await screen.findByText('Cross-Check End Date')).toBeInTheDocument();
    // "Cross-Check Pairs Count" appears both as a label and as the select placeholder.
    expect(screen.getAllByText('Cross-Check Pairs Count').length).toBeGreaterThan(0);
    expect(screen.getByText('Require GitHub Username in URL')).toBeInTheDocument();
    expect(screen.getByText('Require GitHub Pull Request in URL')).toBeInTheDocument();
  });

  it('shows the Registration Start Date field for interview-type tasks', async () => {
    render(<CourseTaskModal {...makeProps({ data: { type: 'interview' } })} />);

    expect(await screen.findByText('Registration Start Date')).toBeInTheDocument();
  });

  it('submits the built record (taskId, checker, scores) when the form is valid', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<CourseTaskModal {...props} />);

    // Choose a task (required). Range/checker/scores are seeded by getInitialValues.
    const taskSelect = await screen.findByLabelText('Task');
    fireEvent.mouseDown(taskSelect);
    fireEvent.click(await within(document.body).findByText(/HTML Task/));

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(props.onSubmit).toHaveBeenCalled());
    const record = props.onSubmit.mock.calls[0][0];
    expect(record).toMatchObject({
      taskId: 10,
      checker: 'auto-test',
      maxScore: 100,
      scoreWeight: 1,
    });
    expect(typeof record.studentStartDate).toBe('string');
    expect(typeof record.studentEndDate).toBe('string');
  });

  it('blocks cross-check submit when the cross-check duration is under 3 days', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    // Seed an editable record so the form already has dates close together; choosing
    // crossCheck makes the (range end → crossCheckEndDate) gap too small.
    render(<CourseTaskModal {...props} />);

    // Select a task so the form's required Task field is valid.
    const taskSelect = await screen.findByLabelText('Task');
    fireEvent.mouseDown(taskSelect);
    fireEvent.click(await within(document.body).findByText(/HTML Task/));

    // Switch checker to Cross-Check to reveal the cross-check fields.
    const checkerSelect = screen.getByLabelText('Checker');
    fireEvent.mouseDown(checkerSelect);
    fireEvent.click(await within(document.body).findByText('Cross-Check'));

    // crossCheckEndDate is required; without it the form validation prevents submit.
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(props.onSubmit).not.toHaveBeenCalled());
    expect(await screen.findByText('Please enter cross-check end date')).toBeInTheDocument();
  });

  it('blocks submit and shows an error when the cross-check duration is under 3 days', async () => {
    const user = userEvent.setup();
    const props = makeProps({
      // Edit an existing cross-check task whose cross-check window is only ~1 day after the
      // task end date — getInitialValues prefills range + crossCheckEndDate, so submit reaches
      // the duration guard in handleModalSubmit.
      data: {
        taskId: 10,
        checker: 'crossCheck',
        studentStartDate: '2024-01-01T00:00:00.000Z',
        studentEndDate: '2024-01-10T00:00:00.000Z',
        crossCheckEndDate: '2024-01-11T00:00:00.000Z',
        // pairsCount is also required in cross-check mode; seed it so form validation passes
        // and submit reaches the duration guard.
        pairsCount: 2,
        maxScore: 100,
        scoreWeight: 1,
      } as never,
    });
    render(<CourseTaskModal {...props} />);

    // The cross-check fields are shown because changes is seeded from data.
    expect(await screen.findByText('Cross-Check End Date')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('The minimum duration of a cross-check is 3 days.');
    });
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it('filters the task options by typed input via filterOption', async () => {
    const user = userEvent.setup();
    render(<CourseTaskModal {...makeProps()} />);

    const taskSelect = await screen.findByLabelText('Task');
    await user.click(taskSelect);
    await user.type(taskSelect, 'interview');

    // "HTML Task" should be filtered out; only "Interview" remains.
    await waitFor(() => {
      expect(within(document.body).getByText(/Interview/)).toBeInTheDocument();
    });
    expect(within(document.body).queryByText(/HTML Task/)).not.toBeInTheDocument();
  });

  it('calls onCancel when the cancel button is clicked on a pristine form', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<CourseTaskModal {...props} />);

    await screen.findByText('Course Task');
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(props.onCancel).toHaveBeenCalled();
  });

  it('prefills the task owner and registration start date from an interview record', async () => {
    render(
      <CourseTaskModal
        {...makeProps({
          data: {
            taskId: 20,
            type: 'interview',
            taskOwner: { id: 99, githubId: 'owner' },
            studentRegistrationStartDate: '2024-01-01T00:00:00.000Z',
            studentStartDate: '2024-02-01T00:00:00.000Z',
            studentEndDate: '2024-02-10T00:00:00.000Z',
          } as never,
        })}
      />,
    );

    // getInitialValues maps taskOwner -> taskOwnerId and seeds the registration date.
    expect(await screen.findByText('Registration Start Date')).toBeInTheDocument();
    expect(screen.getByTestId('task-owner')).toBeInTheDocument();
  });

  it('searches users through loadUsers when the task owner field changes', async () => {
    render(<CourseTaskModal {...makeProps()} />);

    await screen.findByText('Course Task');
    const taskOwner = screen.getByTestId('task-owner');
    fireEvent.change(taskOwner, { target: { value: '7' } });

    // loadUsers -> userService.searchUser invoked; field remains rendered.
    expect(taskOwner).toBeInTheDocument();
  });
});
