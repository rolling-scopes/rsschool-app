import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import MentorStatsModal from '../MentorStatsModal';
import { MentorStats } from '@common/models';

describe('MentorStatsModal', () => {
  const stats = {
    courseLocationName: 'Minsk',
    courseName: 'RS 2018 Q1',
    students: [
      {
        githubId: 'alex',
        name: 'Alex Petrov',
        isExpelled: false,
        totalScore: 3453,
        repoUrl: 'https://github.com/rolling-scopes-school/alex-RS2018Q1',
      },
      {
        githubId: 'vasya',
        name: 'Vasiliy Alexandrov',
        isExpelled: true,
        totalScore: 120,
      },
    ],
  } as const;

  it('renders title and student items with proper links and score', () => {
    render(<MentorStatsModal stats={stats as unknown as MentorStats} isVisible={true} onHide={jest.fn()} />);

    expect(screen.getByText('RS 2018 Q1 statistics')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Alex Petrov' })).toHaveAttribute('href', '/profile?githubId=alex');
    expect(screen.getByRole('link', { name: 'Vasiliy Alexandrov' })).toHaveAttribute('href', '/profile?githubId=vasya');

    expect(screen.getAllByText('Score:').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('3453')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'alex' })).toHaveAttribute('href', 'https://github.com/alex');
    expect(screen.getByRole('link', { name: 'vasya' })).toHaveAttribute('href', 'https://github.com/vasya');

    const repoLink = screen.getByRole('link', { name: 'alex-RS2018Q1' });
    expect(repoLink).toHaveAttribute('href', 'https://github.com/rolling-scopes-school/alex-RS2018Q1');
  });

  it('calls onHide when close button is clicked', () => {
    const onHide = jest.fn();
    render(<MentorStatsModal stats={stats as unknown as MentorStats} isVisible={true} onHide={onHide} />);

    const closeBtn = screen.getByLabelText('Close');
    fireEvent.click(closeBtn);
    expect(onHide).toHaveBeenCalled();
  });
});
