import { render, screen } from '@testing-library/react';
import { TopMentorDto } from 'api';
import { MentorCard } from './MentorCard';

jest.mock('next/config', () => () => ({}));

const mockMentor: TopMentorDto = {
  rank: 1,
  githubId: 'testmentor',
  name: 'Test Mentor',
  totalStudents: 25,
  totalGratitudes: 12,
  courseStats: [
    { courseName: 'JS Course', studentsCount: 15 },
    { courseName: 'React Course', studentsCount: 10 },
  ],
};

describe('MentorCard', () => {
  it('renders mentor name, githubId, and avatar', () => {
    render(<MentorCard mentor={mockMentor} />);

    expect(screen.getByText('Test Mentor')).toBeInTheDocument();
    expect(screen.getByText('@testmentor')).toBeInTheDocument();
    // Avatar is rendered
    expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
  });

  it('does not display rank badge', () => {
    render(<MentorCard mentor={mockMentor} />);

    expect(screen.queryByTitle('1')).not.toBeInTheDocument();
  });

  it('displays total students count', () => {
    render(<MentorCard mentor={mockMentor} />);

    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText(/certified students/i)).toBeInTheDocument();
  });

  it('displays total gratitudes count with heart emoji', () => {
    render(<MentorCard mentor={mockMentor} />);

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('❤️')).toBeInTheDocument();
  });

  it('renders course stats list', () => {
    render(<MentorCard mentor={mockMentor} />);

    expect(screen.getByText('JS Course')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('React Course')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('renders "Say Thank you!" button with link to /gratitude', () => {
    render(<MentorCard mentor={mockMentor} />);

    const link = screen.getByRole('link', { name: /say thank you/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/gratitude?githubId=testmentor');
  });

  it('handles empty course stats gracefully', () => {
    const mentorWithoutCourseStats: TopMentorDto = {
      ...mockMentor,
      courseStats: [],
    };

    render(<MentorCard mentor={mentorWithoutCourseStats} />);

    expect(screen.getByText('Test Mentor')).toBeInTheDocument();
    expect(screen.queryByText('JS Course')).not.toBeInTheDocument();
  });

  it('renders GitHub profile link', () => {
    render(<MentorCard mentor={mockMentor} />);

    const githubLink = screen.getByText('@testmentor');
    expect(githubLink).toHaveAttribute('href', 'https://github.com/testmentor');
    expect(githubLink).toHaveAttribute('target', '_blank');
  });

  it('renders zero students and gratitudes', () => {
    const mentorWithZeroValues: TopMentorDto = {
      ...mockMentor,
      totalStudents: 0,
      totalGratitudes: 0,
    };

    render(<MentorCard mentor={mentorWithZeroValues} />);

    expect(screen.getAllByText('0')).toHaveLength(2);
    expect(screen.getByText(/certified students/i)).toBeInTheDocument();
  });

  it('renders mentor when only firstName exists in name', () => {
    const mentorWithFirstNameOnly: TopMentorDto = {
      ...mockMentor,
      name: 'John',
    };

    render(<MentorCard mentor={mentorWithFirstNameOnly} />);

    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.queryByText('Test Mentor')).not.toBeInTheDocument();
  });

  it('renders mentor when only lastName exists in name', () => {
    const mentorWithLastNameOnly: TopMentorDto = {
      ...mockMentor,
      name: 'Doe',
    };

    render(<MentorCard mentor={mentorWithLastNameOnly} />);

    expect(screen.getByText('Doe')).toBeInTheDocument();
    expect(screen.queryByText('Test Mentor')).not.toBeInTheDocument();
  });

  it('renders very long course names', () => {
    const longCourseName =
      'Very Long Course Name With Many Words For Overflow Testing Very Long Course Name With Many Words For Overflow Testing';
    const mentorWithLongCourseName: TopMentorDto = {
      ...mockMentor,
      courseStats: [{ courseName: longCourseName, studentsCount: 7 }],
    };

    render(<MentorCard mentor={mentorWithLongCourseName} />);

    expect(screen.getByText(longCourseName)).toBeInTheDocument();
  });

  it('renders very long mentor names', () => {
    const longMentorName =
      'Very Long Mentor Name With Many Words For Overflow Testing Very Long Mentor Name With Many Words For Overflow Testing';
    const mentorWithLongName: TopMentorDto = {
      ...mockMentor,
      name: longMentorName,
    };

    render(<MentorCard mentor={mentorWithLongName} />);

    expect(screen.getByText(longMentorName)).toBeInTheDocument();
  });
});
