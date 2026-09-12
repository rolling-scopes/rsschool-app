import { fireEvent, render, screen } from '@testing-library/react';
import StatusTabs from './StatusTabs';
import { CourseTaskStatus } from '@client/modules/AutoTest/types';

describe('StatusTabs', () => {
  const onTabChangeMock = vi.fn();

  it('renders counts, handles empty statuses, and reports tab changes', () => {
    const statuses = generateStatuses(undefined, {
      [CourseTaskStatus.Available]: 2,
      [CourseTaskStatus.Missed]: 3,
      [CourseTaskStatus.Done]: 4,
    });
    const { rerender } = render(<StatusTabs statuses={statuses} onTabChange={onTabChangeMock} />);

    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();

    fireEvent.click(screen.getByText(new RegExp(CourseTaskStatus.Missed, 'i')));
    fireEvent.click(screen.getByText(new RegExp(CourseTaskStatus.Done, 'i')));
    expect(onTabChangeMock).toHaveBeenCalledWith(CourseTaskStatus.Missed);
    expect(onTabChangeMock).toHaveBeenCalledWith(CourseTaskStatus.Done);

    rerender(<StatusTabs statuses={[]} onTabChange={onTabChangeMock} />);
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });
});

function generateStatuses(count = 3, statusTypeAndCount: Record<string, number> | null = null): CourseTaskStatus[] {
  if (statusTypeAndCount) {
    const statuses: CourseTaskStatus[] = [];

    for (const statusType in statusTypeAndCount) {
      if (Object.prototype.hasOwnProperty.call(statusTypeAndCount, statusType)) {
        const statusCount = statusTypeAndCount[statusType];
        statuses.push(...new Array(statusCount).fill(statusType));
      }
    }

    return statuses;
  }

  return new Array(count).fill('').map(() => CourseTaskStatus.Missed);
}
