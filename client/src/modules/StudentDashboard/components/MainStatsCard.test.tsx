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
  it('renders labels and formats regular, empty-total, and new-student stats', () => {
    const { rerender } = render(<MainStatsCard {...makeProps()} />);

    expect(screen.getByText('Your stats')).toBeInTheDocument();
    expect(screen.getByText('Position')).toBeInTheDocument();
    expect(screen.getByText('Total Score')).toBeInTheDocument();
    expect(screen.getByText('5 / 200')).toBeInTheDocument();
    expect(screen.getByText('120 / 1000')).toBeInTheDocument();

    rerender(
      <MainStatsCard {...makeProps({ position: 7, totalStudentsCount: 0, totalScore: 50, maxCourseScore: 0 })} />,
    );

    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();

    rerender(<MainStatsCard {...makeProps({ position: 999999 })} />);

    expect(screen.getByText('New')).toBeInTheDocument();
  });
});
