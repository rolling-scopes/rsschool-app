import { render, screen } from '@testing-library/react';
import { MentorCard } from './MentorCard';
import { TopMentor } from '../../types';

jest.mock('next/config', () => () => ({}));

const mockMentor: TopMentor = {
  rank: 1,
  githubId: 'testmentor',
  name: 'Test Mentor',
  totalStudents: 25,
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

  it('displays rank badge correctly', () => {
    render(<MentorCard mentor={mockMentor} />);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('displays total students count', () => {
    render(<MentorCard mentor={mockMentor} />);

    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText(/certified students/i)).toBeInTheDocument();
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
    expect(link).toHaveAttribute('href', '/gratitude');
  });

  it('handles empty course stats gracefully', () => {
    const mentorWithoutCourseStats: TopMentor = {
      ...mockMentor,
      courseStats: [],
    };

    render(<MentorCard mentor={mentorWithoutCourseStats} />);

    expect(screen.getByText('Test Mentor')).toBeInTheDocument();
    expect(screen.queryByText('JS Course')).not.toBeInTheDocument();
  });

  it('applies gold rank class for rank 1', () => {
    render(<MentorCard mentor={{ ...mockMentor, rank: 1 }} />);

    const rankBadge = screen.getByText('1');
    expect(rankBadge.className).toContain('gold');
  });

  it('applies silver rank class for rank 2', () => {
    render(<MentorCard mentor={{ ...mockMentor, rank: 2 }} />);

    const rankBadge = screen.getByText('2');
    expect(rankBadge.className).toContain('silver');
  });

  it('applies bronze rank class for rank 3', () => {
    render(<MentorCard mentor={{ ...mockMentor, rank: 3 }} />);

    const rankBadge = screen.getByText('3');
    expect(rankBadge.className).toContain('bronze');
  });

  it('does not apply special rank class for ranks > 3', () => {
    render(<MentorCard mentor={{ ...mockMentor, rank: 5 }} />);

    const rankBadge = screen.getByText('5');
    expect(rankBadge.className).not.toContain('gold');
    expect(rankBadge.className).not.toContain('silver');
    expect(rankBadge.className).not.toContain('bronze');
  });

  it('renders GitHub profile link', () => {
    render(<MentorCard mentor={mockMentor} />);

    const githubLink = screen.getByText('@testmentor');
    expect(githubLink).toHaveAttribute('href', 'https://github.com/testmentor');
    expect(githubLink).toHaveAttribute('target', '_blank');
  });
});
