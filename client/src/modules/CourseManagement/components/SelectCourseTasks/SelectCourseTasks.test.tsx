import { Form } from 'antd';
import { SelectCourseTasks } from './SelectCourseTasks';
import { render, screen } from '@testing-library/react';
import { setupUser } from '@client/__tests__/setupUser';

// Boundary mock: drive the real useAsync callback through a mocked CoursesTasksApi
// so the data-fetch function (and the options mapping) actually run.
const { getCourseTasks } = vi.hoisted(() => ({ getCourseTasks: vi.fn() }));
vi.mock('@client/api', async importOriginal => {
  const actual = await importOriginal<typeof import('@client/api')>();
  function MockCoursesTasksApi() {}
  MockCoursesTasksApi.prototype.getCourseTasks = getCourseTasks;
  return { ...actual, CoursesTasksApi: MockCoursesTasksApi };
});

const renderSelectCourseTasks = () => {
  render(
    <Form>
      <SelectCourseTasks courseId={1} label="Task" />
    </Form>,
  );
};

describe('SelectCourseTasks', () => {
  const user = setupUser();

  beforeEach(() => {
    vi.clearAllMocks();
    getCourseTasks.mockResolvedValue({
      data: [
        { name: 'course 1', id: 1 },
        { name: 'course 2', id: 2 },
      ],
    });
  });

  test('renders fetched task options', async () => {
    renderSelectCourseTasks();

    const field = await screen.findByLabelText('Task');
    expect(field).toBeInTheDocument();
    expect(getCourseTasks).toHaveBeenCalledWith(1);
    await user.click(field);

    const options = await screen.findAllByRole('option');
    expect(options.length).toBe(2);
    expect(screen.getByText('course 1')).toBeInTheDocument();
  });

  test('should render an empty option list when the course has no tasks', async () => {
    getCourseTasks.mockResolvedValueOnce({ data: [] });
    renderSelectCourseTasks();

    const field = await screen.findByLabelText('Task');
    await user.click(field);

    expect(screen.queryByRole('option')).not.toBeInTheDocument();
  });
});
