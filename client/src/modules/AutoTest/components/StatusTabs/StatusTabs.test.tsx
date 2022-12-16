import { fireEvent, render, screen } from '@testing-library/react';
import StatusTabs from './StatusTabs';
import { CourseTaskStatus } from 'modules/AutoTest/types';

describe('StatusTabs', () => {
  const onTabChangeMock = jest.fn();

  it('should render status tabs', () => {
    const statuses = generateStatuses();

    render(<StatusTabs statuses={statuses} onTabChange={onTabChangeMock} />);

    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('should render status tabs when statuses were not provided', () => {
    render(<StatusTabs statuses={[]} onTabChange={onTabChangeMock} />);

    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it.each`
    status                        | count
    ${CourseTaskStatus.Available} | ${2}
    ${CourseTaskStatus.Missed}    | ${3}
    ${CourseTaskStatus.Done}      | ${4}
  `(
    'should render badge with count of $count for "$status" tab',
    ({ status, count }: { status: string; count: number }) => {
      const statuses = generateStatuses(undefined, { [status]: count });

      render(<StatusTabs statuses={statuses} onTabChange={onTabChangeMock} />);

      expect(screen.getByText(count)).toBeInTheDocument();
    },
  );

  describe('when active tab was changed', () => {
    it.each`
      tabName
      ${CourseTaskStatus.Missed}
      ${CourseTaskStatus.Done}
    `('should call onTabChange with tab name "$tabName"', ({ tabName }: { tabName: string }) => {
      const statuses = generateStatuses(undefined, { [tabName]: 2 });
      render(<StatusTabs statuses={statuses} onTabChange={onTabChangeMock} />);

      const selectedTab = screen.getByText(new RegExp(tabName, 'i'));
      fireEvent.click(selectedTab);

      expect(onTabChangeMock).toHaveBeenCalledWith(tabName);
    });
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
