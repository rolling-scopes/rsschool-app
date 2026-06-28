import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MainStatsCard } from './MainStatsCard';

function makeProps(overrides: Partial<Parameters<typeof MainStatsCard>[0]> = {}) {
  return {
    isActive: true,
    totalScore: 120,
    position: 5,
    maxCourseScore: 1000,
    totalStudentsCount: 200,
    ...overrides,
  };
}

describe('<MainStatsCard />', () => {
  it('renders the "Your stats" card with Position and Total Score labels', () => {
    render(<MainStatsCard {...makeProps()} />);

    expect(screen.getByText('Your stats')).toBeInTheDocument();
    expect(screen.getByText('Position')).toBeInTheDocument();
    expect(screen.getByText('Total Score')).toBeInTheDocument();
  });

  it('renders position as "rank / total" and score as "score / max"', () => {
    render(
      <MainStatsCard {...makeProps({ position: 5, totalStudentsCount: 200, totalScore: 120, maxCourseScore: 1000 })} />,
    );

    expect(screen.getByText('5 / 200')).toBeInTheDocument();
    expect(screen.getByText('120 / 1000')).toBeInTheDocument();
  });

  it('renders position without total when there are no students, and score without max when maxCourseScore is 0', () => {
    render(<MainStatsCard {...makeProps({ position: 7, totalStudentsCount: 0, totalScore: 50, maxCourseScore: 0 })} />);

    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('renders "New" when the position is at or above the default sentinel position', () => {
    render(<MainStatsCard {...makeProps({ position: 999999 })} />);

    expect(screen.getByText('New')).toBeInTheDocument();
  });
});
