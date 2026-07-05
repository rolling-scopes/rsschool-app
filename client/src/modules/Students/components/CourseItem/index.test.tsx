import { render, screen } from '@testing-library/react';
import { UserStudentCourseDto } from '@client/api';
import { CourseItem } from './index';

function makeCourse(overrides: Partial<UserStudentCourseDto> = {}): UserStudentCourseDto {
  return {
    alias: 'js',
    name: 'JS Course',
    hasCertificate: true,
    completed: true,
    studentIsExpelled: false,
    certificateId: 'cert-1',
    mentorGithubId: 'mentor1',
    mentorFullName: 'Mentor One',
    totalScore: 150,
    rank: 3,
    ...overrides,
  } as UserStudentCourseDto;
}

describe('<CourseItem />', () => {
  it('renders the course name, score and position', () => {
    render(<CourseItem course={makeCourse()} />);

    expect(screen.getByText('JS Course')).toBeInTheDocument();
    expect(screen.getByText('Score: 150')).toBeInTheDocument();
    expect(screen.getByText('Position: 3')).toBeInTheDocument();
  });

  it('renders the certificate link when a certificateId exists', () => {
    render(<CourseItem course={makeCourse()} />);

    const link = screen.getByRole('link', { name: /certificate/i });
    expect(link).toHaveAttribute('href', '/certificate/cert-1');
  });

  it('renders the mentor link when a mentor exists', () => {
    render(<CourseItem course={makeCourse()} />);

    const link = screen.getByRole('link', { name: 'Mentor One' });
    expect(link).toHaveAttribute('href', '/profile?githubId=mentor1');
  });

  it('hides the certificate link when there is no certificateId', () => {
    render(<CourseItem course={makeCourse({ certificateId: '' as never })} />);

    expect(screen.queryByRole('link', { name: /certificate/i })).not.toBeInTheDocument();
  });

  it('hides the mentor link when there is no mentor', () => {
    render(<CourseItem course={makeCourse({ mentorGithubId: '' as never })} />);

    expect(screen.queryByRole('link', { name: 'Mentor One' })).not.toBeInTheDocument();
  });

  it('hides the position when rank is falsy but still shows the score', () => {
    render(<CourseItem course={makeCourse({ rank: 0 as never })} />);

    expect(screen.queryByText(/position:/i)).not.toBeInTheDocument();
    expect(screen.getByText('Score: 150')).toBeInTheDocument();
  });
});
