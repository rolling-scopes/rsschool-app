import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { generateTasksData } from '@client/modules/Tasks/utils/test-utils';
import { FormValues } from '@client/modules/Tasks/types';
import { ModalProps } from '@client/modules/Tasks/components';
import { TasksPage } from './TasksPage';

const TASKS = generateTasksData(2);
const DISCIPLINES = [{ id: 1, name: 'JavaScript' }];

const VALID_VALUES: FormValues = {
  name: 'New Task',
  type: TASKS[0]?.type,
  discipline: 1,
  descriptionUrl: 'https://example.com/task',
  githubPrRequired: true,
  githubRepoName: 'repo',
  tags: ['tag'],
  skills: ['SKILL'],
  attributes: '{"a":1}',
};

const { getTasks, getDisciplines, getTaskCriteria, updateTask, createTask, updateTaskCriteria, createTaskCriteria } =
  vi.hoisted(() => ({
    getTasks: vi.fn(),
    getDisciplines: vi.fn(),
    getTaskCriteria: vi.fn(),
    updateTask: vi.fn(),
    createTask: vi.fn(),
    updateTaskCriteria: vi.fn(),
    createTaskCriteria: vi.fn(),
  }));

// Boundary: generated API clients. They are instantiated with `new`, so the
// mock implementations must be constructable (regular functions, not arrows).
vi.mock('@client/api', async importOriginal => {
  const actual = await importOriginal<typeof import('@client/api')>();
  return {
    ...actual,
    TasksApi: function TasksApi() {
      return { getTasks, updateTask, createTask };
    },
    TasksCriteriaApi: function TasksCriteriaApi() {
      return { getTaskCriteria, updateTaskCriteria, createTaskCriteria };
    },
    DisciplinesApi: function DisciplinesApi() {
      return { getDisciplines };
    },
  };
});

