import { render, screen } from '@testing-library/react';
import { CheckerEnum } from '@client/api';
import { CourseTaskState, CourseTaskVerifications } from '@client/modules/AutoTest/types';
import TaskDescription from './TaskDescription';

function taskDescription(courseTask: Partial<CourseTaskVerifications> = {}) {
  return (
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
    />
  );
}

describe('TaskDescription', () => {
  it('renders task details and hides the description when its URL is empty', () => {
    const { rerender } = render(taskDescription());

    expect(screen.getByText('Course Task')).toBeInTheDocument();

    const [backLink] = screen.getAllByRole('link');
    expect(backLink).toHaveAttribute('href', expect.stringContaining('my-course'));

    const link = screen.getByRole('link', { name: 'https://example.com/description' });
    expect(link).toHaveAttribute('href', 'https://example.com/description');
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.getByText('Description:')).toBeInTheDocument();

    expect(screen.getByText(/2022-09-10/)).toBeInTheDocument();
    expect(screen.getByText(/2022-10-10/)).toBeInTheDocument();

    rerender(taskDescription({ descriptionUrl: '' }));
    expect(screen.queryByText('Description:')).not.toBeInTheDocument();
  });
});
