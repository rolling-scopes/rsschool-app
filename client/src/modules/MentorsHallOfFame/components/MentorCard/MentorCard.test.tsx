import { render, screen } from '@testing-library/react';
import { TopMentorDto } from '@client/api';
import { MentorCard } from './MentorCard';

vi.mock('next/config', () => () => ({}));

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
  it('renders mentor details and handles data variants', () => {
    const { rerender } = render(<MentorCard mentor={mockMentor} />);

    expect(screen.getByText('Test Mentor')).toBeInTheDocument();
    expect(screen.getByText('@testmentor')).toBeInTheDocument();
    expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
    expect(screen.queryByTitle('1')).not.toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText(/certified students/i)).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('❤️')).toBeInTheDocument();
    expect(screen.getByText('JS Course')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('React Course')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /say thank you/i })).toBeInTheDocument();
    const githubLink = screen.getByText('@testmentor');
    expect(githubLink).toHaveAttribute('href', 'https://github.com/testmentor');
    expect(githubLink).toHaveAttribute('target', '_blank');

    rerender(<MentorCard mentor={{ ...mockMentor, courseStats: [] }} />);
    expect(screen.queryByText('JS Course')).not.toBeInTheDocument();

    rerender(<MentorCard mentor={{ ...mockMentor, totalStudents: 0, totalGratitudes: 0 }} />);
    expect(screen.getAllByText('0')).toHaveLength(2);
    expect(screen.getByText(/certified students/i)).toBeInTheDocument();

    rerender(<MentorCard mentor={{ ...mockMentor, name: 'John' }} />);
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.queryByText('Test Mentor')).not.toBeInTheDocument();

    rerender(<MentorCard mentor={{ ...mockMentor, name: 'Doe' }} />);
    expect(screen.getByText('Doe')).toBeInTheDocument();
    expect(screen.queryByText('Test Mentor')).not.toBeInTheDocument();

    const longCourseName =
      'Very Long Course Name With Many Words For Overflow Testing Very Long Course Name With Many Words For Overflow Testing';
    rerender(
      <MentorCard mentor={{ ...mockMentor, courseStats: [{ courseName: longCourseName, studentsCount: 7 }] }} />,
    );
    expect(screen.getByText(longCourseName)).toBeInTheDocument();

    const longMentorName =
      'Very Long Mentor Name With Many Words For Overflow Testing Very Long Mentor Name With Many Words For Overflow Testing';
    rerender(<MentorCard mentor={{ ...mockMentor, name: longMentorName }} />);
    expect(screen.getByText(longMentorName)).toBeInTheDocument();
  });
});
