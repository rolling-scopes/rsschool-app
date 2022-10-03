import { render, screen } from '@testing-library/react';
import { ResumeCourseDto } from 'api';
import { VisibleCoursesForm } from './index';

const mockCourses = [
  {
    id: 1,
    fullName: 'Rolling Scopes School 2020 Q1: JavaScript/Front-end',
    rank: 111,
  },
  {
    id: 2,
    fullName: 'Rolling Scopes School 2020 Q3: Node.js',
    rank: 222,
  },
  {
    id: 3,
    fullName: 'Rolling Scopes School 2020 Q1: Machine Learning',
    rank: 333,
  },
  {
    id: 4,
    fullName: 'Rolling Scopes School 2020 Q4: Android',
    rank: 444,
  },
] as ResumeCourseDto[];

describe('VisibleCoursesForm', () => {
  test('should display all courses with positions', () => {
    render(<VisibleCoursesForm courses={mockCourses} visibleCourses={[]} />);

    mockCourses.forEach(({ fullName, rank }) => {
      const courseName = screen.getByText(fullName);
      const coursePosition = screen.getByText(`Position: ${rank}`);

      expect(courseName).toBeInTheDocument();
      expect(coursePosition).toBeInTheDocument();
    });
  });
});
