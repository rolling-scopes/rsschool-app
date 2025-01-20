import { render, screen } from '@testing-library/react';
import { TaskCard } from '..';
import { CheckerEnum } from 'api';
import { Course } from 'services/models';
import { CourseTaskState, CourseTaskVerifications } from 'modules/AutoTest/types';

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
});

function generateCourseTask(maxAttemptsNumber?: number): CourseTaskVerifications {
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
  } as CourseTaskVerifications;
}