// AdminPageLayout pulls in the full header/session/theme chrome.
vi.mock('@client/shared/components/PageLayout', () => ({
  AdminPageLayout: ({ children, title }: { children: ReactNode; title: string }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

// TaskModal is heavy antd (Form + Modal + Collapse) and is covered by its own
// co-located test. Here we stub it to a lightweight harness exposing the wiring
// the page owns: submit (with controllable values) and the cancel toggle. This
// keeps the page's real handleModalSubmit / createRecord logic under test.
const { submitValues } = vi.hoisted(() => ({ submitValues: { current: {} as FormValues } }));
vi.mock('@client/modules/Tasks/components', async importOriginal => {
  const actual = await importOriginal<typeof import('@client/modules/Tasks/components')>();
  return {
    ...actual,
    TaskModal: ({ mode, handleModalSubmit, toggleModal }: ModalProps) => (
      <div role="dialog" aria-label="task-modal">
        <span>mode: {mode}</span>
        <button type="button" onClick={() => handleModalSubmit(submitValues.current)}>
          submit-modal
        </button>
        <button type="button" onClick={() => toggleModal()}>
          cancel-modal
        </button>
      </div>
    ),
  };
});

// @client/hooks is aliased to a partial mock that lacks useModalForm; provide the
// real modal-form hook (drives the modal open/edit flow) plus message/theme stubs.
vi.mock('@client/hooks', async () => {
  const real = await import('@client/shared/hooks/useModal/useModalForm');
  return {
    useModalForm: real.useModalForm,
    useMessage: () => ({ message: { error: vi.fn(), success: vi.fn() }, notification: { error: vi.fn() } }),
  };
});

vi.mock('@client/modules/Course/contexts', () => ({
  useActiveCourseContext: () => ({ courses: [] }),
}));

describe('TasksPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    submitValues.current = { ...VALID_VALUES };
    getTasks.mockResolvedValue({ data: TASKS });
    getDisciplines.mockResolvedValue({ data: DISCIPLINES });
    getTaskCriteria.mockResolvedValue({ data: { criteria: [] } });
    createTask.mockResolvedValue({ data: { id: 555 } });
    updateTask.mockResolvedValue({ data: {} });
    updateTaskCriteria.mockResolvedValue({ data: {} });
    createTaskCriteria.mockResolvedValue({ data: {} });
  });

  it('should render the page title and the Add Task button', () => {
    render(<TasksPage />);

    expect(screen.getByRole('heading', { name: 'Manage Tasks' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
  });

  it('should fetch and render the tasks in the table', async () => {
    render(<TasksPage />);

    await waitFor(() => expect(getTasks).toHaveBeenCalled());

    const firstTaskName = TASKS[0]?.name ?? '';
    expect(await screen.findByText(firstTaskName)).toBeInTheDocument();
  });

  it('should open the create modal when Add Task is clicked', async () => {
    const user = userEvent.setup();
    render(<TasksPage />);

    await waitFor(() => expect(getTasks).toHaveBeenCalled());

    await user.click(screen.getByRole('button', { name: /add task/i }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('mode: create');
  });

  it('should fetch criteria and open the edit modal when Edit is clicked', async () => {
    const user = userEvent.setup();
    render(<TasksPage />);

    await waitFor(() => expect(getTasks).toHaveBeenCalled());

    const [editLink] = await screen.findAllByText('Edit');
    await user.click(editLink as HTMLElement);

    await waitFor(() => expect(getTaskCriteria).toHaveBeenCalledWith(TASKS[0]?.id));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('mode: edit');
  });

  it('should close the modal when cancel is triggered', async () => {
    const user = userEvent.setup();
    render(<TasksPage />);

    await waitFor(() => expect(getTasks).toHaveBeenCalled());
    await user.click(screen.getByRole('button', { name: /add task/i }));

    await user.click(await screen.findByRole('button', { name: 'cancel-modal' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('should create a task and its criteria when submitting a valid new task', async () => {
    const user = userEvent.setup();
    render(<TasksPage />);

    await waitFor(() => expect(getTasks).toHaveBeenCalled());
    await user.click(screen.getByRole('button', { name: /add task/i }));
    await user.click(await screen.findByRole('button', { name: 'submit-modal' }));

    await waitFor(() => expect(createTask).toHaveBeenCalledTimes(1));
    const record = createTask.mock.calls[0]?.[0];
    expect(record).toMatchObject({
      name: 'New Task',
      disciplineId: 1,
      descriptionUrl: 'https://example.com/task',
      githubPrRequired: true,
      skills: ['skill'], // lower-cased by createRecord
    });
    await waitFor(() => expect(createTaskCriteria).toHaveBeenCalledWith(555, { criteria: [] }));
  });

  it('should update the task and existing criteria when submitting a valid edit', async () => {
    const user = userEvent.setup();
    getTaskCriteria
      .mockResolvedValueOnce({ data: { criteria: [] } }) // on edit open
      .mockResolvedValueOnce({ data: { criteria: [{ type: 'title', text: 'c1' }] } }); // during submit
    render(<TasksPage />);

    await waitFor(() => expect(getTasks).toHaveBeenCalled());
    // Use the second task (id = 1): handleModalSubmit guards on a truthy formData.id.
    const editLinks = await screen.findAllByText('Edit');
    await user.click(editLinks[1] as HTMLElement);
    await user.click(await screen.findByRole('button', { name: 'submit-modal' }));

    await waitFor(() => expect(updateTask).toHaveBeenCalledWith(TASKS[1]?.id, expect.any(Object)));
    await waitFor(() => expect(updateTaskCriteria).toHaveBeenCalledWith(TASKS[1]?.id, { criteria: [] }));
  });

  it('should create criteria during edit when the task has none yet', async () => {
    const user = userEvent.setup();
    getTaskCriteria
      .mockResolvedValueOnce({ data: { criteria: [] } }) // on edit open
      .mockResolvedValueOnce({ data: { criteria: null } }); // during submit
    render(<TasksPage />);

    await waitFor(() => expect(getTasks).toHaveBeenCalled());
    const editLinks = await screen.findAllByText('Edit');
    await user.click(editLinks[1] as HTMLElement);
    await user.click(await screen.findByRole('button', { name: 'submit-modal' }));

    await waitFor(() => expect(createTaskCriteria).toHaveBeenCalledWith(TASKS[1]?.id, { criteria: [] }));
  });

  it('should not submit when a required field is missing', async () => {
    const user = userEvent.setup();
    submitValues.current = { ...VALID_VALUES, name: undefined };
    render(<TasksPage />);

    await waitFor(() => expect(getTasks).toHaveBeenCalled());
    await user.click(screen.getByRole('button', { name: /add task/i }));
    await user.click(await screen.findByRole('button', { name: 'submit-modal' }));

    await waitFor(() => expect(getTasks).toHaveBeenCalled());
    expect(createTask).not.toHaveBeenCalled();
  });

  it('should swallow API errors during submit without crashing', async () => {
    const user = userEvent.setup();
    createTask.mockRejectedValue(new Error('boom'));
    render(<TasksPage />);

    await waitFor(() => expect(getTasks).toHaveBeenCalled());
    await user.click(screen.getByRole('button', { name: /add task/i }));
    await user.click(await screen.findByRole('button', { name: 'submit-modal' }));

    await waitFor(() => expect(createTask).toHaveBeenCalled());
    // The catch branch keeps the page mounted (modal stays open, no throw).
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should not call updateTask when the edited task has a falsy id', async () => {
    const user = userEvent.setup();
    render(<TasksPage />);

    await waitFor(() => expect(getTasks).toHaveBeenCalled());
    // First task has id 0 (falsy) → handleModalSubmit returns before updating.
    const editLinks = await screen.findAllByText('Edit');
    await user.click(editLinks[0] as HTMLElement);
    await user.click(await screen.findByRole('button', { name: 'submit-modal' }));

    await waitFor(() => expect(getTaskCriteria).toHaveBeenCalled());
    expect(updateTask).not.toHaveBeenCalled();
  });

  it('should block submit when a non-title criterion has zero score', async () => {
    const user = userEvent.setup();
    getTaskCriteria.mockResolvedValue({ data: { criteria: [{ type: 'subtask', text: 'st', max: 0 }] } });
    render(<TasksPage />);

    await waitFor(() => expect(getTasks).toHaveBeenCalled());
    const editLinks = await screen.findAllByText('Edit');
    await user.click(editLinks[1] as HTMLElement);
    await user.click(await screen.findByRole('button', { name: 'submit-modal' }));

    await waitFor(() => expect(getTaskCriteria).toHaveBeenCalled());
    expect(updateTask).not.toHaveBeenCalled();
  });

  it('defaults criteria to an empty list when the edited task returns no criteria field', async () => {
    const user = userEvent.setup();
    // getTaskCriteria with no `criteria` key on edit-open → `data.criteria ?? []` fallback.
    getTaskCriteria.mockResolvedValueOnce({ data: {} });
    render(<TasksPage />);

    await waitFor(() => expect(getTasks).toHaveBeenCalled());
    const editLinks = await screen.findAllByText('Edit');
    await user.click(editLinks[1] as HTMLElement);

    await waitFor(() => expect(getTaskCriteria).toHaveBeenCalledWith(TASKS[1]?.id));
    // The edit modal still opens normally.
    expect(await screen.findByRole('dialog')).toHaveTextContent('mode: edit');
  });

  it('applies createRecord defaults for omitted optional fields', async () => {
    const user = userEvent.setup();
    // Only the required fields are present → the `?? ''` / `?? []` defaults in createRecord engage.
    submitValues.current = {
      name: 'Minimal Task',
      type: TASKS[0]?.type,
      discipline: 1,
      descriptionUrl: 'https://example.com/min',
    } as FormValues;
    render(<TasksPage />);

    await waitFor(() => expect(getTasks).toHaveBeenCalled());
    await user.click(screen.getByRole('button', { name: /add task/i }));
    await user.click(await screen.findByRole('button', { name: 'submit-modal' }));

    await waitFor(() => expect(createTask).toHaveBeenCalledTimes(1));
    const record = createTask.mock.calls[0]?.[0];
    expect(record).toMatchObject({
      name: 'Minimal Task',
      githubPrRequired: false,
      githubRepoName: '',
      sourceGithubRepoUrl: '',
      description: '',
      tags: [],
      skills: [],
      attributes: {},
    });
  });
});
