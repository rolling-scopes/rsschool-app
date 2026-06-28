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
  it('always offers mentor registration', () => {
    render(<NoCourse courses={[]} preselectedCourses={[]} />);
    expect(screen.getByText(/not student or mentor in any active course/i)).toBeInTheDocument();
    // antd renders Button with href as an anchor (role="link").
    const mentorLink = screen.getByRole('link', { name: /register as mentor/i });
    expect(mentorLink).toHaveAttribute('href', '/registry/mentor');
  });

  it('hides student registration when there are no planned courses', () => {
    render(<NoCourse courses={[makeCourse({ planned: false })]} preselectedCourses={[]} />);
    expect(screen.queryByRole('link', { name: /register as student/i })).not.toBeInTheDocument();
    expect(screen.getByText(/there are no any planned courses/i)).toBeInTheDocument();
  });

  it('shows student registration and an upcoming-course hint when a planned course exists', () => {
    render(<NoCourse courses={[makeCourse({ planned: true })]} preselectedCourses={[]} />);
    const studentLink = screen.getByRole('link', { name: /register as student/i });
    expect(studentLink).toHaveAttribute('href', '/registry/student');
    expect(screen.getByText(/register to the upcoming course/i)).toBeInTheDocument();
  });

  it('treats a planned-but-completed course as not planned', () => {
    render(<NoCourse courses={[makeCourse({ planned: true, completed: true })]} preselectedCourses={[]} />);
    expect(screen.queryByRole('link', { name: /register as student/i })).not.toBeInTheDocument();
  });

  it('renders a confirm button per preselected course', () => {
    const preselected = [makeCourse({ id: 5, name: 'Mentored', alias: 'mn' })];
    render(<NoCourse courses={[]} preselectedCourses={preselected} />);
    const confirm = screen.getByRole('link', { name: /confirm mentored/i });
    expect(confirm).toHaveAttribute('href', '/course/mentor/confirm?course=mn');
  });
});
