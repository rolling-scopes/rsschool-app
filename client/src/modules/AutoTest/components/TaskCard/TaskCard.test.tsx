import { render, screen } from '@testing-library/react';
import { TaskCard, TaskCardProps } from '..';
import { CourseTaskDetailedDto, CreateCourseTaskDtoCheckerEnum } from 'api';
import { Course } from 'services/models';

const courseTask = {
  name: 'Course Task',
  studentStartDate: '2022-09-10 12:00',
  studentEndDate: '2022-10-10 12:00',
  checker: CreateCourseTaskDtoCheckerEnum.AutoTest,
  id: 10,
  descriptionUrl: 'description-url',
  publicAttributes: {
    maxAttemptsNumber: 2,
  },
} as CourseTaskDetailedDto;

const PROPS_MOCK: TaskCardProps = {
  course: { alias: 'course-alias', id: 100 } as Course,
  courseTask,
  verifications: [],
};

describe('TaskCard', () => {
  it.each`
    prop                | value
    ${'task name'}      | ${courseTask.name}
    ${'start date'}     | ${'Sep 10'}
    ${'end date'}       | ${'Oct 10'}
    ${'status'}         | ${'Missed'}
    ${'attempts count'} | ${'2 left'}
    ${'score'}          | ${'–'}
  `('should render $prop', ({ value }: { value: string }) => {
    render(<TaskCard {...PROPS_MOCK} />);

    const element = screen.getByText(new RegExp(value, 'i'));
    expect(element).toBeInTheDocument();
  });
});
