import { render, screen } from '@testing-library/react';
import { NoCourse } from './';
import { Course } from '@client/services/models';

function makeCourse(overrides: Partial<Course> = {}): Course {
  return {
    id: 1,
    name: 'Course One',
    alias: 'c1',
    completed: false,
    planned: false,
    inviteOnly: false,
    ...overrides,
  } as Course;
}

describe('<NoCourse />', () => {
  it('renders registration options for each course state', () => {
    const { rerender } = render(<NoCourse courses={[]} preselectedCourses={[]} />);
    expect(screen.getByText(/not student or mentor in any active course/i)).toBeInTheDocument();
    const mentorLink = screen.getByRole('link', { name: /register as mentor/i });
    expect(mentorLink).toHaveAttribute('href', '/registry/mentor');

    rerender(<NoCourse courses={[makeCourse({ planned: false })]} preselectedCourses={[]} />);
    expect(screen.queryByRole('link', { name: /register as student/i })).not.toBeInTheDocument();
    expect(screen.getByText(/there are no any planned courses/i)).toBeInTheDocument();

    rerender(<NoCourse courses={[makeCourse({ planned: true })]} preselectedCourses={[]} />);
    const studentLink = screen.getByRole('link', { name: /register as student/i });
    expect(studentLink).toHaveAttribute('href', '/registry/student');
    expect(screen.getByText(/register to the upcoming course/i)).toBeInTheDocument();

    rerender(<NoCourse courses={[makeCourse({ planned: true, completed: true })]} preselectedCourses={[]} />);
    expect(screen.queryByRole('link', { name: /register as student/i })).not.toBeInTheDocument();

    const preselected = [makeCourse({ id: 5, name: 'Mentored', alias: 'mn' })];
    rerender(<NoCourse courses={[]} preselectedCourses={preselected} />);
    const confirm = screen.getByRole('link', { name: /confirm mentored/i });
    expect(confirm).toHaveAttribute('href', '/course/mentor/confirm?course=mn');
  });
});
