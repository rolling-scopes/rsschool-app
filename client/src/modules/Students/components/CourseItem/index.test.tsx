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
  it('renders course details and hides optional details when their values are absent', () => {
    const { rerender } = render(<CourseItem course={makeCourse()} />);

    expect(screen.getByText('JS Course')).toBeInTheDocument();
    expect(screen.getByText('Score: 150')).toBeInTheDocument();
    expect(screen.getByText('Position: 3')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /certificate/i })).toHaveAttribute('href', '/certificate/cert-1');
    expect(screen.getByRole('link', { name: 'Mentor One' })).toHaveAttribute('href', '/profile?githubId=mentor1');

    rerender(<CourseItem course={makeCourse({ certificateId: '' as never })} />);

    expect(screen.queryByRole('link', { name: /certificate/i })).not.toBeInTheDocument();

    rerender(<CourseItem course={makeCourse({ mentorGithubId: '' as never })} />);

    expect(screen.queryByRole('link', { name: 'Mentor One' })).not.toBeInTheDocument();

    rerender(<CourseItem course={makeCourse({ rank: 0 as never })} />);

    expect(screen.queryByText(/position:/i)).not.toBeInTheDocument();
    expect(screen.getByText('Score: 150')).toBeInTheDocument();
  });
});
