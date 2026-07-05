import { render, screen } from '@testing-library/react';
import { CheckerEnum } from '@client/api';
import { CourseTaskState, CourseTaskVerifications } from '@client/modules/AutoTest/types';
import TaskDescription from './TaskDescription';

function renderTaskDescription(courseTask: Partial<CourseTaskVerifications> = {}) {
  return render(
    <TaskDescription
      courseAlias="my-course"
      courseTask={
        {
          name: 'Course Task',
          studentStartDate: '2022-09-10T12:00:00.000Z',
          studentEndDate: '2022-10-10T12:00:00.000Z',
          checker: CheckerEnum.AutoTest,
          id: 10,
          descriptionUrl: 'https://example.com/description',
          state: CourseTaskState.Uncompleted,
          ...courseTask,
        } as CourseTaskVerifications
      }
    />,
  );
}

describe('TaskDescription', () => {
  it('should render the task name', () => {
    renderTaskDescription();

    expect(screen.getByText('Course Task')).toBeInTheDocument();
  });

  it('should render the back link to the auto-test route', () => {
    renderTaskDescription();

    const [backLink] = screen.getAllByRole('link');
    expect(backLink).toHaveAttribute('href', expect.stringContaining('my-course'));
  });

  it('should render the description link when descriptionUrl is provided', () => {
    renderTaskDescription({ descriptionUrl: 'https://example.com/task' });

    const link = screen.getByRole('link', { name: 'https://example.com/task' });
    expect(link).toHaveAttribute('href', 'https://example.com/task');
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.getByText('Description:')).toBeInTheDocument();
  });

  it('should not render the description block when descriptionUrl is empty', () => {
    renderTaskDescription({ descriptionUrl: '' });

    expect(screen.queryByText('Description:')).not.toBeInTheDocument();
  });

  it('should render the deadline dates in the YYYY-MM-DD HH:mm format', () => {
    renderTaskDescription();

    expect(screen.getByText(/2022-09-10/)).toBeInTheDocument();
    expect(screen.getByText(/2022-10-10/)).toBeInTheDocument();
  });
});
