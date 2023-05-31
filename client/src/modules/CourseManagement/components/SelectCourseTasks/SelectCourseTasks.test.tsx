import { Form } from 'antd';
import { SelectCourseTasks } from './SelectCourseTasks';
import { render, screen } from '@testing-library/react';
import * as ReactUse from 'react-use';
import userEvent from '@testing-library/user-event';

const renderSelectCourseTasks = () => {
  render(
    <Form>
      <SelectCourseTasks courseId={1} label="Task" />
    </Form>,
  );
};

describe('SelectCourseTasks', () => {
  beforeAll(() => {
    // mock CoursesTasksApi call
    jest.spyOn(ReactUse, 'useAsync').mockReturnValue({
      value: [
        {
          name: 'course 1',
          id: 1,
        },
        {
          name: 'course 2',
          id: 2,
        },
      ],
      loading: false,
    });
  });

  const user = userEvent.setup();

  test('should render field with "Task" label', async () => {
    renderSelectCourseTasks();

    const field = await screen.findByLabelText('Task');
    expect(field).toBeInTheDocument();
  });

  test('should render options on select click', async () => {
    renderSelectCourseTasks();

    const field = await screen.findByLabelText('Task');

    await user.click(field);

    const options = await screen.findAllByRole('option');
    expect(options.length).toBe(2);
  });
});
