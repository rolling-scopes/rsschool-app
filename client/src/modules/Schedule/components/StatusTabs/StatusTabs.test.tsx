import { render, screen } from '@testing-library/react';
import StatusTabs, { Status } from './StatusTabs';
import { SCHEDULE_STATUSES } from 'modules/Schedule/constants';
import { CourseScheduleItemDtoStatusEnum } from 'api';

const StatusEnum = CourseScheduleItemDtoStatusEnum;

describe('StatusTabs', () => {
  it('should render status tabs', () => {
    const statuses = generateStatuses();

    render(<StatusTabs statuses={statuses} />);

    const expectedStatusCount = SCHEDULE_STATUSES.length + 1; // +1 is for 'All' tab
    expect(screen.getAllByRole('tab')).toHaveLength(expectedStatusCount);
  });

  it.each`
    status                  | count
    ${StatusEnum.Done}      | ${2}
    ${StatusEnum.Available} | ${3}
    ${StatusEnum.Archived}  | ${4}
    ${StatusEnum.Future}    | ${5}
    ${StatusEnum.Review}    | ${6}
  `(
    'should render badge with count of $count for "$status" tab',
    ({ status, count }: { status: string; count: number }) => {
      const missedCount = 1;
      const statuses = generateStatuses(undefined, { [StatusEnum.Missed]: missedCount, [status]: count });

      render(<StatusTabs statuses={statuses} />);

      expect(screen.getByText(missedCount)).toBeInTheDocument();
      expect(screen.getByText(count)).toBeInTheDocument();
    },
  );

  it('should render badge with total count for "all" tab', () => {
    const missedCount = 1;
    const doneCount = 2;
    const reviewCount = 3;
    const statuses = generateStatuses(undefined, {
      missed: missedCount,
      done: doneCount,
      review: reviewCount,
    });

    render(<StatusTabs statuses={statuses} />);

    const totalCount = missedCount + doneCount + reviewCount;
    expect(screen.getByText(totalCount)).toBeInTheDocument();
  });
});

function generateStatuses(count = 3, statusTypeAndCount: Record<string, number> | null = null): Status[] {
  if (statusTypeAndCount) {
    const statuses: Status[] = [];

    for (const statusType in statusTypeAndCount) {
      if (Object.prototype.hasOwnProperty.call(statusTypeAndCount, statusType)) {
        const statusCount = statusTypeAndCount[statusType];
        statuses.push(...new Array(statusCount).fill(statusType));
      }
    }

    return statuses;
  }

  return new Array(count).fill('').map(() => StatusEnum.Missed);
}