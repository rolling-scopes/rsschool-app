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
  test('student form: shows discipline, name and the friendly start month', () => {
    render(<CourseLabel course={baseCourse} isStudentForm />);

    // ` JS Course (JavaScript, Mar 2024) `
    expect(screen.getByText(/JS Course \(JavaScript, Mar 2024\)/)).toBeInTheDocument();
  });

  test('student form: omits the discipline prefix when discipline has no name', () => {
    const course = { ...baseCourse, discipline: undefined } as CourseDto;
    render(<CourseLabel course={course} isStudentForm />);

    expect(screen.getByText(/JS Course \(Mar 2024\)/)).toBeInTheDocument();
    expect(screen.queryByText(/JavaScript,/)).not.toBeInTheDocument();
  });

  test('mentor form: shows the personal mentoring date range', () => {
    render(<CourseLabel course={baseCourse} />);

    // ` JS Course (Mentoring: Apr 2024-Jun 2024) `
    expect(screen.getByText(/JS Course \(Mentoring: Apr 2024-Jun 2024\)/)).toBeInTheDocument();
  });

  test('mentor form: tolerates missing mentoring dates', () => {
    const course = {
      ...baseCourse,
      personalMentoringStartDate: undefined,
      personalMentoringEndDate: undefined,
    } as CourseDto;
    render(<CourseLabel course={course} />);

    expect(screen.getByText(/JS Course \(Mentoring: -\)/)).toBeInTheDocument();
  });
});
