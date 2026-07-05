import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { TaskCard } from '..';
import { CheckerEnum } from '@client/api';
import { Course } from '@client/services/models';
import { CourseTaskState, CourseTaskVerifications } from '@client/modules/AutoTest/types';
import { getAutoTestTaskRoute } from '@client/services/routes';

const COURSE_MOCK = { alias: 'course-alias', id: 100 } as Course;

describe('TaskCard', () => {
  it.each`
    prop                | value
    ${'task name'}      | ${'Course Task'}
    ${'start date'}     | ${'Sep 10'}
    ${'end date'}       | ${'Oct 10'}
    ${'state'}          | ${'Missed'}
    ${'attempts count'} | ${'2 left'}
    ${'score'}          | ${'–'}
  `('should render $prop', ({ value }: { value: string }) => {
    const courseTask = generateCourseTask(2);
    render(<TaskCard course={COURSE_MOCK} courseTask={courseTask} />);

    const element = screen.getByText(new RegExp(value, 'i'));
    expect(element).toBeInTheDocument();
  });

  it('should render attempts count as "No limits" when max attempts was not provided', () => {
    const courseTask = generateCourseTask();
    render(<TaskCard course={COURSE_MOCK} courseTask={courseTask} />);

    const element = screen.getByText(/No limits/i);
    expect(element).toBeInTheDocument();
  });

  it('should render a success tag for a completed task', () => {
    const courseTask = generateCourseTask(2, { state: CourseTaskState.Completed });
    render(<TaskCard course={COURSE_MOCK} courseTask={courseTask} />);

    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('should render the uncompleted tag for any other state', () => {
    const courseTask = generateCourseTask(2, { state: CourseTaskState.Uncompleted });
    render(<TaskCard course={COURSE_MOCK} courseTask={courseTask} />);

    expect(screen.getByText('Uncompleted')).toBeInTheDocument();
  });

  it('should render the numeric score when a verification score exists', () => {
    const courseTask = generateCourseTask(2, {
      verifications: [{ score: 87 }],
    } as Partial<CourseTaskVerifications>);
    render(<TaskCard course={COURSE_MOCK} courseTask={courseTask} />);

    expect(screen.getByText('87')).toBeInTheDocument();
  });

  it('should navigate to the task route when "Open Task" is clicked', async () => {
    const user = userEvent.setup();
    const push = vi.fn();
    (useRouter as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ push });
    const courseTask = generateCourseTask(2);
    render(<TaskCard course={COURSE_MOCK} courseTask={courseTask} />);

    await user.click(screen.getByRole('button', { name: /open task/i }));

    expect(push).toHaveBeenCalledWith(getAutoTestTaskRoute(COURSE_MOCK.alias, courseTask.id));
  });

  it('does not render the "Done Task" button outside the Available tab', () => {
    const courseTask = generateCourseTask(2, passingScore());
    render(<TaskCard course={COURSE_MOCK} courseTask={courseTask} isAvailableTab={false} onMarkAsDone={vi.fn()} />);

    expect(screen.queryByRole('button', { name: /done task/i })).not.toBeInTheDocument();
  });

  it('enables "Done Task" and calls onMarkAsDone with the task id when the score reaches the threshold', async () => {
    const user = userEvent.setup();
    const onMarkAsDone = vi.fn();
    const courseTask = generateCourseTask(2, passingScore());
    render(<TaskCard course={COURSE_MOCK} courseTask={courseTask} isAvailableTab onMarkAsDone={onMarkAsDone} />);

    const button = screen.getByRole('button', { name: /done task/i });
    expect(button).toBeEnabled();

    await user.click(button);
    expect(onMarkAsDone).toHaveBeenCalledWith(courseTask.id);
  });

  it('disables "Done Task" when the score is below the threshold', () => {
    const courseTask = generateCourseTask(2, {
      verifications: [{ score: 50 }],
      publicAttributes: { maxAttemptsNumber: 2, tresholdPercentage: 80 },
    } as Partial<CourseTaskVerifications>);
    render(<TaskCard course={COURSE_MOCK} courseTask={courseTask} isAvailableTab onMarkAsDone={vi.fn()} />);

    expect(screen.getByRole('button', { name: /done task/i })).toBeDisabled();
  });
});

function passingScore(): Partial<CourseTaskVerifications> {
  return {
    verifications: [{ score: 90 }],
    publicAttributes: { maxAttemptsNumber: 2, tresholdPercentage: 80 },
  } as Partial<CourseTaskVerifications>;
}

function generateCourseTask(
  maxAttemptsNumber?: number,
  overrides: Partial<CourseTaskVerifications> = {},
): CourseTaskVerifications {
  return {
    name: 'Course Task',
    studentStartDate: '2022-09-10T12:00:00.000Z',
    studentEndDate: '2022-10-10T12:00:00.000Z',
    checker: CheckerEnum.AutoTest,
    id: 10,
    descriptionUrl: 'description-url',
    state: CourseTaskState.Missed,
    publicAttributes: {
      maxAttemptsNumber,
    },
    ...overrides,
  } as CourseTaskVerifications;
}
