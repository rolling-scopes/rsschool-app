import { render, screen } from '@testing-library/react';
import { CourseDto } from '@client/api';
import { CourseLabel } from './CourseLabel';

// A course without a `logo` mapped in DEFAULT_COURSE_ICONS makes CourseIcon render
// a static antd icon (no PublicSvgIcon fetch), keeping the test render-only and offline.
const baseCourse = {
  id: 1,
  name: 'JS Course',
  alias: 'js-2024',
  fullName: 'JavaScript Course 2024',
  startDate: '2024-03-01',
  personalMentoringStartDate: '2024-04-01',
  personalMentoringEndDate: '2024-06-01',
  discipline: { id: 10, name: 'JavaScript' },
  completed: false,
} as unknown as CourseDto;

describe('CourseLabel', () => {
  test('renders student and mentor labels with optional data', () => {
    const { rerender } = render(<CourseLabel course={baseCourse} isStudentForm />);

    // ` JS Course (JavaScript, Mar 2024) `
    expect(screen.getByText(/JS Course \(JavaScript, Mar 2024\)/)).toBeInTheDocument();

    const course = { ...baseCourse, discipline: undefined } as CourseDto;
    rerender(<CourseLabel course={course} isStudentForm />);

    expect(screen.getByText(/JS Course \(Mar 2024\)/)).toBeInTheDocument();
    expect(screen.queryByText(/JavaScript,/)).not.toBeInTheDocument();

    rerender(<CourseLabel course={baseCourse} />);

    // ` JS Course (Mentoring: Apr 2024-Jun 2024) `
    expect(screen.getByText(/JS Course \(Mentoring: Apr 2024-Jun 2024\)/)).toBeInTheDocument();

    const courseWithoutDates = {
      ...baseCourse,
      personalMentoringStartDate: undefined,
      personalMentoringEndDate: undefined,
    } as CourseDto;
    rerender(<CourseLabel course={courseWithoutDates} />);

    expect(screen.getByText(/JS Course \(Mentoring: -\)/)).toBeInTheDocument();
  });
});
